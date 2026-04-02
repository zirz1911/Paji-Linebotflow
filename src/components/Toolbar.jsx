import { useState } from "react";

export default function Toolbar({
  flowName, onRename, onBack,
  nodeCount, connectionCount,
  showKnowledge, knowledgeCount,
  onToggleKnowledge, onExport, onReset,
  onDeploy, deployStatus, onSettings,
}) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(flowName || "");

  const commitRename = () => {
    if (nameInput.trim()) onRename?.(nameInput.trim());
    setEditing(false);
  };

  return (
    <div className="toolbar">
      {/* Back */}
      {onBack && (
        <>
          <button className="toolbar-btn" onClick={onBack} title="กลับหน้าหลัก">
            ←
          </button>
          <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />
        </>
      )}

      {/* Flow name */}
      {editing ? (
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditing(false); }}
          style={{ background: "var(--surface2)", border: "1px solid var(--accent)", borderRadius: 6, padding: "4px 8px", color: "var(--text)", fontSize: 12, fontFamily: "inherit", width: 140, outline: "none" }}
        />
      ) : (
        <span
          onClick={() => { setNameInput(flowName); setEditing(true); }}
          title="คลิกเพื่อเปลี่ยนชื่อ"
          style={{ fontSize: 12, fontWeight: 600, padding: "7px 8px", cursor: "text", color: "var(--text)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {flowName}
        </span>
      )}

      <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />

      <button className={`toolbar-btn ${showKnowledge ? "active" : ""}`} onClick={onToggleKnowledge}>
        📚 Knowledge <span className="badge">{knowledgeCount}</span>
      </button>
      <button className="toolbar-btn" onClick={onExport}>📤 Export</button>
      <button
        className="toolbar-btn"
        onClick={onDeploy}
        style={deployStatus === "ok" ? { color: "#10b981" } : deployStatus === "error" ? { color: "#ef4444" } : {}}
      >
        {deployStatus === "ok" ? "✓ Deployed" : deployStatus === "error" ? "✗ Failed" : "🚀 Deploy"}
      </button>
      <button className="toolbar-btn" onClick={onReset}>🗑️ Reset</button>

      <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />
      <span style={{ fontSize: 11, color: "var(--text-dim)", padding: "7px 6px" }}>
        {nodeCount} nodes · {connectionCount} conns
      </span>

      {onSettings && (
        <>
          <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />
          <button className="toolbar-btn" onClick={onSettings} title="Settings">⚙️</button>
        </>
      )}
    </div>
  );
}
