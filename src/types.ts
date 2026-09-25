/** 发育阶段，顺序即积温从低到高 */
export type Stage = "卵" | "幼虫" | "蛹" | "成虫";

/** 一条温度持续记录：在 sampledAt 时刻测得 tempC，并持续 durationDays 天 */
export interface TempRecord {
  id: string;
  /** 采样时间，ISO 字符串（由 datetime-local 本地时间转换） */
  sampledAt: string;
  /** 环境温度（摄氏度） */
  tempC: number;
  /** 该温度持续时间（日） */
  durationDays: number;
}

/** 一批昆虫样本 */
export interface Batch {
  id: string;
  /** 样本批次号，如 CASE-042-A */
  code: string;
  /** 关联案件号，如 CASE-042 */
  caseNo: string;
  species: string;
  location: string;
  preservation: string;
  /** 尸体暴露阶段（现场描述） */
  exposure: string;
  /** 鉴定备注 */
  note: string;
  /** 建台时间，ISO 字符串 */
  createdAt: string;
  temperatures: TempRecord[];
}

export const STAGES: Stage[] = ["卵", "幼虫", "蛹", "成虫"];
