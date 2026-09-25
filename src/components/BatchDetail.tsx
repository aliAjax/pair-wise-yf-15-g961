import { useEffect, useState } from "react";
import type { Batch } from "../types";
import type { Stage } from "../types";
import { STAGES } from "../types";
import {
  accumulatedHeat,
  averageTemp,
  heatToNext,
  stageOfBatch,
} from "../lib/thermal";
import { formatDateTime } from "../lib/time";

interface Props {
  batch: Batch;
  onNoteChange: (note: string) => void;
  onDelete: () => void;
}

const STAGE_LABEL: Record<Stage, string> = {
  卵: "卵期",
  幼虫: "幼虫期",
  蛹: "蛹期",
  成虫: "成虫期",
};

/** 单个样本详情卡片：信息随所选批次联动，鉴定备注直接编辑保存 */
export function BatchDetail({ batch, onNoteChange, onDelete }: Props) {
  const stage = stageOfBatch(batch);
  const heat = accumulatedHeat(batch);
  const avg = averageTemp(batch);
  const next = heatToNext(heat);
  const [note, setNote] = useState(batch.note);
  const [saved, setSaved] = useState(false);

  // 切换批次时，表单内容跟着所选批次显示
  useEffect(() => {
    setNote(batch.note);
    setSaved(false);
  }, [batch.id, batch.note]);

  const saveNote = () => {
    onNoteChange(note);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const totalDays = batch.temperatures.reduce((s, r) => s + r.durationDays, 0);
  const recordCount = batch.temperatures.length;

  return (
    <div className="detail">
      <div className="detail-head">
        <div>
          <p className="eyebrow">样本详情卡片</p>
          <h3>{batch.code}</h3>
          <p className="case-link">
            关联案件：<span>{batch.caseNo || "未关联"}</span>
          </p>
        </div>
        <div className={"stage-badge stage-tag-" + stage}>
          <small>当前发育阶段</small>
          <strong>{STAGE_LABEL[stage]}</strong>
        </div>
      </div>

      <div className="stage-track">
        {STAGES.map((s) => (
          <span
            key={s}
            className={"track-dot" + (STAGES.indexOf(s) <= STAGES.indexOf(stage) ? " reached" : "")}
          >
            {s}
          </span>
        ))}
      </div>

      <dl className="detail-grid">
        <div>
          <dt>昆虫种类</dt>
          <dd>{batch.species || "—"}</dd>
        </div>
        <div>
          <dt>采样地点</dt>
          <dd>{batch.location || "—"}</dd>
        </div>
        <div>
          <dt>尸体暴露阶段</dt>
          <dd>{batch.exposure || "—"}</dd>
        </div>
        <div>
          <dt>保存方式</dt>
          <dd>{batch.preservation || "—"}</dd>
        </div>
        <div>
          <dt>建台时间</dt>
          <dd>{formatDateTime(batch.createdAt)}</dd>
        </div>
        <div>
          <dt>温度记录</dt>
          <dd>
            {recordCount} 条 · 共 {totalDays} 日
          </dd>
        </div>
        <div>
          <dt>平均环境温度</dt>
          <dd>{avg !== null ? `${avg} ℃` : "—"}</dd>
        </div>
        <div>
          <dt>累计有效积温</dt>
          <dd>
            <strong>{heat}</strong> 日·度
          </dd>
        </div>
      </dl>

      <p className="next-hint">
        {next
          ? `再累积 ${next.delta} 日·度进入${STAGE_LABEL[next.stage]}`
          : "已完成全部发育阶段"}
      </p>

      <section className="note-box">
        <div className="heading">
          <div>
            <p className="eyebrow">鉴定备注</p>
            <h4>随批次保存</h4>
          </div>
          <span className={"save-flag" + (saved ? " show" : "")}>已保存</span>
        </div>
        <textarea
          rows={3}
          placeholder="填写鉴定意见、复核要求、拍照编号等…"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
        />
        <div className="note-actions">
          <button type="button" className="primary" onClick={saveNote}>
            保存备注
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (window.confirm(`确定删除批次 ${batch.code} 及其全部温度记录？`)) onDelete();
            }}
          >
            删除批次
          </button>
        </div>
      </section>

      {recordCount > 0 && (
        <p className="hint">
          累计积温由 {recordCount} 条温度记录合计 {heat} 日·度；温度改正后此处数值与曲线同步重算。
        </p>
      )}
    </div>
  );
}
