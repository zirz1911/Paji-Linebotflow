import { NODE_TYPES, NODE_H } from "../../constants/nodeTypes";

function OutputPort({ node, yOff, handlePortMouseDown }) {
  const typeDef = NODE_TYPES[node.type];
  return (
    <div
      onMouseDown={(e) => handlePortMouseDown(e, node.id)}
      title="ลากเพื่อเชื่อม node"
      style={{
        position: "absolute",
        right: -10,
        top: `calc(30% + ${yOff}px)`,
        transform: "translateY(-50%)",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: typeDef.color,
        border: "3px solid var(--bg)",
        cursor: "crosshair",
        zIndex: 20,
        boxShadow: `0 0 8px ${typeDef.color}80`,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-50%) scale(1.5)";
        e.currentTarget.style.boxShadow = `0 0 14px ${typeDef.color}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        e.currentTarget.style.boxShadow = `0 0 8px ${typeDef.color}80`;
      }}
    />
  );
}

function OutputPorts({ node, portPositions, handlePortMouseDown }) {
  const typeDef = NODE_TYPES[node.type];
  const outs = portPositions.outMap[node.id] || [];
  if (typeDef.suggestNext.length === 0 && outs.length === 0) return null;

  const count = Math.max(outs.length, 1);
  const spacing = Math.min(18, (NODE_H - 24) / Math.max(count - 1, 1));
  const totalH = spacing * (count - 1);

  return Array.from({ length: count }).map((_, idx) => {
    const yOff = count <= 1 ? 0 : -totalH / 2 + idx * spacing;
    return (
      <OutputPort
        key={`op-${idx}`}
        node={node}
        yOff={yOff}
        handlePortMouseDown={handlePortMouseDown}
      />
    );
  });
}

function InputPorts({ node, portPositions, nodes, isDropTarget }) {
  if (node.type === "trigger") return null;
  const ins = portPositions.inMap[node.id] || [];
  const count = Math.max(ins.length, 1);
  const spacing = Math.min(18, (NODE_H - 24) / Math.max(count - 1, 1));
  const totalH = spacing * (count - 1);

  return Array.from({ length: count }).map((_, idx) => {
    const yOff = count <= 1 ? 0 : -totalH / 2 + idx * spacing;
    const src = ins[idx] ? nodes.find((n) => n.id === ins[idx]) : null;
    const color = src ? NODE_TYPES[src.type]?.color || "#6366f1" : isDropTarget ? "#6366f1" : "var(--border)";
    return (
      <div
        key={`ip-${idx}`}
        style={{
          position: "absolute",
          left: -8,
          top: `calc(50% + ${yOff}px)`,
          transform: "translateY(-50%)",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: color,
          border: `3px solid var(--bg)`,
          zIndex: 10,
          boxShadow: isDropTarget ? `0 0 12px #6366f1` : `0 0 6px ${color}50`,
          transition: "all 0.15s",
        }}
      />
    );
  });
}

export default function NodeCard({
  node,
  nodes,
  isSelected,
  isDropTarget,
  canvasOffset,
  portPositions,
  handleNodeMouseDown,
  handlePortMouseDown,
  onSelect,
  openAddMenu,
}) {
  const typeDef = NODE_TYPES[node.type];
  const outCount = (portPositions.outMap[node.id] || []).length;

  return (
    <div
      className={`node-card ${isSelected ? "selected" : ""} ${isDropTarget ? "drop-target" : ""}`}
      style={{ left: node.x + canvasOffset.x, top: node.y + canvasOffset.y, zIndex: isSelected ? 4 : 3 }}
      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
    >
      <InputPorts node={node} portPositions={portPositions} nodes={nodes} isDropTarget={isDropTarget} />

      <div className="node-header">
        <div className="node-icon" style={{ background: typeDef.color + "20", color: typeDef.color }}>
          {typeDef.icon}
        </div>
        <div>
          <div className="node-title">{typeDef.label}</div>
          <div className="node-desc">{typeDef.description}</div>
        </div>
      </div>

      <OutputPorts node={node} portPositions={portPositions} handlePortMouseDown={handlePortMouseDown} />

      {outCount > 1 && <div className="conn-badge">{outCount}</div>}

      {typeDef.suggestNext.length > 0 && (
        <div
          className="add-btn"
          onClick={(e) => { e.stopPropagation(); openAddMenu(node.id); }}
          title="เพิ่ม node ถัดไป"
        >
          +
        </div>
      )}
    </div>
  );
}
