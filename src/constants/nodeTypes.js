export const NODE_W = 220;
export const NODE_H = 72;

export const NODE_TYPES = {
  trigger: {
    id: "trigger",
    label: "LINE Webhook",
    icon: "📩",
    color: "#10b981",
    category: "trigger",
    description: "รับข้อความจาก LINE OA",
    fields: [
      { key: "channelToken", label: "Channel Access Token", type: "text" },
      { key: "channelSecret", label: "Channel Secret", type: "text" },
    ],
    suggestNext: ["condition", "knowledge", "ai_response"],
  },
  condition: {
    id: "condition",
    label: "เงื่อนไข (If/Else)",
    icon: "🔀",
    color: "#f59e0b",
    category: "logic",
    description: "แยกเส้นทางตามเงื่อนไข",
    fields: [
      { key: "conditionType", label: "ประเภทเงื่อนไข", type: "select", options: ["มีคำว่า (contains)", "เริ่มต้นด้วย (startsWith)", "ตรงกับ (exact match)", "Regex"] },
      { key: "keyword", label: "คำ / Pattern", type: "text" },
    ],
    suggestNext: ["ai_response", "reply", "escalation", "knowledge"],
  },
  knowledge: {
    id: "knowledge",
    label: "Knowledge Base",
    icon: "📚",
    color: "#8b5cf6",
    category: "data",
    description: "โหลดข้อมูลจากไฟล์ .md",
    fields: [
      { key: "source", label: "แหล่งข้อมูล", type: "select", options: ["products.md", "pricing.md", "faq.md", "shipping.md", "warranty.md", "contact.md", "custom..."] },
      { key: "searchMethod", label: "วิธีค้นหา", type: "select", options: ["Keyword Match", "Semantic Search (RAG)", "ส่งทั้งหมด"] },
    ],
    suggestNext: ["ai_response", "condition"],
  },
  ai_response: {
    id: "ai_response",
    label: "AI ประมวลผล",
    icon: "🤖",
    color: "#3b82f6",
    category: "ai",
    description: "ส่งให้ AI สร้างคำตอบ",
    fields: [
      { key: "model", label: "โมเดล", type: "select", options: ["claude-haiku-4-5", "claude-sonnet-4-6", "Local LLM (Ollama)"] },
      { key: "systemPrompt", label: "System Prompt (.md)", type: "textarea" },
      { key: "maxTokens", label: "Max Tokens", type: "text" },
      { key: "temperature", label: "Temperature (0-1)", type: "text" },
    ],
    suggestNext: ["reply", "condition", "escalation"],
  },
  reply: {
    id: "reply",
    label: "ตอบกลับ LINE",
    icon: "💬",
    color: "#06b6d4",
    category: "output",
    description: "ส่งข้อความกลับไปยัง LINE",
    fields: [
      { key: "replyType", label: "ประเภทข้อความ", type: "select", options: ["Text", "Flex Message", "Image", "Quick Reply"] },
      { key: "template", label: "Template (ถ้ามี)", type: "text" },
    ],
    suggestNext: [],
  },
  escalation: {
    id: "escalation",
    label: "ส่งต่อพนักงาน",
    icon: "👤",
    color: "#ef4444",
    category: "output",
    description: "ส่งต่อให้ Human Agent",
    fields: [
      { key: "notifyChannel", label: "แจ้งเตือนผ่าน", type: "select", options: ["LINE Notify", "Slack", "Email"] },
      { key: "message", label: "ข้อความแจ้งลูกค้า", type: "textarea" },
    ],
    suggestNext: [],
  },
  delay: {
    id: "delay",
    label: "หน่วงเวลา",
    icon: "⏱️",
    color: "#78716c",
    category: "logic",
    description: "รอก่อนทำขั้นตอนถัดไป",
    fields: [{ key: "seconds", label: "วินาที", type: "text" }],
    suggestNext: ["reply", "ai_response", "condition"],
  },
  log: {
    id: "log",
    label: "บันทึก Log",
    icon: "📝",
    color: "#a3a3a3",
    category: "utility",
    description: "บันทึกข้อมูลลง Database",
    fields: [{ key: "logType", label: "ประเภท", type: "select", options: ["MongoDB", "SQLite", "File (.json)"] }],
    suggestNext: ["reply", "escalation"],
  },
};

export const CATEGORIES = {
  trigger: { label: "Trigger", color: "#10b981" },
  logic: { label: "Logic", color: "#f59e0b" },
  data: { label: "Data", color: "#8b5cf6" },
  ai: { label: "AI", color: "#3b82f6" },
  output: { label: "Output", color: "#06b6d4" },
  utility: { label: "Utility", color: "#78716c" },
};
