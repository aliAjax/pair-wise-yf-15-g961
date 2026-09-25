import "./styles.css";
import { useMemo } from "react";
import { useBatches } from "./store/useBatches";
import { BatchList } from "./components/BatchList";
import { BatchDetail } from "./components/BatchDetail";
import { NewBatchForm } from "./components/NewBatchForm";

const project = {
  id: "hxyfront-62003",
  sourceNo: 5,
  port: 62003,
  title: "法医昆虫学样本记录",
  domain: "法医昆虫学",
  prompt:
    "发育进度台账：每批样本记录采样时间、环境温度与持续时间，按高于 10℃ 部分累加有效积温，20 度·日进入幼虫、45 进入蛹、80 进入成虫。温度录错可直接改，阶段与曲线实时重算。",
};

function App() {
  const { summaries, visibleSummaries, selected, selectedId, stageFilter, actions } = useBatches();

  const metrics = useMemo(() => {
    const allRecords = summaries.flatMap((s) => s.batch.records);
    const avgTemp =
      allRecords.length === 0
        ? "—"
        : (allRecords.reduce((sum, r) => sum + r.temperature, 0) / allRecords.length).toFixed(1) + "℃";
    return [
      { label: "样本批次", value: String(summaries.length) },
      { label: "平均温度", value: avgTemp },
      { label: "发育阶段", value: `${summaries.filter((s) => s.stage === "成虫").length} 批成虫` },
      { label: "待鉴定", value: String(summaries.filter((s) => !s.batch.notes.trim()).length) },
    ];
  }, [summaries]);

  const selectedSummary = summaries.find((s) => s.batch.id === selected?.id) ?? null;

  return (
    <main className="app">
      <section className="hero">
        <p>
          {project.id} · 源提示词{project.sourceNo} · Port {project.port}
        </p>
        <h1>{project.title}</h1>
        <span>{project.prompt}</span>
      </section>

      <section className="metrics">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <small>{metric.label}</small>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="workspace">
        <BatchList
          summaries={visibleSummaries}
          selectedId={selectedId}
          filter={stageFilter}
          onFilterChange={actions.setStageFilter}
          onSelect={actions.selectBatch}
        />

        {selectedSummary ? (
          <BatchDetail
            summary={selectedSummary}
            allBatches={summaries.map((s) => s.batch)}
            onSelectBatch={actions.selectBatch}
            onUpdateNotes={(notes) => actions.updateNotes(selectedSummary.batch.id, notes)}
            onAddRecord={(record) => actions.addRecord(selectedSummary.batch.id, record)}
            onUpdateRecord={(recordId, patch) =>
              actions.updateRecord(selectedSummary.batch.id, recordId, patch)
            }
            onRemoveRecord={(recordId) => actions.removeRecord(selectedSummary.batch.id, recordId)}
            onRemoveBatch={() => actions.removeBatch(selectedSummary.batch.id)}
          />
        ) : (
          <section className="panel detail">
            <p className="empty-hint">暂无批次，请在下方新增样本批次。</p>
          </section>
        )}
      </section>

      <NewBatchForm onAdd={actions.addBatch} />
    </main>
  );
}

export default App;
