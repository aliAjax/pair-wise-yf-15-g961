import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { STAGES } from "./types";
import type { Stage } from "./types";
import { useBatches } from "./hooks/useBatches";
import { stageOfBatch } from "./lib/thermal";
import { StageFilter } from "./components/StageFilter";
import { BatchList } from "./components/BatchList";
import { NewBatchForm } from "./components/NewBatchForm";
import { TemperatureLog } from "./components/TemperatureLog";
import { DevelopmentCurve } from "./components/DevelopmentCurve";
import { BatchDetail } from "./components/BatchDetail";

function App() {
  const {
    batches,
    stats,
    addBatch,
    removeBatch,
    addTemperature,
    updateTemperature,
    removeTemperature,
    updateNote,
  } = useBatches();

  const [filter, setFilter] = useState<Stage | "全部">("全部");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleBatches = useMemo(
    () => (filter === "全部" ? batches : batches.filter((b) => stageOfBatch(b) === filter)),
    [batches, filter]
  );

  // 选中项只在批次被删除时才切换；阶段筛选只影响左侧列表，不打断正在查看/编辑的批次
  useEffect(() => {
    if (selectedId && batches.some((b) => b.id === selectedId)) return;
    setSelectedId(visibleBatches[0]?.id ?? batches[0]?.id ?? null);
  }, [batches, visibleBatches, selectedId]);

  const selected = batches.find((b) => b.id === selectedId) ?? null;
  const selectedStage = selected ? stageOfBatch(selected) : null;

  const counts = useMemo(() => {
    const c = { 卵: 0, 幼虫: 0, 蛹: 0, 成虫: 0 } as Record<Stage, number>;
    for (const b of batches) c[stageOfBatch(b)] += 1;
    return c;
  }, [batches]);

  return (
    <main className="app">
      <section className="hero">
        <p>hxyfront-62003 · 发育积温台账 · Port 62003</p>
        <h1>法医昆虫学样本发育进度台账</h1>
        <span>
          每批样本记录采样时间、环境温度与温度持续时间，按高于 10℃ 的部分累加有效积温；
          累计 20 / 45 / 80 日·度依次进入幼虫、蛹、成虫。温度改正后阶段与曲线即时重算，数据保存在本机。
        </span>
      </section>

      <section className="metrics">
        <article>
          <small>样本批次</small>
          <strong>{stats.batchCount}</strong>
        </article>
        <article>
          <small>平均温度(℃)</small>
          <strong>{stats.avgTemp ?? "—"}</strong>
        </article>
        <article>
          <small>当前各阶段（卵/幼/蛹/成）</small>
          <strong className="stage-numbers">
            {STAGES.map((s) => counts[s]).join(" / ")}
          </strong>
        </article>
        <article>
          <small>待补鉴定备注</small>
          <strong>{stats.pendingNote}</strong>
        </article>
      </section>

      <section className="workspace">
        <aside className="panel sidebar">
          <h2>发育阶段筛选</h2>
          <StageFilter
            value={filter}
            counts={counts}
            total={batches.length}
            onChange={(s) => {
              setFilter(s);
              const first =
                s === "全部" ? batches[0] : batches.find((b) => stageOfBatch(b) === s);
              if (first) setSelectedId(first.id);
            }}
          />

          <h2 className="with-gap">样本批次</h2>
          <BatchList batches={visibleBatches} selectedId={selectedId} onSelect={setSelectedId} />

          <div className="new-batch-slot">
            <NewBatchForm
              onCreate={(v) => {
                const id = addBatch(v);
                setFilter("全部");
                setSelectedId(id);
              }}
            />
          </div>
        </aside>

        <section className="main-col">
          {selected ? (
            <>
              <section className="panel">
                <BatchDetail
                  key={selected.id}
                  batch={selected}
                  onNoteChange={(note) => updateNote(selected.id, note)}
                  onDelete={() => removeBatch(selected.id)}
                />
              </section>

              <section className="panel">
                <div className="heading">
                  <div>
                    <p className="eyebrow">温度记录 · {selected.code}</p>
                    <h2>采样温度与持续时间</h2>
                  </div>
                  {selectedStage && (
                    <em className={"stage-tag stage-tag-" + selectedStage}>
                      判定阶段：{selectedStage}
                    </em>
                  )}
                </div>
                <TemperatureLog
                  batch={selected}
                  onAdd={(sampledAt, tempC, durationDays) =>
                    addTemperature(selected.id, sampledAt, tempC, durationDays)
                  }
                  onUpdate={(recordId, patch) =>
                    updateTemperature(selected.id, recordId, patch)
                  }
                  onRemove={(recordId) => removeTemperature(selected.id, recordId)}
                />
              </section>

              <section className="panel">
                <div className="heading">
                  <div>
                    <p className="eyebrow">发育进度曲线</p>
                    <h2>累计有效积温随发育日数变化</h2>
                  </div>
                </div>
                <DevelopmentCurve batch={selected} />
              </section>
            </>
          ) : (
            <section className="panel empty-state">
              <h2>尚未选择批次</h2>
              <p>从左侧选择一批样本，或登记新批次后开始录入温度记录。</p>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
