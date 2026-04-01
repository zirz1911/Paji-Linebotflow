export default function KnowledgePanel({
  knowledgeFiles,
  editingFile,
  setEditingFile,
  addFile,
  deleteFile,
  updateFileContent,
}) {
  const handleAddFile = () => {
    const name = prompt("ชื่อไฟล์ (เช่น promotions.md):");
    if (name) addFile(name);
  };

  return (
    <div className="knowledge-panel">
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>📚 Knowledge Base</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>จัดการไฟล์ .md ข้อมูลผลิตภัณฑ์</div>
        </div>
        <button
          style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
          onClick={handleAddFile}
        >
          + เพิ่มไฟล์
        </button>
      </div>

      {/* File list + editor */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* File tabs */}
        <div style={{ width: editingFile !== null ? 130 : "100%", borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          {knowledgeFiles.map((file, i) => (
            <div
              key={i}
              className={`file-tab ${editingFile === i ? "active" : ""}`}
              onClick={() => setEditingFile(i)}
            >
              <span style={{ fontSize: 14 }}>📄</span>
              <span style={{ fontSize: 11, flex: 1 }}>{file.name}</span>
              <span style={{ fontSize: 9, color: "var(--text-dim)" }}>{file.content.length}b</span>
            </div>
          ))}
        </div>

        {/* Editor */}
        {editingFile !== null && knowledgeFiles[editingFile] && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{knowledgeFiles[editingFile].name}</span>
              <button
                style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 11, cursor: "pointer" }}
                onClick={() => deleteFile(editingFile)}
              >
                🗑️ ลบ
              </button>
            </div>
            <textarea
              value={knowledgeFiles[editingFile].content}
              onChange={(e) => updateFileContent(editingFile, e.target.value)}
              style={{ flex: 1, padding: 14, background: "var(--surface2)", border: "none", color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, lineHeight: 1.8, resize: "none", outline: "none" }}
              placeholder="เขียนข้อมูลผลิตภัณฑ์ในรูปแบบ Markdown..."
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
