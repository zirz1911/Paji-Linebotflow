import { useState } from "react";

const INITIAL_FILES = [
  { name: "products.md", content: "# สินค้า\n\n## สินค้า A\n- ราคา: 590 บาท\n\n## สินค้า B\n- ราคา: 890 บาท" },
  { name: "faq.md", content: "# คำถามที่พบบ่อย\n\nQ: สั่งซื้อยังไง?\nA: ทักแชทได้เลยค่ะ" },
  { name: "shipping.md", content: "# การจัดส่ง\n\n- ส่งฟรีเมื่อซื้อครบ 500 บาท" },
];

export function useKnowledge() {
  const [knowledgeFiles, setKnowledgeFiles] = useState(INITIAL_FILES);
  const [editingFile, setEditingFile] = useState(null);

  const addFile = (name) => {
    setKnowledgeFiles((prev) => [
      ...prev,
      { name, content: `# ${name.replace(".md", "")}\n\nเพิ่มข้อมูลที่นี่...` },
    ]);
    setEditingFile(knowledgeFiles.length);
  };

  const deleteFile = (index) => {
    setKnowledgeFiles((prev) => prev.filter((_, i) => i !== index));
    setEditingFile(null);
  };

  const updateFileContent = (index, content) => {
    setKnowledgeFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, content } : f))
    );
  };

  return {
    knowledgeFiles,
    editingFile,
    setEditingFile,
    addFile,
    deleteFile,
    updateFileContent,
  };
}
