"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useMemo } from "react";
import { formatCurrency, formatPercent } from "../lib/tracker-data";
import { getGoalsSummary } from "../lib/tracker-calculations";
import { useTrackerStore } from "../lib/tracker-store";

export default function GoalsPage() {
  const data = useTrackerStore();
  const stats = useMemo(() => data.stats, [data.stats]);
  const goalsSummary = useMemo(() => getGoalsSummary(data), [data]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">Goals</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Your payout and consistency roadmap</h1>
              <p className="mt-2 text-sm text-slate-300">Everything is calculated from your saved trades and settings in local storage.</p>
            </div>
            <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              Back
            </Link>
          </div>
        </header>

        <section className="mt-4 rounded-[28px] border border-cyan-400/20 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-300">Blueberry Payout Progress</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Stay focused on the next milestone</h2>
            </div>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
              {stats.payoutEligible ? "Eligible" : "Not Eligible"}
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-sm text-cyan-100">Current Profit</p>
                <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(stats.currentProfit, data.settings.usdToInr)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-100">Minimum Target</p>
                <p className="mt-1 text-xl font-semibold text-white">{formatCurrency(data.settings.minimumProfitForPayout, data.settings.usdToInr)}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-cyan-100">
                <span>Remaining Profit Needed</span>
                <span>{formatCurrency(stats.profitRemainingUntilPayout, data.settings.usdToInr)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-950/70">
                <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${goalsSummary.progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trading Days</p>
                <p className="mt-1 text-lg font-semibold text-white">{stats.tradingDaysCompleted} / {data.settings.minimumTradingDays}</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Countdown</p>
                <p className="mt-1 text-lg font-semibold text-white">{stats.nextPayoutCountdownDays}d</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                <p className="mt-1 text-lg font-semibold text-white">{stats.payoutEligible ? "Eligible" : "Pending"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <h2 className="text-xl font-semibold text-white">Trading Performance</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Win Rate</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(stats.winRate)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Current Win Streak</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stats.currentWinStreak}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Best Win Streak</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stats.bestWinStreak}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Avg Profit / Win</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.averageProfitPerWinningTrade, data.settings.usdToInr)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Avg Loss / Loss</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.averageLossPerLosingTrade, data.settings.usdToInr)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Profit Factor</p>
              <p className="mt-2 text-2xl font-semibold text-white">{Number.isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞"}</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-emerald-400/20 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <h2 className="text-xl font-semibold text-white">Motivation</h2>
          <p className="mt-2 text-sm text-slate-300">{goalsSummary.motivationMessage}</p>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <h2 className="text-xl font-semibold text-white">Milestones</h2>
          <div className="mt-4 space-y-3">
            {goalsSummary.milestones.map((milestone) => (
              <div key={milestone.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                <span className="text-sm text-slate-300">{milestone.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-sm ${milestone.done ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                  {milestone.done ? "✓" : "•"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
