import type { Batch, Stage } from "../types";
import { accumulatedHeat, averageTemp, stageOfBatch } from "../lib/thermal";

interface Props {
  batches: Batch[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** 样本批次列表：每条显示批次号、案件、积温与当前发育阶段 */
export function BatchList({ batches, selectedId, onSelect }: Props) {
  if (batches.length === 0) {
    return <p className="empty">当前筛选下没有批次。</p>;
  }

  return (
    <div className="batch-list">
      {batches.map((b) => {
        const heat = accumulatedHeat(b);
        const stage: Stage = stageOfBatch(b);
        const avg = averageTemp(b);
        const active = b.id === selectedId;
        return (
          <button
            type="button"
            key={b.id}
            className={"batch-item stage-" + stage + (active ? " selected" : "")}
            onClick={() => onSelect(b.id)}
          >
            <span className="batch-head">
              <b>{b.code}</b>
              <em className={"stage-tag stage-tag-" + stage}>{stage}</em>
            </span>
            <span className="batch-meta">
              {b.caseNo || "未关联案件"}
              {" · "}
              {b.species || "未填种类"}
            </span>
            <span className="batch-meta">
              有效积温 <strong>{heat}</strong> 日·度
              {avg !== null && <> · 平均 {avg}℃</>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
