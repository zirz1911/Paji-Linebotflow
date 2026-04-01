export default function Toolbar({
  nodeCount,
  connectionCount,
  showKnowledge,
  knowledgeCount,
  onToggleKnowledge,
  onExport,
  onReset,
  onDeploy,
  deployStatus,
}) {
  return (
    <div className="toolbar">
      <button
        className={`toolbar-btn ${showKnowledge ? "active" : ""}`}
        onClick={onToggleKnowledge}
      >
        📚 Knowledge <span className="badge">{knowledgeCount}</span>
      </button>
      <button className="toolbar-btn" onClick={onExport}>
        📤 Export
      </button>
      <button
        className="toolbar-btn"
        onClick={onDeploy}
        style={deployStatus === "ok" ? { color: "#10b981" } : deployStatus === "error" ? { color: "#ef4444" } : {}}
      >
        {deployStatus === "ok" ? "✓ Deployed" : deployStatus === "error" ? "✗ Failed" : "🚀 Deploy"}
      </button>
      <button className="toolbar-btn" onClick={onReset}>
        🗑️ Reset
      </button>
      <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
      <span style={{ fontSize: 11, color: "var(--text-dim)", padding: "7px 6px" }}>
        {nodeCount} nodes · {connectionCount} conns
      </span>
    </div>
  );
}
