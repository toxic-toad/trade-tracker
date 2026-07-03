"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateAccountStats,
  createDefaultData,
  formatCurrency,
  formatPercent,
  readTrackerData,
  type Trade,
  type TrackerData,
  writeTrackerData,
} from "../lib/tracker-data";

export default function HistoryPage() {
  const [data, setData] = useState<TrackerData>(createDefaultData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refreshData = () => {
      setData(readTrackerData());
      setHydrated(true);
    };

    refreshData();
    window.addEventListener("storage", refreshData);
    window.addEventListener("trade-tracker-data-changed", refreshData);

    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("trade-tracker-data-changed", refreshData);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeTrackerData(data);
  }, [data, hydrated]);

  const sortedTrades = useMemo(() => {
    return [...data.trades].sort((left, right) => {
      const leftTime = new Date(left.date || left.createdAt).getTime();
      const rightTime = new Date(right.date || right.createdAt).getTime();
      return rightTime - leftTime;
    });
  }, [data.trades]);

  const totalProfit = useMemo(() => {
    return data.trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  }, [data.trades]);

  const winRate = useMemo(() => {
    if (data.trades.length === 0) return 0;
    const wins = data.trades.filter((trade) => trade.profitLoss > 0).length;
    return (wins / data.trades.length) * 100;
  }, [data.trades]);

  const deleteTrade = (tradeId: number) => {
    const confirmed = window.confirm("Delete this trade? This cannot be undone.");
    if (!confirmed) return;

    const nextTrades = data.trades.filter((trade) => trade.id !== tradeId);
    const nextData = {
      ...data,
      trades: nextTrades,
      stats: calculateAccountStats(data.settings, nextTrades),
    };

    setData(nextData);
    writeTrackerData(nextData);
    window.dispatchEvent(new Event("trade-tracker-data-changed"));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">History</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Your private trade log</h1>
              <p className="mt-2 text-sm text-slate-300">Every trade is stored locally and stays available offline.</p>
            </div>
            <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              Back
            </Link>
          </div>
        </header>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_16px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total trades</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.trades.length}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_16px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total profit</p>
            <p className={`mt-2 text-2xl font-semibold ${totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatCurrency(totalProfit, data.settings.usdToInr)}
            </p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_16px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Win rate</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(winRate)}</p>
          </article>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          {sortedTrades.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-white/10 p-5 text-left">
              <div>
                <p className="text-lg font-semibold text-white">No trades yet</p>
                <p className="mt-1 text-sm text-slate-400">Start building your offline history with your first trade.</p>
              </div>
              <Link href="/add" className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
                Add your first trade
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTrades.map((trade) => {
                const isProfit = trade.profitLoss >= 0;
                return (
                  <article key={trade.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{trade.symbol}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {isProfit ? "Profit" : "Loss"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{trade.date || new Date(trade.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isProfit ? "+" : ""}{trade.profitLoss.toFixed(2)}
                        </p>
                        {trade.lotSize ? <p className="mt-1 text-xs text-slate-500">Lot size {trade.lotSize}</p> : null}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">{trade.date ? "Recorded on date" : "Saved locally"}</p>
                      <button
                        type="button"
                        onClick={() => deleteTrade(trade.id)}
                        className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
