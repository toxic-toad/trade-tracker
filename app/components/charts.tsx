"use client";

import { useId } from "react";

export interface BarDatum {
  label: string;
  value: number;
}

export function BarChart({ data, valueFormatter, height = 160, diverging = false, color = "cyan" }: { data: BarDatum[]; valueFormatter?: (value: number) => string; height?: number; diverging?: boolean; color?: "cyan" | "emerald" | "violet" | "amber" }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500 py-8 text-center">Not enough data yet.</p>;
  }

  const maxMagnitude = Math.max(1, ...data.map((item) => Math.abs(item.value)));

  const colorMap: Record<string, { pos: string; neg: string; textPos: string; textNeg: string }> = {
    cyan: { pos: "from-cyan-600 to-cyan-400", neg: "from-rose-600 to-rose-400", textPos: "text-cyan-300", textNeg: "text-rose-300" },
    emerald: { pos: "from-emerald-600 to-emerald-400", neg: "from-rose-600 to-rose-400", textPos: "text-emerald-300", textNeg: "text-rose-300" },
    violet: { pos: "from-violet-600 to-violet-400", neg: "from-rose-600 to-rose-400", textPos: "text-violet-300", textNeg: "text-rose-300" },
    amber: { pos: "from-amber-600 to-amber-400", neg: "from-rose-600 to-rose-400", textPos: "text-amber-300", textNeg: "text-rose-300" },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className="flex items-end gap-1.5 overflow-x-auto pb-2" style={{ height }}>
      {data.map((item) => {
        const ratio = Math.abs(item.value) / maxMagnitude;
        const barHeight = Math.max(3, Math.round(ratio * (height - 44)));
        const isNegative = diverging && item.value < 0;
        return (
          <div key={item.label} className="flex min-w-[40px] flex-1 flex-col items-center justify-end gap-1.5">
            <span className={`text-[10px] font-medium ${isNegative ? c.textNeg : c.textPos}`}>
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </span>
            <div
              className={`w-full rounded-md bg-gradient-to-t ${isNegative ? c.neg : c.pos} transition-all duration-500 ease-out`}
              style={{ height: barHeight, minHeight: 3 }}
            />
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ values, height = 180, formatValue, color = "cyan" }: { values: number[]; height?: number; formatValue?: (value: number) => string; color?: "cyan" | "emerald" | "violet" | "amber" }) {
  const gradientId = useId();

  if (values.length < 2) {
    return <p className="text-sm text-slate-500 py-8 text-center">Add at least two trades to see the equity curve.</p>;
  }

  const width = 100;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const colorMap: Record<string, { stroke: string; stop1: string; stop2: string }> = {
    cyan: { stroke: "rgb(34,211,238)", stop1: "rgba(34,211,238,0.25)", stop2: "rgba(34,211,238,0)" },
    emerald: { stroke: "rgb(16,185,129)", stop1: "rgba(16,185,129,0.25)", stop2: "rgba(16,185,129,0)" },
    violet: { stroke: "rgb(139,92,246)", stop1: "rgba(139,92,246,0.25)", stop2: "rgba(139,92,246,0)" },
    amber: { stroke: "rgb(245,158,11)", stop1: "rgba(245,158,11,0.25)", stop2: "rgba(245,158,11,0)" },
  };

  const c = colorMap[color] || colorMap.cyan;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 12 - ((value - min) / range) * (height - 24);
    return { x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.stop1} />
            <stop offset="100%" stopColor={c.stop2} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={c.stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={c.stroke} />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>{formatValue ? formatValue(values[0]) : values[0].toFixed(2)}</span>
        <span className="font-medium text-slate-300">{formatValue ? formatValue(values[values.length - 1]) : values[values.length - 1].toFixed(2)}</span>
      </div>
    </div>
  );
}

export function RatioBar({ winning, losing }: { winning: number; losing: number }) {
  const total = winning + losing;
  const winPercent = total > 0 ? (winning / total) * 100 : 0;
  const lossPercent = total > 0 ? (losing / total) * 100 : 0;

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${winPercent}%` }} />
        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-700" style={{ width: `${lossPercent}%` }} />
      </div>
      <div className="mt-2.5 flex justify-between text-xs">
        <span className="text-emerald-400">{winning} wins ({winPercent.toFixed(0)}%)</span>
        <span className="text-rose-400">{losing} losses ({lossPercent.toFixed(0)}%)</span>
      </div>
    </div>
  );
}
