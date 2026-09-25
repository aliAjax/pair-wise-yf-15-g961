import type { Batch } from "../domain/types";

const STORAGE_KEY = "hxyfront-62003:batches:v1";

/** 读取本地台账；无记录或数据损坏时返回 null，由调用方回退到种子数据 */
export function loadBatches(): Batch[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Batch[];
  } catch {
    return null;
  }
}

export function saveBatches(batches: Batch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch {
    // 存储不可用（隐私模式等）时静默失败，页面仍可继续使用
  }
}
