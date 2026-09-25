export type Stage = "卵" | "幼虫" | "蛹" | "成虫";

export interface TempRecord {
  id: string;
  /** 采样时间，本地 ISO 格式 "YYYY-MM-DDTHH:mm" */
  sampledAt: string;
  /** 环境温度（℃） */
  temperature: number;
  /** 温度持续时间（小时） */
  durationHours: number;
}

export interface Batch {
  id: string;
  /** 批次编号，如 CASE-042-A */
  code: string;
  /** 关联案件号 */
  caseNo: string;
  location: string;
  species: string;
  exposureStage: string;
  preservative: string;
  /** 鉴定备注 */
  notes: string;
  records: TempRecord[];
}
