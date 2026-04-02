import { useState } from "react";

const INITIAL_FILES = [
  { name: "products.md", content: "# สินค้า\n\n## สินค้า A\n- ราคา: 590 บาท\n\n## สินค้า B\n- ราคา: 890 บาท" },
  { name: "faq.md", content: "# คำถามที่พบบ่อย\n\nQ: สั่งซื้อยังไง?\nA: ทักแชทได้เลยค่ะ" },
  { name: "shipping.md", content: "# การจัดส่ง\n\n- ส่งฟรีเมื่อซื้อครบ 500 บาท" },
  {
    name: "minsoft.md",
    content: `# บริการของ Minsoft Thailand

## รายการโปรแกรมทั้งหมด

1. **MaxCare** — โปรแกรมฟาร์มเฟสบุ๊ค ราคา 1,700 บาท/เดือน
2. **MaxSystem** — โปรแกรมฟาร์มเฟสบุ๊ค แบบมือถือจำลอง ราคา 1,700 บาท/เดือน
3. **MaxPhoneFarm** — โปรแกรมฟาร์มเฟสบุ๊ค แบบมือถือ (สอบถามเพิ่มเติม)
4. **MaxTwitter** — โปรแกรมฟาร์มทวิตเตอร์ ราคา 1,700 บาท/เดือน
5. **Maxreup** — โปรแกรมโพสต์คลิป Reels ราคา 1,700 บาท/เดือน
6. **MaxPage** — โปรแกรมฟาร์มเพจเฟสบุ๊ค ราคา 1,700 บาท/เดือน
7. **CloudPhoneTiktok** — โปรแกรมฟาร์ม Tiktok แบบมือถือ (สอบถามเพิ่มเติม) 🆕
8. **MaxInstagramPhone** — โปรแกรมฟาร์ม IG แบบมือถือ (สอบถามเพิ่มเติม) 🆕
9. **MaxInsta Chrome** — โปรแกรมฟาร์ม IG แบบโครม ราคา 1,700 บาท/เดือน 🆕

## ข้อกำหนดระบบ

- รองรับ Windows เท่านั้น
- ความละเอียดหน้าจอแนะนำ 1920x1080 พิกเซล

## หมายเหตุ

สนใจบริการข้อใด แจ้งระบุเพื่อขอรายละเอียดเพิ่มเติมได้เลยค่ะ`,
  },
];

export function useKnowledge(initialFiles = null) {
  const [knowledgeFiles, setKnowledgeFiles] = useState(initialFiles ?? INITIAL_FILES);
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
