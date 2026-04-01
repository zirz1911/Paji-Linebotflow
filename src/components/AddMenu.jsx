import { NODE_TYPES } from "../constants/nodeTypes";

export default function AddMenu({ showAddMenu, canvasOffset, addNode }) {
  if (!showAddMenu) return null;

  return (
    <div
      className="add-menu"
      style={{
        left: showAddMenu.x + canvasOffset.x,
        top: showAddMenu.y + canvasOffset.y,
        zIndex: 100,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", padding: "4px 12px 10px", letterSpacing: "0.5px" }}>
        ⚡ แนะนำ NODE ถัดไป
      </div>

      {showAddMenu.suggestions.map((typeId, si) => {
        const t = NODE_TYPES[typeId];
        return (
          <div
            key={typeId}
            className="menu-item suggested"
            onClick={() =>
              addNode(
                typeId,
                showAddMenu.x - canvasOffset.x,
                showAddMenu.y - canvasOffset.y + si * 100,
                showAddMenu.fromNodeId
              )
            }
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: t.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              {t.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{t.description}</div>
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0", paddingTop: 8 }}>
        <div style={{ fontSize: 10, color: "var(--text-dim)", padding: "0 12px 6px" }}>ทั้งหมด</div>
        {Object.values(NODE_TYPES)
          .filter((t) => t.id !== "trigger" && !showAddMenu.suggestions.includes(t.id))
          .map((t) => (
            <div
              key={t.id}
              className="menu-item"
              onClick={() =>
                addNode(
                  t.id,
                  showAddMenu.x - canvasOffset.x,
                  showAddMenu.y - canvasOffset.y,
                  showAddMenu.fromNodeId
                )
              }
            >
              <div style={{ width: 26, height: 26, borderRadius: 7, background: t.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                {t.icon}
              </div>
              <div style={{ fontSize: 11 }}>{t.label}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
