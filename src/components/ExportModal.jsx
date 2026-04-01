export default function ExportModal({ config, onClose }) {
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="export-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>📤 Export Flow Config</div>
          <button
            style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 18, cursor: "pointer" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
          ใช้ JSON นี้ใน Backend (Node.js / Python) เพื่อ execute flow
        </div>
        <pre style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, fontSize: 11, lineHeight: 1.6, overflow: "auto", maxHeight: 400, color: "var(--text)", whiteSpace: "pre-wrap" }}>
          {config}
        </pre>
        <button
          style={{ marginTop: 12, padding: "10px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: 10, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          onClick={() => navigator.clipboard.writeText(config)}
        >
          📋 Copy to Clipboard
        </button>
      </div>
    </>
  );
}
