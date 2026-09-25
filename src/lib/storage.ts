import type { Batch } from "../types";

/** 台账数据只经此模块读写 localStorage，与积温计算、页面操作分开维护 */

const STORAGE_KEY = "forensic-entomology-ledger:v1";

export function loadBatches(): Batch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(isBatch);
  } catch {
    return [];
  }
}

export function saveBatches(batches: Batch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch {
    // 隐私模式或存储已满时静默失败，不影响当前页面操作
  }
}

function isBatch(value: unknown): value is Batch {
  if (typeof value !== "object" || value === null) return false;
  const b = value as Record<string, unknown>;
  return typeof b.id === "string" && Array.isArray(b.temperatures);
}
