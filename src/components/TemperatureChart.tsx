import { STAGE_THRESHOLDS } from "../domain/degreeDays";
import type { AccumulatedPoint } from "../domain/degreeDays";

const WIDTH = 680;
const HEIGHT = 280;
const PAD = { left: 48, right: 16, top: 18, bottom: 36 };

function fmtTime(iso: string): string {
  const [date, time] = iso.split("T");
  const [, month, day] = date.split("-");
  return `${month}-${day} ${time ?? ""}`.trim();
}

function fmtLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 累计有效积温曲线：x 轴为采样时间，y 轴为度·日，叠加 20/45/80 阶段阈值线 */
export function TemperatureChart({ points }: { points: AccumulatedPoint[] }) {
  if (points.length === 0) {
    return <p className="chart-empty">暂无温度记录，录入后自动生成积温曲线。</p>;
  }

  const times = points.map((p) => new Date(p.record.sampledAt).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const maxTotal = points[points.length - 1].total;
  const yMax = Math.max(80, Math.ceil(maxTotal)) * 1.08;

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const x = (t: number) =>
    maxT === minT ? PAD.left + innerW / 2 : PAD.left + ((t - minT) / (maxT - minT)) * innerW;
  const y = (dd: number) => PAD.top + innerH - (dd / yMax) * innerH;

  const coords = points.map((p, i) => ({ cx: x(times[i]), cy: y(p.total), point: p }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.cx},${c.cy}`).join(" ");
  const area = `${path} L${coords[coords.length - 1].cx},${y(0)} L${coords[0].cx},${y(0)} Z`;

  const xTicks = [minT, minT + (maxT - minT) / 2, maxT].filter(
    (t, i, arr) => arr.indexOf(t) === i
  );

  return (
    <svg
      className="temp-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="累计有效积温曲线"
    >
      {/* 阶段阈值线：幼虫 20 / 蛹 45 / 成虫 80 */}
      {STAGE_THRESHOLDS.filter((t) => t.from > 0).map((t) => (
        <g key={t.stage}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(t.from)}
            y2={y(t.from)}
            className="threshold-line"
          />
          <text x={WIDTH - PAD.right} y={y(t.from) - 5} textAnchor="end" className="threshold-label">
            {t.stage} {t.from}
          </text>
        </g>
      ))}

      {/* 坐标轴 */}
      <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(0)} y2={y(0)} className="axis-line" />
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={y(0)} className="axis-line" />
      <text x={10} y={PAD.top + 4} className="axis-label">
        度·日
      </text>
      {xTicks.map((t) => (
        <text key={t} x={x(t)} y={HEIGHT - 12} textAnchor="middle" className="axis-label">
          {fmtLocal(t)}
        </text>
      ))}

      {/* 积温曲线 */}
      <path d={area} className="curve-area" />
      <path d={path} className="curve-line" />
      {coords.map((c) => (
        <circle key={c.point.record.id} cx={c.cx} cy={c.cy} r={4.5} className="curve-dot">
          <title>
            {`${fmtTime(c.point.record.sampledAt)} · ${c.point.record.temperature}℃ × ${
              c.point.record.durationHours
            }h · 贡献 ${c.point.contribution.toFixed(1)} · 累计 ${c.point.total.toFixed(1)}`}
          </title>
        </circle>
      ))}
    </svg>
  );
}
