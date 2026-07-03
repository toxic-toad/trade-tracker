"use client";

export const dynamic = "force-dynamic";

import { Activity, ArrowRight, CheckCircle2, Sparkles, Target } from "lucide-react";
import { useMemo } from "react";
import { AppCard, PageHeader, PageShell, ProgressBar, StatCard } from "../components/ui-primitives";
import { formatCurrency, formatPercent } from "../lib/tracker-data";
import { getGoalsSummary } from "../lib/tracker-calculations";
import { useTrackerStore } from "../lib/tracker-store";

export default function GoalsPage() {
  const data = useTrackerStore();
  const stats = useMemo(() => data.stats, [data.stats]);
  const goalsSummary = useMemo(() => getGoalsSummary(data), [data]);

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <PageHeader eyebrow="Goals" title="Your payout and consistency roadmap" description="Everything is calculated from your saved trades and settings in local storage." action={<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">Progress tracker</div>} />

        <AppCard accent="cyan" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-300">Blueberry payout progress</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Stay focused on the next milestone</h2>
            </div>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">{stats.payoutEligible ? "Eligible" : "Not Eligible"}</span>
          </div>

          <div className="mt-4 rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-950/70 to-slate-950/80 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-sm text-cyan-100">Current profit</p>
                <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(stats.currentProfit, data.settings.usdToInr)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-100">Minimum target</p>
                <p className="mt-1 text-xl font-semibold text-white">{formatCurrency(data.settings.minimumProfitForPayout, data.settings.usdToInr)}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-cyan-100">
                <span>Remaining profit needed</span>
                <span>{formatCurrency(stats.profitRemainingUntilPayout, data.settings.usdToInr)}</span>
              </div>
              <div className="mt-2"><ProgressBar value={goalsSummary.progressPercent} trackClassName="bg-slate-950/80" barClassName="from-cyan-500 to-blue-600" /></div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trading days</p>
                <p className="mt-1 text-lg font-semibold text-white">{stats.tradingDaysCompleted} / {data.settings.minimumTradingDays}</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Countdown</p>
                <p className="mt-1 text-lg font-semibold text-white">{stats.nextPayoutCountdownDays}d</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                <p className="mt-1 text-lg font-semibold text-white">{stats.payoutEligible ? "Eligible" : "Pending"}</p>
              </div>
            </div>
          </div>
        </AppCard>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Win rate" value={formatPercent(stats.winRate)} icon={<Target size={16} />} />
          <StatCard label="Current win streak" value={String(stats.currentWinStreak)} icon={<Activity size={16} />} />
          <StatCard label="Best win streak" value={String(stats.bestWinStreak)} icon={<Sparkles size={16} />} />
          <StatCard label="Avg profit / win" value={formatCurrency(stats.averageProfitPerWinningTrade, data.settings.usdToInr)} icon={<Sparkles size={16} />} />
          <StatCard label="Avg loss / loss" value={formatCurrency(stats.averageLossPerLosingTrade, data.settings.usdToInr)} icon={<Sparkles size={16} />} />
          <StatCard label="Profit factor" value={Number.isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞"} icon={<Sparkles size={16} />} />
        </section>

        <AppCard accent="emerald" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <h2 className="text-xl font-semibold text-white">Motivation</h2>
          <p className="mt-2 text-sm text-slate-300">{goalsSummary.motivationMessage}</p>
        </AppCard>

        <AppCard accent="default" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <h2 className="text-xl font-semibold text-white">Milestones</h2>
          <div className="mt-4 space-y-3">
            {goalsSummary.milestones.map((milestone) => (
              <div key={milestone.label} className="flex items-center justify-between rounded-2xl border border-slate-800/90 bg-slate-950/60 p-3">
                <span className="text-sm text-slate-300">{milestone.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-sm ${milestone.done ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                  {milestone.done ? <CheckCircle2 size={14} className="inline" /> : "•"}
                </span>
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </PageShell>
  );
}
