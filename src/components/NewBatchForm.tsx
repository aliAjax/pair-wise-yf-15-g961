import { useState } from "react";
import type { NewBatchInput } from "../store/useBatches";

const EMPTY: NewBatchInput = {
  code: "",
  caseNo: "",
  location: "",
  species: "",
  exposureStage: "",
  preservative: "",
};

const FIELDS: { key: keyof NewBatchInput; label: string; placeholder: string }[] = [
  { key: "code", label: "批次编号", placeholder: "如 CASE-058-A" },
  { key: "caseNo", label: "关联案件号", placeholder: "如 CASE-058" },
  { key: "location", label: "采样地点", placeholder: "填写采样地点" },
  { key: "species", label: "昆虫种类", placeholder: "填写昆虫种类" },
  { key: "exposureStage", label: "暴露阶段", placeholder: "如 新鲜期 / 腐败期" },
  { key: "preservative", label: "保存方式", placeholder: "如 乙醇保存" },
];

interface NewBatchFormProps {
  onAdd: (input: NewBatchInput) => void;
}

export function NewBatchForm({ onAdd }: NewBatchFormProps) {
  const [draft, setDraft] = useState<NewBatchInput>(EMPTY);
  const [error, setError] = useState("");

  function submit() {
    if (!draft.code.trim()) return setError("批次编号不能为空。");
    if (!draft.caseNo.trim()) return setError("关联案件号不能为空。");
    onAdd({
      code: draft.code.trim(),
      caseNo: draft.caseNo.trim(),
      location: draft.location.trim() || "未填写",
      species: draft.species.trim() || "待鉴定",
      exposureStage: draft.exposureStage.trim() || "未填写",
      preservative: draft.preservative.trim() || "未填写",
    });
    setDraft(EMPTY);
    setError("");
  }

  return (
    <section className="panel form-panel">
      <div className="heading">
        <div>
          <p>专业字段</p>
          <h2>新增样本批次</h2>
        </div>
        <button className="primary" onClick={submit}>
          保存批次
        </button>
      </div>
      <div className="field-grid">
        {FIELDS.map((f) => (
          <label key={f.key}>
            <span>{f.label}</span>
            <input
              placeholder={f.placeholder}
              value={draft[f.key]}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
