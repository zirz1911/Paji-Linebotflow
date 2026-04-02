/**
 * Flow Engine — execute flow graph for incoming LINE message
 */

/**
 * @param {object} flow  — { nodes, connections, knowledge }
 * @param {object} event — LINE message event
 * @returns {string|null} reply text, or null if no reply
 */
async function runFlow(flow, event, apiKey = "") {
  if (!flow?.nodes?.length) {
    console.log("[FLOW] No flow deployed yet");
    return null;
  }

  const { nodes, connections, knowledge = [] } = flow;
  const userText = event.message?.text || "";
  const userId = event.source?.userId || "";

  console.log(`[FLOW] Running — nodes:${nodes.length} conns:${connections.length} text:"${userText}"`);

  // Build adjacency: nodeId -> [nextNodeId, ...]
  const graph = {};
  connections.forEach(({ from, to }) => {
    if (!graph[from]) graph[from] = [];
    graph[from].push(to);
  });

  // Start from trigger node
  const triggerNode = nodes.find((n) => n.type === "trigger");
  if (!triggerNode) { console.log("[FLOW] No trigger node"); return null; }

  // Context passed between nodes
  const ctx = { userText, userId, knowledgeContext: "", aiResponse: "" };

  // Walk graph BFS from trigger
  const queue = (graph[triggerNode.id] || []).slice();
  const visited = new Set([triggerNode.id]);

  console.log(`[FLOW] Start from trigger → next: [${queue.join(", ")}]`);

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    console.log(`[FLOW] Execute node: ${node.type} (${node.id})`);
    const result = await executeNode(node, ctx, knowledge, apiKey);

    if (result?.reply) { console.log(`[FLOW] Reply: "${result.reply}"`); return result.reply; }
    if (result?.stop) { console.log(`[FLOW] Stopped at condition`); return null; }

    // Continue to next nodes
    const nextIds = graph[nodeId] || [];
    nextIds.forEach((id) => { if (!visited.has(id)) queue.push(id); });
  }

  return null;
}

async function executeNode(node, ctx, knowledgeFiles, apiKey = "") {
  switch (node.type) {

    case "condition": {
      const { conditionType = "มีคำว่า (contains)", keyword = "" } = node.data;
      if (!keyword) return null;

      let matched = false;
      const text = ctx.userText.toLowerCase();
      const kw = keyword.toLowerCase();

      if (conditionType.includes("contains")) matched = text.includes(kw);
      else if (conditionType.includes("startsWith")) matched = text.startsWith(kw);
      else if (conditionType.includes("exact")) matched = text === kw;
      else if (conditionType.includes("Regex")) {
        try { matched = new RegExp(keyword, "i").test(ctx.userText); } catch { matched = false; }
      }

      if (!matched) return { stop: true }; // ไม่ผ่าน condition — หยุด branch นี้
      return null;
    }

    case "knowledge": {
      const { source = "", searchMethod = "Keyword Match" } = node.data;
      console.log(`[KNOWLEDGE] source="${source}" method="${searchMethod}" files=${JSON.stringify(knowledgeFiles.map(f => f.name))}`);
      const file = knowledgeFiles.find((f) => f.name === source);
      if (!file) {
        console.warn(`[KNOWLEDGE] File "${source}" not found in knowledge base`);
        return null;
      }
      console.log(`[KNOWLEDGE] Found "${source}" — ${file.content?.length || 0} chars`);

      if (searchMethod === "ส่งทั้งหมด") {
        ctx.knowledgeContext = file.content;
      } else {
        // Keyword match — ดึงเฉพาะ section ที่ match
        const lines = file.content.split("\n");
        const matched = lines.filter((l) =>
          l.toLowerCase().includes(ctx.userText.toLowerCase())
        );
        ctx.knowledgeContext = matched.length > 0 ? matched.join("\n") : file.content;
      }
      console.log(`[KNOWLEDGE] Context set — ${ctx.knowledgeContext.length} chars`);
      return null;
    }

    case "ai_response": {
      const { model = "claude-haiku-4-5", systemPrompt = "", maxTokens = "500" } = node.data;

      const system = [systemPrompt, ctx.knowledgeContext]
        .filter(Boolean)
        .join("\n\n---\n\nKnowledge Base:\n") || "You are a helpful LINE chatbot assistant.";
      console.log(`[AI] model=${model} systemLen=${system.length} hasKnowledge=${!!ctx.knowledgeContext}`);

      try {
        const response = await callAI(model, system, ctx.userText, parseInt(maxTokens) || 500, apiKey);
        ctx.aiResponse = response;
      } catch (err) {
        console.error("[AI] Error:", err.message);
        ctx.aiResponse = "ขออภัย ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง";
      }
      return null;
    }

    case "reply": {
      const { replyType = "Text", template = "" } = node.data;

      // ถ้ามี template ใช้ template แทน (รองรับ {{ai}} และ {{text}})
      if (template) {
        const text = template
          .replace("{{ai}}", ctx.aiResponse)
          .replace("{{text}}", ctx.userText)
          .replace("{{user}}", ctx.userId);
        return { reply: text };
      }

      // ถ้ามี AI response ใช้ AI response
      if (ctx.aiResponse) return { reply: ctx.aiResponse };

      // fallback echo
      return { reply: `ได้รับ: ${ctx.userText}` };
    }

    case "escalation": {
      const { message = "กรุณารอสักครู่ เจ้าหน้าที่จะติดต่อกลับโดยเร็ว 🙏" } = node.data;
      return { reply: message };
    }

    case "delay": {
      const ms = (parseInt(node.data.seconds) || 1) * 1000;
      await new Promise((r) => setTimeout(r, Math.min(ms, 5000))); // max 5s
      return null;
    }

    case "log": {
      console.log("[LOG]", { userId: ctx.userId, text: ctx.userText, time: new Date().toISOString() });
      return null;
    }

    default:
      return null;
  }
}

async function callAI(model, system, userMessage, maxTokens, apiKey = "") {
  // รองรับ Claude models
  if (model.includes("claude")) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set — ใส่ใน Settings panel หรือ server/.env");
    apiKey = key;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model === "claude-haiku-4-5" ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.content[0].text;
  }

  // Local LLM (Ollama)
  if (model.includes("Ollama")) {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `System: ${system}\n\nUser: ${userMessage}`,
        stream: false,
      }),
    });
    if (!res.ok) throw new Error("Ollama error");
    const data = await res.json();
    return data.response;
  }

  throw new Error(`Unknown model: ${model}`);
}

module.exports = { runFlow };
