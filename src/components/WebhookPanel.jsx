import { useState, useEffect } from "react";

const SERVER_URL = "http://localhost:3001";

export default function WebhookPanel({ onClose }) {
  const [info, setInfo] = useState(null);
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/info`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo({ error: true }));
  }, []);

  const webhookUrl = tunnelUrl
    ? `${tunnelUrl.replace(/\/$/, "")}/webhook`
    : "http://localhost:3001/webhook";

  const copy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const serverOnline = info && !info.error;
  const credConfigured = info?.configured;
  const credSource = info?.credentialSource;

  return (
    <div style={{
      position: "absolute", right: 16, top: 70, width: 360,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, zIndex: 60, padding: 20,
      boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      animation: "panelIn .2s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>🔗 Webhook URL</div>
        <button style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 16 }} onClick={onClose}>✕</button>
      </div>

      {/* Server status */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: info?.error ? "#ef4444" : serverOnline ? "#10b981" : "#f59e0b" }} />
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            {info?.error ? "Server offline" : serverOnline ? "Server online" : "Connecting..."}
          </span>
          {info?.error && (
            <code style={{ fontSize: 10, background: "var(--surface2)", padding: "1px 5px", borderRadius: 4 }}>cd server && node index.js</code>
          )}
        </div>

        {/* Credentials status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: credConfigured ? "#10b981" : "#f59e0b" }} />
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            {credConfigured
              ? `Channel credentials พร้อม ✓ (จาก ${credSource})`
              : "ยังไม่มี credentials — คลิก trigger node ใส่ Channel Secret & Token แล้วกด Deploy"}
          </span>
        </div>
      </div>

      {/* Webhook URL display */}
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: "var(--text)", wordBreak: "break-all" }}>{webhookUrl}</span>
        <button
          onClick={copy}
          style={{ background: copied ? "#10b981" : "var(--accent)", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Tunnel URL input */}
      <div className="field-label">Tunnel URL (cloudflared / ngrok)</div>
      <input
        className="field-input"
        type="text"
        placeholder="https://xxxx.trycloudflare.com"
        value={tunnelUrl}
        onChange={(e) => setTunnelUrl(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {/* Steps */}
      <div style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 2 }}>
        <div style={{ fontWeight: 600, marginBottom: 2, color: "var(--text)" }}>วิธีตั้งค่า</div>
        <div>1. คลิก <strong>📩 LINE Webhook</strong> (trigger node)</div>
        <div>2. ใส่ <strong>Channel Secret</strong> และ <strong>Channel Access Token</strong></div>
        <div>3. กด <strong>🚀 Deploy</strong></div>
        <div>4. รัน tunnel: <code style={{ background: "var(--surface2)", padding: "1px 5px", borderRadius: 4 }}>./start-line-tunnel.sh 3001</code></div>
        <div>5. วาง tunnel URL ช่องด้านบน → Copy Webhook URL</div>
        <div>6. วางใน <strong>LINE Developers Console → Webhook URL</strong></div>
      </div>
    </div>
  );
}
