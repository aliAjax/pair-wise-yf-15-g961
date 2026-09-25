import { useState } from "react";
import { toLocalInput } from "../lib/time";

export interface NewBatchValues {
  code: string;
  caseNo: string;
  species: string;
  location: string;
  preservation: string;
  exposure: string;
  sampledAt: string;
  tempC: number;
  durationDays: number;
}

interface Props {
  onCreate: (values: NewBatchValues) => void;
}

/** 新批次登记：随单录入第一条采样时间、环境温度与持续时间 */
export function NewBatchForm({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [caseNo, setCaseNo] = useState("");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");
  const [preservation, setPreservation] = useState("乙醇保存");
  const [exposure, setExposure] = useState("");
  const [sampledAt, setSampledAt] = useState(() => toLocalInput(new Date()));
  const [temp, setTemp] = useState("");
  const [duration, setDuration] = useState("1");
  const [error, setError] = useState("");

  const reset = () => {
    setCode("");
    setCaseNo("");
    setSpecies("");
    setLocation("");
    setPreservation("乙醇保存");
    setExposure("");
    setSampledAt(toLocalInput(new Date()));
    setTemp("");
    setDuration("1");
    setError("");
  };

  const submit = () => {
    const tempC = Number(temp);
    const durationDays = Number(duration);
    if (!code.trim()) return setError("请填写样本批次号");
    if (!sampledAt) return setError("请选择采样时间");
    if (!Number.isFinite(tempC) || temp === "") return setError("首条环境温度须为数字");
    if (!Number.isFinite(durationDays) || durationDays <= 0)
      return setError("持续时间须为大于 0 的数字（日）");
    onCreate({
      code,
      caseNo,
      species,
      location,
      preservation,
      exposure,
      sampledAt,
      tempC,
      durationDays,
    });
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button type="button" className="primary full" onClick={() => setOpen(true)}>
        + 登记新批次
      </button>
    );
  }

  return (
    <div className="new-batch">
      <label>
        <span>样本批次号 *</span>
        <input
          placeholder="如 CASE-063-C"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </label>
      <label>
        <span>关联案件号</span>
        <input
          placeholder="如 CASE-063"
          value={caseNo}
          onChange={(e) => setCaseNo(e.target.value)}
        />
      </label>
      <label>
        <span>昆虫种类</span>
        <input value={species} onChange={(e) => setSpecies(e.target.value)} />
      </label>
      <label>
        <span>采样地点</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label>
        <span>尸体暴露阶段</span>
        <input value={exposure} onChange={(e) => setExposure(e.target.value)} />
      </label>
      <label>
        <span>保存方式</span>
        <input value={preservation} onChange={(e) => setPreservation(e.target.value)} />
      </label>
      <label>
        <span>首次采样时间 *</span>
        <input
          type="datetime-local"
          value={sampledAt}
          onChange={(e) => setSampledAt(e.target.value)}
        />
      </label>
      <label>
        <span>环境温度(℃) *</span>
        <input
          type="number"
          step="0.1"
          placeholder="如 26.0"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
        />
      </label>
      <label>
        <span>温度持续时间(日) *</span>
        <input
          type="number"
          step="0.5"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="note-actions">
        <button type="button" className="primary" onClick={submit}>
          建立批次
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          取消
        </button>
      </div>
    </div>
  );
}
