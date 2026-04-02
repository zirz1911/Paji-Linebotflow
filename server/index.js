require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const { runFlow } = require("./flowEngine");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// ── Flow Config + Settings ────────────────────────────────────
let currentFlow = null;
let runtimeApiKey = process.env.ANTHROPIC_API_KEY || "";

function getCredentials() {
  const triggerNode = currentFlow?.nodes?.find((n) => n.type === "trigger");
  if (triggerNode?.data?.channelSecret && triggerNode?.data?.channelToken) {
    return {
      channelSecret: triggerNode.data.channelSecret,
      channelAccessToken: triggerNode.data.channelToken,
    };
  }
  return {
    channelSecret: process.env.LINE_CHANNEL_SECRET || "",
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  };
}

// ── Webhook (raw body required for signature verify) ──────────
app.post("/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  const creds = getCredentials();

  if (!creds.channelSecret) {
    console.log("[WEBHOOK] No credentials yet");
    return res.status(200).send("OK");
  }

  // LINE Verify request มี body ว่าง — ตอบ 200 ทันที
  const bodyStr = req.body?.toString() || "";
  if (!bodyStr || bodyStr === "{}") {
    console.log("[WEBHOOK] Verify request — OK");
    return res.status(200).send("OK");
  }

  const signature = req.headers["x-line-signature"] || "";
  const hash = crypto
    .createHmac("sha256", creds.channelSecret)
    .update(req.body)
    .digest("base64");

  if (hash !== signature) {
    console.warn("[WEBHOOK] Invalid signature — เช็ค Channel Secret ใน trigger node");
    return res.status(200).send("OK"); // ตอบ 200 เพื่อไม่ให้ LINE suspend
  }

  let parsed;
  try { parsed = JSON.parse(bodyStr); }
  catch { return res.status(200).send("OK"); }

  const { events = [] } = parsed;

  for (const event of events) {
    if (event.type !== "message") continue;
    console.log("[EVENT]", event.type, event.message?.text || event.message?.type);

    // รัน flow engine
    const replyText = await runFlow(currentFlow, event, runtimeApiKey);
    if (replyText && event.replyToken) {
      await replyMessage(event.replyToken, replyText, creds.channelAccessToken);
    }
  }

  res.status(200).send("OK");
});

async function replyMessage(replyToken, text, token) {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) console.error("[REPLY] Failed:", await res.text());
}

// ── REST API ──────────────────────────────────────────────────
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/info", (req, res) => {
  const creds = getCredentials();
  res.json({
    webhookUrl: `http://localhost:${PORT}/webhook`,
    configured: !!(creds.channelSecret && creds.channelAccessToken),
    credentialSource: currentFlow ? "trigger node" : ".env",
  });
});

app.get("/api/credentials", (req, res) => {
  const creds = getCredentials();
  res.json({ ...creds, configured: !!(creds.channelSecret && creds.channelAccessToken) });
});

app.post("/api/settings", (req, res) => {
  const { apiKey } = req.body || {};
  if (apiKey) { runtimeApiKey = apiKey; console.log("[SETTINGS] API key updated ✓"); }
  res.json({ ok: true });
});

app.post("/api/flow", (req, res) => {
  currentFlow = req.body;
  const creds = getCredentials();
  const kFiles = (currentFlow?.knowledge || []).map(f => `${f.name}(${f.content?.length || 0}c)`);
  console.log("[FLOW] Saved — credentials:", creds.channelSecret ? "✓" : "✗ not set");
  console.log("[FLOW] Knowledge files:", kFiles.length > 0 ? kFiles.join(", ") : "none");
  res.json({ ok: true });
});

app.get("/api/flow", (req, res) => {
  res.json(currentFlow || { nodes: [], connections: [], knowledge: [] });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  LINE OA Flow Server                     ║
╠══════════════════════════════════════════╣
║  http://localhost:${PORT}                    ║
║  POST /webhook   ← LINE events           ║
║  GET  /api/credentials ← Python poll     ║
╚══════════════════════════════════════════╝
  `);
  console.log("💡 ใส่ Channel Secret & Token ใน trigger node แล้วกด Deploy");
});
