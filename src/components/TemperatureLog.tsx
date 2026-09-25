import { useState } from "react";
import type { Batch, TempRecord } from "../types";
import { BASE_TEMP, accumulatedHeat, effectiveTemp, recordHeat } from "../lib/thermal";
import { formatDateTime, toLocalInput } from "../lib/time";

interface Props {
  batch: Batch;
  onAdd: (sampledAt: string, tempC: number, durationDays: number) => void;
  onUpdate: (
    recordId: string,
    patch: { sampledAt?: string; tempC?: number; durationDays?: number }
  ) => void;
  onRemove: (recordId: string) => void;
}

interface FormState {
  sampledAt: string;
  temp: string;
  duration: string;
}

const nowInput = () => toLocalInput(new Date());

/** 温度记录表：录入与改正都在这里，保存后积温、阶段、曲线由计算层统一重算 */
export function TemperatureLog({ batch, onAdd, onUpdate, onRemove }: Props) {
  const [form, setForm] = useState<FormState>({
    sampledAt: nowInput(),
    temp: "",
    duration: "1",
  });
  const [error, setError] = useState("");

  const submit = () => {
    const tempC = Number(form.temp);
    const durationDays = Number(form.duration);
    if (!form.sampledAt) return setError("请选择采样时间");
    if (!Number.isFinite(tempC) || form.temp === "") return setError("请填写有效温度（数字）");
    if (!Number.isFinite(durationDays) || form.duration === "" || durationDays <= 0)
      return setError("持续时间须为大于 0 的数字（日）");
    onAdd(form.sampledAt, tempC, durationDays);
    setForm({ sampledAt: nowInput(), temp: "", duration: "1" });
    setError("");
  };

  const ordered = [...batch.temperatures].sort(
    (a, b) => Date.parse(a.sampledAt) - Date.parse(b.sampledAt)
  );

  return (
    <div className="temp-log">
      <table>
        <thead>
          <tr>
            <th>采样时间</th>
            <th>环境温度(℃)</th>
            <th>持续(日)</th>
            <th>有效温度(℃)</th>
            <th>有效积温(日·度)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((r) => (
            <TempRow key={r.id} record={r} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
          {ordered.length === 0 && (
            <tr>
              <td colSpan={6} className="empty">
                还没有温度记录，先在下方录入第一条。
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="temp-add">
        <label>
          <span>采样时间</span>
          <input
            type="datetime-local"
            value={form.sampledAt}
            onChange={(e) => setForm((f) => ({ ...f, sampledAt: e.target.value }))}
          />
        </label>
        <label>
          <span>环境温度(℃)</span>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="如 28.6"
            value={form.temp}
            onChange={(e) => setForm((f) => ({ ...f, temp: e.target.value }))}
          />
        </label>
        <label>
          <span>持续时间(日)</span>
          <input
            type="number"
            step="0.5"
            min="0"
            inputMode="decimal"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
          />
        </label>
        <button type="button" className="primary" onClick={submit}>
          录入温度
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <p className="hint">
        发育起点 {BASE_TEMP}℃：仅按高于 {BASE_TEMP}℃ 的部分累加（有效温度 × 持续日数）。
        当前累计 <strong>{accumulatedHeat(batch)}</strong> 日·度。
      </p>
    </div>
  );
}

function TempRow({
  record,
  onUpdate,
  onRemove,
}: {
  record: TempRecord;
  onUpdate: Props["onUpdate"];
  onRemove: Props["onRemove"];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    sampledAt: toLocalInput(new Date(record.sampledAt)),
    temp: String(record.tempC),
    duration: String(record.durationDays),
  });
  const [rowError, setRowError] = useState("");

  const startEdit = () => {
    setDraft({
      sampledAt: toLocalInput(new Date(record.sampledAt)),
      temp: String(record.tempC),
      duration: String(record.durationDays),
    });
    setRowError("");
    setEditing(true);
  };

  const save = () => {
    const tempC = Number(draft.temp);
    const durationDays = Number(draft.duration);
    if (!draft.sampledAt) return setRowError("请选择采样时间");
    if (!Number.isFinite(tempC) || draft.temp === "")
      return setRowError("温度须为数字");
    if (!Number.isFinite(durationDays) || durationDays <= 0)
      return setRowError("持续时间须大于 0");
    onUpdate(record.id, { sampledAt: draft.sampledAt, tempC, durationDays });
    setEditing(false);
  };

  if (!editing) {
    return (
      <tr>
        <td>{formatDateTime(record.sampledAt)}</td>
        <td>{record.tempC}</td>
        <td>{record.durationDays}</td>
        <td className={effectiveTemp(record.tempC) === 0 ? "muted" : ""}>
          {effectiveTemp(record.tempC)}
        </td>
        <td>{recordHeat(record)}</td>
        <td className="row-actions">
          <button type="button" onClick={startEdit}>
            改正
          </button>
          <button type="button" className="danger" onClick={() => onRemove(record.id)}>
            删除
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="editing">
      <td>
        <input
          type="datetime-local"
          value={draft.sampledAt}
          onChange={(e) => setDraft((d) => ({ ...d, sampledAt: e.target.value }))}
        />
      </td>
      <td>
        <input
          type="number"
          step="0.1"
          value={draft.temp}
          onChange={(e) => setDraft((d) => ({ ...d, temp: e.target.value }))}
        />
      </td>
      <td>
        <input
          type="number"
          step="0.5"
          min="0"
          value={draft.duration}
          onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
        />
      </td>
      <td colSpan={2}>
        {rowError ? <span className="form-error">{rowError}</span> : <span className="hint">保存后阶段与曲线立即重算</span>}
      </td>
      <td className="row-actions">
        <button type="button" className="primary" onClick={save}>
          保存
        </button>
        <button type="button" onClick={() => setEditing(false)}>
          取消
        </button>
      </td>
    </tr>
  );
}
