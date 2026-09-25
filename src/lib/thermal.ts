import type { Batch, Stage, TempRecord } from "../types";
import { STAGES } from "../types";

/** 发育起点温度（摄氏度）：低于此温度不计有效积温 */
export const BASE_TEMP = 10;

/** 各阶段起始有效积温（日·度，即“积温日”） */
export const STAGE_THRESHOLDS: Record<Stage, number> = {
  卵: 0,
  幼虫: 20,
  蛹: 45,
  成虫: 80,
};

/** 单条记录的日有效温度：高于起点温度的部分，其余为 0 */
export function effectiveTemp(tempC: number): number {
  return Math.max(0, tempC - BASE_TEMP);
}

/** 单条记录贡献的有效积温（日·度），保留两位小数 */
export function recordHeat(r: TempRecord): number {
  return round2(effectiveTemp(r.tempC) * Math.max(0, r.durationDays));
}

/** 一批样本累计有效积温（日·度） */
export function accumulatedHeat(batch: Batch): number {
  return round2(batch.temperatures.reduce((sum, r) => sum + recordHeat(r), 0));
}

/** 按累计积温判定当前发育阶段：20→幼虫，45→蛹，80→成虫 */
export function stageOfHeat(heat: number): Stage {
  if (heat >= STAGE_THRESHOLDS.成虫) return "成虫";
  if (heat >= STAGE_THRESHOLDS.蛹) return "蛹";
  if (heat >= STAGE_THRESHOLDS.幼虫) return "幼虫";
  return "卵";
}

export function stageOfBatch(batch: Batch): Stage {
  return stageOfHeat(accumulatedHeat(batch));
}

export interface CurvePoint {
  record: TempRecord;
  heat: number; // 该段有效积温
  cumulative: number; // 累计有效积温
  stage: Stage;
}

/**
 * 发育进度曲线：温度记录按采样时间排序后逐段累加，
 * 每段以“持续日数”为横轴跨度，得到阶梯式积温曲线。
 */
export function heatCurve(batch: Batch): CurvePoint[] {
  const ordered = [...batch.temperatures].sort(
    (a, b) => Date.parse(a.sampledAt) - Date.parse(b.sampledAt)
  );
  let cumulative = 0;
  return ordered.map((record) => {
    cumulative = round2(cumulative + recordHeat(record));
    return {
      record,
      heat: recordHeat(record),
      cumulative,
      stage: stageOfHeat(cumulative),
    };
  });
}

/** 平均环境温度（各记录简单平均，不受持续时长加权），无记录时为 null */
export function averageTemp(batch: Batch): number | null {
  if (batch.temperatures.length === 0) return null;
  const sum = batch.temperatures.reduce((s, r) => s + r.tempC, 0);
  return round1(sum / batch.temperatures.length);
}

/** 距离下一阶段还需的有效积温；已到成虫返回 0 */
export function heatToNext(heat: number): { stage: Stage; delta: number } | null {
  const current = stageOfHeat(heat);
  const idx = STAGES.indexOf(current);
  if (idx >= STAGES.length - 1) return null;
  const next = STAGES[idx + 1];
  return { stage: next, delta: round2(STAGE_THRESHOLDS[next] - heat) };
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
