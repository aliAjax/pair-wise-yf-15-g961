import type { Stage, TempRecord } from "./types";

/** 发育起点温度：只累加高于 10℃ 的部分 */
export const BASE_TEMPERATURE = 10;

export const STAGE_ORDER: Stage[] = ["卵", "幼虫", "蛹", "成虫"];

/** 积温阈值（度·日）：20 进入幼虫，45 进入蛹，80 进入成虫 */
export const STAGE_THRESHOLDS: { stage: Stage; from: number }[] = [
  { stage: "卵", from: 0 },
  { stage: "幼虫", from: 20 },
  { stage: "蛹", from: 45 },
  { stage: "成虫", from: 80 },
];

export interface AccumulatedPoint {
  record: TempRecord;
  /** 本条记录贡献的有效积温（度·日） */
  contribution: number;
  /** 截至本条记录的累计有效积温 */
  total: number;
}

/** 单条温度记录的有效积温：max(0, 温度 - 10℃) × 持续天数 */
export function effectiveDegreeDays(temperature: number, durationHours: number): number {
  const aboveBase = Math.max(0, temperature - BASE_TEMPERATURE);
  return (aboveBase * durationHours) / 24;
}

/** 按采样时间排序后逐条累加，返回每个时间点的贡献与累计值 */
export function accumulateRecords(records: TempRecord[]): AccumulatedPoint[] {
  const sorted = [...records].sort((a, b) => a.sampledAt.localeCompare(b.sampledAt));
  let total = 0;
  return sorted.map((record) => {
    const contribution = effectiveDegreeDays(record.temperature, record.durationHours);
    total += contribution;
    return { record, contribution, total };
  });
}

export function totalDegreeDays(records: TempRecord[]): number {
  const points = accumulateRecords(records);
  return points.length === 0 ? 0 : points[points.length - 1].total;
}

/** 按累计有效积温判定当前发育阶段 */
export function stageFor(degreeDays: number): Stage {
  let current: Stage = "卵";
  for (const threshold of STAGE_THRESHOLDS) {
    if (degreeDays >= threshold.from) current = threshold.stage;
  }
  return current;
}

/** 距下一阶段的积温缺口；已是成虫时返回 null */
export function nextStageGap(degreeDays: number): { stage: Stage; remaining: number } | null {
  const next = STAGE_THRESHOLDS.find((t) => t.from > degreeDays);
  if (!next) return null;
  return { stage: next.stage, remaining: next.from - degreeDays };
}
