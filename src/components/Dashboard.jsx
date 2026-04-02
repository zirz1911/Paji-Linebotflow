import { useState, useEffect } from "react";
import { useFlows } from "../hooks/useFlows";
import { useRouter } from "../hooks/useRouter";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "เมื่อกี้";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

export default function Dashboard() {
  const flows = useFlows();
  const { navigate } = useRouter();
  const [list, setList] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { setList(flows.getAll()); }, []);

  const handleNew = () => {
    const id = flows.createFlow();
    navigate(`/editor/${id}`);
  };

  const handleDelete = (id) => {
    flows.deleteFlow(id);
    setList(flows.getAll());
    setDeleting(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'JetBrains Mono','SF Mono',monospace" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>📩</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Paji Linebotflow</span>
        </div>
        <button
          onClick={handleNew}
          style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
        >
          + สร้าง Flow ใหม่
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Workflows ของฉัน</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{list.length} flows</div>
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-dim)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>ยังไม่มี Flow</div>
            <div style={{ fontSize: 12, marginBottom: 24 }}>กด "สร้าง Flow ใหม่" เพื่อเริ่มต้น</div>
            <button
              onClick={handleNew}
              style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
            >
              + สร้าง Flow ใหม่
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {list.map((flow) => (
              <div
                key={flow.id}
                style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14, padding: 20, cursor: "pointer", transition: "border-color .2s, box-shadow .2s", position: "relative" }}
                onClick={() => navigate(`/editor/${flow.id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 20px var(--accent-glow)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Icon + Name */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-glow)", border: "1px solid var(--accent)40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    🔀
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{flow.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>แก้ไขล่าสุด {timeAgo(flow.updatedAt)}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--surface2)", padding: "3px 8px", borderRadius: 6 }}>
                    {flow.nodes?.length || 0} nodes
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--surface2)", padding: "3px 8px", borderRadius: 6 }}>
                    {flow.connections?.length || 0} connections
                  </div>
                  {flow.knowledgeFiles?.length > 0 && (
                    <div style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--surface2)", padding: "3px 8px", borderRadius: 6 }}>
                      📚 {flow.knowledgeFiles.length} files
                    </div>
                  )}
                </div>

                {/* Delete button */}
                {deleting === flow.id ? (
                  <div
                    style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => handleDelete(flow.id)} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>ยืนยันลบ</button>
                    <button onClick={() => setDeleting(null)} style={{ background: "var(--surface2)", color: "var(--text-dim)", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>ยกเลิก</button>
                  </div>
                ) : (
                  <button
                    style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-dim)", fontSize: 14, cursor: "pointer", opacity: 0, transition: "opacity .2s", padding: "2px 6px", borderRadius: 6 }}
                    onClick={(e) => { e.stopPropagation(); setDeleting(flow.id); }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            {/* New flow card */}
            <div
              onClick={handleNew}
              style={{ border: "1.5px dashed var(--border)", borderRadius: 14, padding: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 120, color: "var(--text-dim)", transition: "border-color .2s, color .2s", gap: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}
            >
              <span style={{ fontSize: 24 }}>+</span>
              <span style={{ fontSize: 12 }}>สร้าง Flow ใหม่</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
