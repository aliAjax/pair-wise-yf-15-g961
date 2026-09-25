import type { Batch } from "../domain/types";

let counter = 0;

export function uid(prefix: string): string {
  counter += 1;
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${counter}-${random}`;
}

/** 首次打开时的演示台账，覆盖卵/幼虫/蛹/成虫四个阶段 */
export function seedBatches(): Batch[] {
  return [
    {
      id: uid("batch"),
      code: "CASE-042-A",
      caseNo: "CASE-042",
      location: "室外草地",
      species: "丝光绿蝇",
      exposureStage: "腐败期",
      preservative: "乙醇保存",
      notes: "幼虫三龄，28.6℃ 恒温段已复核。",
      records: [
        { id: uid("rec"), sampledAt: "2026-09-21T08:00", temperature: 28.6, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-22T08:00", temperature: 26.0, durationHours: 12 },
      ],
    },
    {
      id: uid("batch"),
      code: "CASE-042-B",
      caseNo: "CASE-042",
      location: "阴影区域",
      species: "大头金蝇",
      exposureStage: "腐败期",
      preservative: "乙醇保存",
      notes: "蛹期样本，需复核种属。",
      records: [
        { id: uid("rec"), sampledAt: "2026-09-18T09:00", temperature: 25.0, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-19T09:00", temperature: 24.0, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-20T09:00", temperature: 22.0, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-21T09:00", temperature: 20.0, durationHours: 12 },
      ],
    },
    {
      id: uid("batch"),
      code: "CASE-051-A",
      caseNo: "CASE-051",
      location: "水沟边缘",
      species: "巨尾阿丽蝇",
      exposureStage: "干化期",
      preservative: "针插标本",
      notes: "成虫采集，已完成拍照。",
      records: [
        { id: uid("rec"), sampledAt: "2026-09-15T10:00", temperature: 28.0, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-16T10:00", temperature: 27.0, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-17T10:00", temperature: 26.0, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-18T10:00", temperature: 25.0, durationHours: 24 },
        { id: uid("rec"), sampledAt: "2026-09-19T10:00", temperature: 24.0, durationHours: 24 },
      ],
    },
    {
      id: uid("batch"),
      code: "CASE-051-B",
      caseNo: "CASE-051",
      location: "水沟边缘",
      species: "待鉴定",
      exposureStage: "新鲜期",
      preservative: "冷藏",
      notes: "",
      records: [
        { id: uid("rec"), sampledAt: "2026-09-24T14:00", temperature: 18.0, durationHours: 12 },
        { id: uid("rec"), sampledAt: "2026-09-25T08:00", temperature: 19.0, durationHours: 12 },
      ],
    },
  ];
}
