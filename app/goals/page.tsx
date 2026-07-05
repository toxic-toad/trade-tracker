"use client";

export const dynamic = "force-dynamic";

import { Activity, CheckCircle2, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { AppButton, AppCard, AppShell, PageHeader, ProgressBar, StatCard } from "../components/ui-primitives";
import { formatCurrency, formatPercent } from "../lib/tracker-data";
import { getGoalsSummary } from "../lib/tracker-calculations";
import { processPayout, useTrackerStore } from "../lib/tracker-store";

const TOAST_KEY = "trade-tracker-toast";

export default function GoalsPage() {
  const data = useTrackerStore();
  const stats = useMemo(() => data.stats, [data.stats]);
  const goalsSummary = useMemo(() => getGoalsSummary(data), [data]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const payoutUsd = Math.max(0, stats.currentProfit * (data.settings.profitSplit / 100));
  const payoutInr = payoutUsd * data.settings.usdToInr;
  const debtAfter = Math.max(0, data.settings.currentDebt - payoutInr);
  const missingReasons = [
    stats.tradingDaysCompleted < data.settings.minimumTradingDays ? `Minimum trading days: ${stats.tradingDaysCompleted} / ${data.settings.minimumTradingDays}` : "",
    stats.currentProfit < data.settings.minimumProfitForPayout ? `Profit target: ${formatCurrency(stats.currentProfit, data.settings.usdToInr)} / ${formatCurrency(data.settings.minimumProfitForPayout, data.settings.usdToInr)}` : "",
  ].filter(Boolean);

  const confirmPayout = () => {
    const payout = processPayout();
    setShowConfirm(false);
    setToast("Payout applied.");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(TOAST_KEY, "Payout Applied");
    }
    window.setTimeout(() => setToast(null), 2200);
    return payout;
  };

  return (
    <AppShell activeTab="goals">
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 shadow-lg backdrop-blur">{toast}</div> : null}
      <PageHeader eyebrow="Goals" title="Your payout and consistency roadmap" description="Current cycle values match the dashboard and reset only after a confirmed payout." />

      <AppCard accent="cyan" className="mt-4 animate-[fadeIn_400ms_ease-out]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-300">Payout progress</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Cycle {data.settings.currentCycleNumber}</h2>
          </div>
          <div className="text-left sm:text-right">
            <AppButton type="button" disabled={!stats.payoutEligible} onClick={() => setShowConfirm(true)} className="w-full sm:w-auto">
              Request Payout
            </AppButton>
            {!stats.payoutEligible ? <p className="mt-2 max-w-sm text-xs text-slate-400">{missingReasons.join(" and ")}</p> : null}
          </div>
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
            <MiniMetric label="Trading days" value={`${stats.tradingDaysCompleted} / ${data.settings.minimumTradingDays}`} />
            <MiniMetric label="Countdown" value={`${stats.nextPayoutCountdownDays}d`} />
            <MiniMetric label="Status" value={stats.payoutEligible ? "Eligible" : "Pending"} />
          </div>
        </div>
      </AppCard>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Win rate" value={formatPercent(stats.winRate)} icon={<Target size={16} />} />
        <StatCard label="Current streak" value={String(stats.currentWinStreak)} icon={<Activity size={16} />} />
        <StatCard label="Best streak" value={String(stats.bestWinStreak)} icon={<Sparkles size={16} />} />
        <StatCard label="Avg profit / win" value={formatCurrency(stats.averageProfitPerWinningTrade, data.settings.usdToInr)} icon={<Sparkles size={16} />} />
        <StatCard label="Avg loss / loss" value={formatCurrency(stats.averageLossPerLosingTrade, data.settings.usdToInr)} icon={<Sparkles size={16} />} />
        <StatCard label="Profit factor" value={Number.isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "Infinity"} icon={<Sparkles size={16} />} />
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
                {milestone.done ? <CheckCircle2 size={14} className="inline" /> : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </AppCard>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur sm:items-center">
          <AppCard accent="cyan" className="w-full max-w-xl">
            <h2 className="text-xl font-semibold text-white">Confirm Payout?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MiniMetric label="Cycle Number" value={String(data.settings.currentCycleNumber)} />
              <MiniMetric label="Trading Profit (USD)" value={`$${stats.currentProfit.toFixed(2)}`} />
              <MiniMetric label="Trading Profit (INR)" value={formatCurrency(stats.currentProfit, data.settings.usdToInr)} />
              <MiniMetric label="Profit Split" value={`${data.settings.profitSplit}%`} />
              <MiniMetric label="Expected Payout (USD)" value={`$${payoutUsd.toFixed(2)}`} />
              <MiniMetric label="Expected Payout (INR)" value={formatCurrency(payoutInr, 1)} />
              <MiniMetric label="Debt Before" value={formatCurrency(data.settings.currentDebt, 1)} />
              <MiniMetric label="Debt After" value={formatCurrency(debtAfter, 1)} />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButton type="button" className="flex-1" onClick={confirmPayout}>Confirm Payout</AppButton>
              <AppButton type="button" variant="secondary" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</AppButton>
            </div>
          </AppCard>
        </div>
      ) : null}
    </AppShell>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
