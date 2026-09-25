import type { Batch } from "../types";

/** 首次打开时载入的样例批次（沿用原静态样例并补全温度记录） */
export function seedBatches(): Batch[] {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const iso = (offsetDays: number, hour = 9) => {
    const d = new Date(now + offsetDays * day);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "seed-042-a",
      code: "CASE-042-A",
      caseNo: "CASE-042",
      species: "丝光绿蝇",
      location: "室外草地",
      preservation: "乙醇保存",
      exposure: "幼虫三龄",
      note: "幼虫三龄，采样时现场测得 28.6℃",
      createdAt: new Date(now - 3 * day).toISOString(),
      temperatures: [
        { id: "t-042-a-1", sampledAt: iso(-3, 8), tempC: 16, durationDays: 1 },
        { id: "t-042-a-2", sampledAt: iso(-2, 8), tempC: 20, durationDays: 1 },
        { id: "t-042-a-3", sampledAt: iso(-1, 9), tempC: 28.6, durationDays: 1 },
      ],
    },
    {
      id: "seed-042-b",
      caseNo: "CASE-042",
      code: "CASE-042-B",
      species: "丝光绿蝇（待复核）",
      location: "阴影区域",
      preservation: "干燥冷藏",
      exposure: "蛹期",
      note: "蛹期样本，需复核种属",
      createdAt: new Date(now - 10 * day).toISOString(),
      temperatures: [
        { id: "t-042-b-1", sampledAt: iso(-10, 9), tempC: 20, durationDays: 3 },
        { id: "t-042-b-2", sampledAt: iso(-7, 9), tempC: 22, durationDays: 3 },
        { id: "t-042-b-3", sampledAt: iso(-4, 9), tempC: 9, durationDays: 2 },
        { id: "t-042-b-4", sampledAt: iso(-2, 9), tempC: 21, durationDays: 1 },
      ],
    },
    {
      id: "seed-051-a",
      caseNo: "CASE-051",
      code: "CASE-051-A",
      species: "大头金蝇",
      location: "水沟边缘",
      preservation: "针插标本",
      exposure: "成虫",
      note: "成虫采集，已完成拍照",
      createdAt: new Date(now - 14 * day).toISOString(),
      temperatures: [
        { id: "t-051-a-1", sampledAt: iso(-14, 8), tempC: 20, durationDays: 2 },
        { id: "t-051-a-2", sampledAt: iso(-12, 8), tempC: 22.5, durationDays: 2 },
        { id: "t-051-a-3", sampledAt: iso(-10, 8), tempC: 24, durationDays: 2 },
        { id: "t-051-a-4", sampledAt: iso(-8, 8), tempC: 21, durationDays: 3 },
      ],
    },
  ];
}
