import type { Batch, TempRecord } from "../domain/types";
import { accumulateRecords, nextStageGap, BASE_TEMPERATURE } from "../domain/degreeDays";
import type { BatchSummary } from "../store/useBatches";
import { NumberField } from "./NumberField";
import { TemperatureChart } from "./TemperatureChart";
import { TempRecordForm } from "./TempRecordForm";
import { STAGE_COLORS } from "./BatchList";

interface BatchDetailProps {
  summary: BatchSummary;
  allBatches: Batch[];
  onSelectBatch: (id: string) => void;
  onUpdateNotes: (notes: string) => void;
  onAddRecord: (record: Omit<TempRecord, "id">) => void;
  onUpdateRecord: (recordId: string, patch: Partial<Omit<TempRecord, "id">>) => void;
  onRemoveRecord: (recordId: string) => void;
  onRemoveBatch: () => void;
}

function fmtTime(iso: string): string {
  return iso.replace("T", " ");
}

/** 选中批次的详情卡片：基础信息、案件关联、鉴定备注、温度台账与积温曲线 */
export function BatchDetail({
  summary,
  allBatches,
  onSelectBatch,
  onUpdateNotes,
  onAddRecord,
  onUpdateRecord,
  onRemoveRecord,
  onRemoveBatch,
}: BatchDetailProps) {
  const { batch, total, stage } = summary;
  const points = accumulateRecords(batch.records);
  const gap = nextStageGap(total);
  const related = allBatches.filter((b) => b.caseNo === batch.caseNo && b.id !== batch.id);

  return (
    <section className="panel detail">
      <div className="heading">
        <div>
          <p>样本详情卡片</p>
          <h2>
            {batch.code}{" "}
            <span className="stage-badge" style={{ background: STAGE_COLORS[stage] }}>
              {stage}
            </span>
          </h2>
        </div>
        <button className="danger" onClick={onRemoveBatch}>
          删除批次
        </button>
      </div>

      <div className="info-grid">
        <div>
          <small>关联案件</small>
          <b>{batch.caseNo}</b>
        </div>
        <div>
          <small>采样地点</small>
          <b>{batch.location}</b>
        </div>
        <div>
          <small>昆虫种类</small>
          <b>{batch.species}</b>
        </div>
        <div>
          <small>暴露阶段</small>
          <b>{batch.exposureStage}</b>
        </div>
        <div>
          <small>保存方式</small>
          <b>{batch.preservative}</b>
        </div>
        <div>
          <small>累计有效积温（&gt;{BASE_TEMPERATURE}℃）</small>
          <b>
            {total.toFixed(1)} 度·日
            {gap ? ` · 距${gap.stage}还差 ${gap.remaining.toFixed(1)}` : " · 已完成发育"}
          </b>
        </div>
      </div>

      {related.length > 0 && (
        <div className="related">
          <small>案件关联（{batch.caseNo} 的其他批次）</small>
          <div className="chips">
            {related.map((b) => (
              <button key={b.id} className="chip" onClick={() => onSelectBatch(b.id)}>
                {b.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="notes">
        <span>鉴定备注</span>
        <textarea
          rows={2}
          placeholder="填写鉴定备注，随批次一起保存"
          value={batch.notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
        />
      </label>

      <h3>积温曲线</h3>
      <TemperatureChart points={points} />

      <h3>温度记录（{points.length}）</h3>
      {points.length > 0 && (
        <table className="temp-table">
          <thead>
            <tr>
              <th>采样时间</th>
              <th>温度（℃）</th>
              <th>持续（h）</th>
              <th>有效积温</th>
              <th>累计</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {points.map(({ record, contribution, total: acc }) => (
              <tr key={record.id}>
                <td>{fmtTime(record.sampledAt)}</td>
                <td>
                  <NumberField
                    value={record.temperature}
                    step="0.1"
                    ariaLabel="修改温度"
                    onCommit={(v) => onUpdateRecord(record.id, { temperature: v })}
                  />
                </td>
                <td>
                  <NumberField
                    value={record.durationHours}
                    step="1"
                    min="0"
                    ariaLabel="修改持续时间"
                    onCommit={(v) => onUpdateRecord(record.id, { durationHours: Math.max(0, v) })}
                  />
                </td>
                <td>{contribution.toFixed(1)}</td>
                <td>{acc.toFixed(1)}</td>
                <td>
                  <button className="link" onClick={() => onRemoveRecord(record.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <TempRecordForm onAdd={onAddRecord} />
    </section>
  );
}
