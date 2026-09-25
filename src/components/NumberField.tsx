import { useState } from "react";

interface NumberFieldProps {
  value: number;
  onCommit: (value: number) => void;
  step?: string;
  min?: string;
  ariaLabel?: string;
}

/**
 * 可编辑数字输入：输入过程中保留草稿，合法数字即时提交（触发重算），
 * 失焦后回显已提交的值，避免受控 number 输入无法清空的问题。
 */
export function NumberField({ value, onCommit, step, min, ariaLabel }: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="number"
      aria-label={ariaLabel}
      step={step}
      min={min}
      value={draft ?? String(value)}
      onChange={(e) => {
        setDraft(e.target.value);
        const parsed = Number.parseFloat(e.target.value);
        if (Number.isFinite(parsed)) onCommit(parsed);
      }}
      onBlur={() => setDraft(null)}
    />
  );
}
