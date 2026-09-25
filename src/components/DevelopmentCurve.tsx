import { useId } from "react";
import type { Batch } from "../types";
import { heatCurve, STAGE_THRESHOLDS } from "../lib/thermal";
import type { Stage } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

const STAGE_COLORS: Record<Stage, string> = {
  卵: "#c7a96a",
  幼虫: "#65a30d",
  蛹: "#a16207",
  成虫: "#dc2626",
};

const W = 760;
const H = 340;
const M = { top: 24, right: 24, bottom: 46, left: 64 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

/** 发育进度曲线：横轴为发育日数，纵轴为累计有效积温；改正温度后整体重算 */
export function DevelopmentCurve({ batch }: { batch: Batch }) {
  const uid = useId().replace(/[:]/g, "");
  const points = heatCurve(batch);

  if (points.length === 0) {
    return (
      <div className="curve-empty empty">
        录入温度记录后，这里绘制累计有效积温与发育阶段曲线。
      </div>
    );
  }

  const t0 = Math.min(...points.map((p) => Date.parse(p.record.sampledAt)));
  const segments = points.map((p) => {
    const startDays = (Date.parse(p.record.sampledAt) - t0) / DAY_MS;
    return { ...p, x0: startDays, x1: startDays + p.record.durationDays };
  });

  const xMax = Math.max(1, ...segments.map((s) => s.x1)) * 1.05;
  const maxCum = segments[segments.length - 1].cumulative;
  const yMax = Math.max(STAGE_THRESHOLDS.成虫, maxCum) * 1.18;

  const x = (days: number) => M.left + (days / xMax) * PLOT_W;
  const y = (heat: number) => M.top + PLOT_H - (heat / yMax) * PLOT_H;

  // 阶梯折线：每段从“进入该记录时的累计值”平推持续日数后抬升到新累计值
  const linePath = segments
    .map((s, i) => {
      const y0 = y(i === 0 ? 0 : segments[i - 1].cumulative);
      return `${i === 0 ? "M" : "L"}${x(s.x0).toFixed(1)},${y0.toFixed(1)}
              L${x(s.x1).toFixed(1)},${y0.toFixed(1)}
              L${x(s.x1).toFixed(1)},${y(s.cumulative).toFixed(1)}`;
    })
    .join(" ");

  const bands: Array<{ stage: Stage; from: number; to: number }> = [
    { stage: "卵", from: 0, to: STAGE_THRESHOLDS.幼虫 },
    { stage: "幼虫", from: STAGE_THRESHOLDS.幼虫, to: STAGE_THRESHOLDS.蛹 },
    { stage: "蛹", from: STAGE_THRESHOLDS.蛹, to: STAGE_THRESHOLDS.成虫 },
    { stage: "成虫", from: STAGE_THRESHOLDS.成虫, to: yMax },
  ];

  const thresholdStages: Stage[] = ["幼虫", "蛹", "成虫"];

  return (
    <div className="curve-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="累计有效积温发育进度曲线">
        {bands.map((b) => (
          <rect
            key={b.stage}
            x={M.left}
            y={y(Math.min(b.to, yMax))}
            width={PLOT_W}
            height={Math.max(0, y(b.from) - y(Math.min(b.to, yMax)))}
            fill={STAGE_COLORS[b.stage]}
            opacity={0.07}
          />
        ))}

        {thresholdStages.map((s) => (
          <g key={s}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(STAGE_THRESHOLDS[s])}
              y2={y(STAGE_THRESHOLDS[s])}
              stroke={STAGE_COLORS[s]}
              strokeWidth={1.4}
              strokeDasharray="6 5"
            />
            <text
              x={W - M.right - 4}
              y={y(STAGE_THRESHOLDS[s]) - 5}
              textAnchor="end"
              fontSize={12}
              fill={STAGE_COLORS[s]}
            >
              {s} {STAGE_THRESHOLDS[s]} 日·度
            </text>
          </g>
        ))}

        <line
          x1={M.left}
          x2={M.left}
          y1={M.top}
          y2={M.top + PLOT_H}
          stroke="#94a3b8"
        />
        <line
          x1={M.left}
          x2={W - M.right}
          y1={M.top + PLOT_H}
          y2={M.top + PLOT_H}
          stroke="#94a3b8"
        />

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const days = t * xMax;
          return (
            <g key={uid + t}>
              <line
                x1={x(days)}
                x2={x(days)}
                y1={M.top + PLOT_H}
                y2={M.top + PLOT_H + 6}
                stroke="#94a3b8"
              />
              <text
                x={x(days)}
                y={H - M.bottom + 22}
                textAnchor="middle"
                fontSize={12}
                fill="#64748b"
              >
                {days.toFixed(1)} 日
              </text>
            </g>
          );
        })}

        {[0, 0.5, 1].map((t) => {
          const heat = t * yMax;
          return (
            <text
              key={uid + "y" + t}
              x={M.left - 10}
              y={y(heat) + 4}
              textAnchor="end"
              fontSize={12}
              fill="#64748b"
            >
              {heat.toFixed(0)}
            </text>
          );
        })}

        <path d={linePath} fill="none" stroke="#365314" strokeWidth={2.4} />

        {segments.map((s, i) => {
          const prev = i === 0 ? 0 : segments[i - 1].cumulative;
          return (
            <g key={s.record.id}>
              <circle
                cx={x(s.x0)}
                cy={y(prev)}
                r={3}
                fill="#ffffff"
                stroke="#365314"
                strokeWidth={1.5}
              >
                <title>
                  {s.record.tempC}℃ × {s.record.durationDays}日，累计 {s.cumulative} 日·度
                </title>
              </circle>
              <circle cx={x(s.x1)} cy={y(s.cumulative)} r={4.5} fill={STAGE_COLORS[s.stage]}>
                <title>
                  累计 {s.cumulative} 日·度 → {s.stage}
                </title>
              </circle>
            </g>
          );
        })}

        <text x={M.left + PLOT_W / 2} y={H - 6} textAnchor="middle" fontSize={12} fill="#475569">
          发育日数（按采样时间与持续时间排布）
        </text>
        <text
          x={16}
          y={M.top + PLOT_H / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#475569"
          transform={`rotate(-90 16 ${M.top + PLOT_H / 2})`}
        >
          累计有效积温（日·度）
        </text>
      </svg>

      <div className="curve-legend">
        {(Object.keys(STAGE_COLORS) as Stage[]).map((s) => (
          <span key={s}>
            <i style={{ background: STAGE_COLORS[s] }} />
            {s}
            {s === "幼虫" || s === "蛹" || s === "成虫"
              ? ` ≥${STAGE_THRESHOLDS[s]}`
              : ` <${STAGE_THRESHOLDS.幼虫}`}
          </span>
        ))}
      </div>
    </div>
  );
}
