import { useState } from "react";
import { useSettings } from "../hooks/useSettings";

export default function SettingsPanel({ onClose }) {
  const { apiKey, setApiKey } = useSettings();
  const [input, setInput] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const masked = apiKey ? apiKey.slice(0, 10) + "••••••••••••••••" : "";

  return (
    <div style={{
      position: "absolute", right: 16, top: 70, width: 340,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, zIndex: 60, padding: 20,
      boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      animation: "panelIn .2s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>⚙️ Settings</div>
        <button style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 16 }} onClick={onClose}>✕</button>
      </div>

      {/* API Key status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: apiKey ? "#10b981" : "#f59e0b" }} />
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          {apiKey ? `Anthropic API Key: ${masked}` : "ยังไม่ได้ตั้งค่า API Key"}
        </span>
      </div>

      {/* Input */}
      <div className="field-label">Anthropic API Key</div>
      <input
        className="field-input"
        type="password"
        placeholder="sk-ant-api03-..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <button
        onClick={handleSave}
        style={{
          width: "100%", padding: "9px", borderRadius: 8, border: "none",
          background: saved ? "#10b981" : "var(--accent)", color: "white",
          fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          transition: "background .2s",
        }}
      >
        {saved ? "✓ บันทึกแล้ว" : "บันทึก API Key"}
      </button>

      <div style={{ marginTop: 14, fontSize: 10, color: "var(--text-dim)", lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>รองรับ AI Models</div>
        <div>• claude-haiku-4-5 (เร็ว ประหยัด)</div>
        <div>• claude-sonnet-4-6 (แนะนำ)</div>
        <div>• Local LLM via Ollama (ฟรี)</div>
        <div style={{ marginTop: 8, color: "var(--text-dim)" }}>
          Key เก็บใน localStorage และส่งไป server อัตโนมัติ
        </div>
      </div>
    </div>
  );
}
