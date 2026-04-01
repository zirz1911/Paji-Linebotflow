import { NODE_TYPES, CATEGORIES } from "../../constants/nodeTypes";

export default function PropertiesPanel({ node, addNode, deleteNode, updateNodeData }) {
  if (!node) return null;
  const typeDef = NODE_TYPES[node.type];

  return (
    <div className="panel">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: typeDef.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
          {typeDef.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{typeDef.label}</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{typeDef.description}</div>
        </div>
      </div>

      {/* Category badge */}
      <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, background: typeDef.color + "15", color: typeDef.color, fontSize: 10, fontWeight: 600, marginBottom: 16 }}>
        {CATEGORIES[typeDef.category]?.label}
      </div>

      {/* Fields */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>⚙️ ตั้งค่า</div>
        {typeDef.fields.map((field) => (
          <div key={field.key}>
            <div className="field-label">{field.label}</div>
            {field.type === "select" ? (
              <select
                className="field-input"
                value={node.data[field.key] || ""}
                onChange={(e) => updateNodeData(node.id, field.key, e.target.value)}
              >
                <option value="">-- เลือก --</option>
                {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                className="field-input"
                value={node.data[field.key] || ""}
                onChange={(e) => updateNodeData(node.id, field.key, e.target.value)}
                placeholder={`ใส่ ${field.label}...`}
              />
            ) : (
              <input
                className="field-input"
                type="text"
                value={node.data[field.key] || ""}
                onChange={(e) => updateNodeData(node.id, field.key, e.target.value)}
                placeholder={`ใส่ ${field.label}...`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Suggest next nodes */}
      {typeDef.suggestNext.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⚡ ต่อ Node ถัดไป</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {typeDef.suggestNext.map((s, i) => {
              const t = NODE_TYPES[s];
              return (
                <button
                  key={s}
                  onClick={() => addNode(s, node.x + 280, node.y + i * 100, node.id)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${t.color}40`, background: t.color + "10", color: t.color, fontSize: 11, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                >
                  {t.icon} {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete button */}
      {node.id !== "node-1" && (
        <button className="delete-btn" onClick={() => deleteNode(node.id)}>
          🗑️ ลบ Node นี้
        </button>
      )}
    </div>
  );
}
