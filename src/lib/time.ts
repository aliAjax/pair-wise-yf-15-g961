/** 时间格式化与 datetime-local 输入框互转（均按本地时区处理） */

const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> datetime-local 值：YYYY-MM-DDTHH:mm */
export function toLocalInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** datetime-local 值 -> ISO 字符串；空值回退当前时间 */
export function localInputToIso(value: string): string {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** ISO -> 展示文本：YYYY-MM-DD HH:mm */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** 解析 ISO 为本地时间戳，无效时返回 NaN */
export function timeOf(iso: string): number {
  return Date.parse(iso);
}
