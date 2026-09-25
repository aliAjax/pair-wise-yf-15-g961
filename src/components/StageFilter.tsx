import type { Stage } from "../types";
import { STAGES } from "../types";

interface Props {
  value: Stage | "全部";
  counts: Record<Stage, number>;
  total: number;
  onChange: (stage: Stage | "全部") => void;
}

/** 发育阶段筛选：筛选只影响批次列表，不改动任何台账数据 */
export function StageFilter({ value, counts, total, onChange }: Props) {
  const options: Array<Stage | "全部"> = ["全部", ...STAGES];
  return (
    <div className="chips">
      {options.map((s) => {
        const active = value === s;
        const count = s === "全部" ? total : counts[s];
        return (
          <button
            key={s}
            type="button"
            className={"chip" + (active ? " chip-active" : "")}
            aria-pressed={active}
            onClick={() => onChange(s)}
          >
            {s}
            <small>{count}</small>
          </button>
        );
      })}
    </div>
  );
}
