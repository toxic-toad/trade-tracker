"use client";

import { useId } from "react";

export interface BarDatum {
  label: string;
  value: number;
}

export function BarChart({ data, valueFormatter, height = 160, diverging = false }: { data: BarDatum[]; valueFormatter?: (value: number) => string; height?: number; diverging?: boolean }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Not enough data yet.</p>;
  }

  const maxMagnitude = Math.max(1, ...data.map((item) => Math.abs(item.value)));

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ height }}>
      {data.map((item) => {
        const ratio = Math.abs(item.value) / maxMagnitude;
        const barHeight = Math.max(2, Math.round(ratio * (height - 44)));
        const isNegative = diverging && item.value < 0;
        return (
          <div key={item.label} className="flex min-w-[44px] flex-1 flex-col items-center justify-end gap-2">
            <span className={`text-[11px] font-medium ${isNegative ? "text-rose-300" : "text-slate-300"}`}>
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </span>
            <div
              className={`w-full rounded-t-lg ${isNegative ? "bg-gradient-to-t from-rose-600 to-rose-400" : "bg-gradient-to-t from-cyan-600 to-cyan-400"}`}
              style={{ height: barHeight }}
            />
            <span className="text-[11px] text-slate-500">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ values, height = 180, formatValue }: { values: number[]; height?: number; formatValue?: (value: number) => string }) {
  const gradientId = useId();

  if (values.length < 2) {
    return <p className="text-sm text-slate-500">Add at least two trades to see the equity curve.</p>;
  }

  const width = 100;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 12 - ((value - min) / range) * (height - 24);
    return { x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-44 w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="rgb(34,211,238)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>{formatValue ? formatValue(values[0]) : values[0].toFixed(2)}</span>
        <span>{formatValue ? formatValue(values[values.length - 1]) : values[values.length - 1].toFixed(2)}</span>
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
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-900">
        <div className="h-full bg-emerald-500" style={{ width: `${winPercent}%` }} />
        <div className="h-full bg-rose-500" style={{ width: `${lossPercent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span className="text-emerald-300">{winning} wins ({winPercent.toFixed(0)}%)</span>
        <span className="text-rose-300">{losing} losses ({lossPercent.toFixed(0)}%)</span>
      </div>
    </div>
  );
}
