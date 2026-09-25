import { useState } from "react";
import type { TempRecord } from "../domain/types";

function nowLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

interface TempRecordFormProps {
  onAdd: (record: Omit<TempRecord, "id">) => void;
}

/** 录入一条温度记录：采样时间 + 环境温度 + 持续时间 */
export function TempRecordForm({ onAdd }: TempRecordFormProps) {
  const [sampledAt, setSampledAt] = useState(nowLocal);
  const [temperature, setTemperature] = useState("25");
  const [durationHours, setDurationHours] = useState("12");
  const [error, setError] = useState("");

  function submit() {
    const temp = Number.parseFloat(temperature);
    const hours = Number.parseFloat(durationHours);
    if (!sampledAt) return setError("请选择采样时间。");
    if (!Number.isFinite(temp)) return setError("环境温度必须是数字。");
    if (!Number.isFinite(hours) || hours <= 0) return setError("持续时间必须大于 0 小时。");
    onAdd({ sampledAt, temperature: temp, durationHours: hours });
    setError("");
  }

  return (
    <div className="record-form">
      <label>
        <span>采样时间</span>
        <input type="datetime-local" value={sampledAt} onChange={(e) => setSampledAt(e.target.value)} />
      </label>
      <label>
        <span>环境温度（℃）</span>
        <input
          type="number"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
        />
      </label>
      <label>
        <span>持续时间（小时）</span>
        <input
          type="number"
          step="1"
          min="0"
          value={durationHours}
          onChange={(e) => setDurationHours(e.target.value)}
        />
      </label>
      <button className="primary" onClick={submit}>
        录入温度
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
