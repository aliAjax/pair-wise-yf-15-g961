import type { Stage } from "../domain/types";
import { STAGE_ORDER } from "../domain/degreeDays";
import type { BatchSummary, StageFilter } from "../store/useBatches";

export const STAGE_COLORS: Record<Stage, string> = {
  卵: "#64748b",
  幼虫: "#365314",
  蛹: "#a16207",
  成虫: "#dc2626",
};

interface BatchListProps {
  summaries: BatchSummary[];
  selectedId: string | null;
  filter: StageFilter;
  onFilterChange: (filter: StageFilter) => void;
  onSelect: (id: string) => void;
}

export function BatchList({ summaries, selectedId, filter, onFilterChange, onSelect }: BatchListProps) {
  return (
    <aside className="panel">
      <h2>发育阶段筛选</h2>
      <div className="chips">
        {(["全部", ...STAGE_ORDER] as StageFilter[]).map((item) => (
          <button
            key={item}
            className={filter === item ? "chip active" : "chip"}
            onClick={() => onFilterChange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <h2 className="list-title">样本批次（{summaries.length}）</h2>
      <div className="batch-list">
        {summaries.length === 0 && <p className="empty-hint">当前阶段下没有批次。</p>}
        {summaries.map(({ batch, total, stage }) => (
          <button
            key={batch.id}
            className={batch.id === selectedId ? "batch-item active" : "batch-item"}
            onClick={() => onSelect(batch.id)}
          >
            <span className="batch-head">
              <strong>{batch.code}</strong>
              <span className="stage-badge" style={{ background: STAGE_COLORS[stage] }}>
                {stage}
              </span>
            </span>
            <span className="batch-meta">
              {batch.location} · 积温 {total.toFixed(1)} 度·日 · {batch.records.length} 条温度
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
