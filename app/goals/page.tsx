"use client";

export const dynamic = "force-dynamic";

import { Activity, CheckCircle2, Target, Flame, Zap, TrendingUp, Award } from "lucide-react";
import { useMemo, useState } from "react";
import { AppButton, AppCard, AppShell, HeroMetric, MetricTile, PageHeader, ProgressBar, SectionHeader } from "../components/ui-primitives";
import { formatUSD, formatINR, formatPercent } from "../lib/tracker-data";
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
    stats.tradingDaysCompleted < data.settings.minimumTradingDays ? `Min days: ${stats.tradingDaysCompleted} / ${data.settings.minimumTradingDays}` : "",
    stats.currentProfit < data.settings.minimumProfitForPayout ? `Profit: ${formatUSD(stats.currentProfit)} / ${formatUSD(data.settings.minimumProfitForPayout)}` : "",
  ].filter(Boolean);

  const confirmPayout = () => {
    processPayout();
    setShowConfirm(false);
    setToast("Payout applied.");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(TOAST_KEY, "Payout Applied");
    }
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <AppShell activeTab="goals">
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 shadow-lg backdrop-blur animate-fade-in">{toast}</div> : null}

      <PageHeader title="Goals" subtitle={`Cycle ${data.settings.currentCycleNumber}`} accent="violet" />

      {/* Payout Progress Hero */}
      <section className="mt-4">
        <HeroMetric
          label="Cycle Profit"
          value={formatUSD(stats.currentProfit)}
          accent={stats.payoutEligible ? "profit" : "cyan"}
          icon={stats.payoutEligible ? <Zap size={20} /> : <Target size={20} />}
          subtitle={`${goalsSummary.progressPercent}% of payout target`}
        />
        <div className="mt-3">
          <ProgressBar value={goalsSummary.progressPercent} barClassName={stats.payoutEligible ? "from-emerald-500 to-emerald-400" : "from-cyan-500 to-cyan-400"} />
        </div>
      </section>

      {/* Payout Status */}
      <section className="mt-4">
        <AppCard accent={stats.payoutEligible ? "emerald" : "amber"}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${stats.payoutEligible ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {stats.payoutEligible ? <CheckCircle2 size={18} /> : <Target size={18} />}
              </div>
              <div>
                <p className={`text-sm font-medium ${stats.payoutEligible ? "text-emerald-400" : "text-amber-400"}`}>
                  {stats.payoutEligible ? "Eligible for Payout" : "Not Yet Eligible"}
                </p>
                {!stats.payoutEligible ? <p className="mt-0.5 text-xs text-slate-400">{missingReasons.join(" and ")}</p> : null}
              </div>
            </div>
            <AppButton type="button" disabled={!stats.payoutEligible} onClick={() => setShowConfirm(true)} variant={stats.payoutEligible ? "profit" : "secondary"}>
              Request Payout
            </AppButton>
          </div>
        </AppCard>
      </section>

      {/* Goals Grid */}
      <section className="mt-5">
        <SectionHeader title="Goal Progress" accent="violet" icon={<Award size={13} />} />
        <div className="mt-2 space-y-2">
          <GoalCard
            label="Profit Target"
            current={formatUSD(stats.currentProfit)}
            target={formatUSD(data.settings.minimumProfitForPayout)}
            progress={goalsSummary.progressPercent}
            accent="emerald"
            icon={<TrendingUp size={14} />}
          />
          <GoalCard
            label="Trading Days"
            current={String(stats.tradingDaysCompleted)}
            target={String(data.settings.minimumTradingDays)}
            progress={Math.min(100, Math.round((stats.tradingDaysCompleted / data.settings.minimumTradingDays) * 100))}
            accent="cyan"
            icon={<Activity size={14} />}
          />
          <GoalCard
            label="Payout Eligibility"
            current={stats.payoutEligible ? "Ready" : "Pending"}
            target=""
            progress={stats.payoutEligible ? 100 : goalsSummary.progressPercent}
            accent={stats.payoutEligible ? "emerald" : "amber"}
            icon={<Zap size={14} />}
          />
        </div>
      </section>

      {/* Cycle Stats */}
      <section className="mt-5">
        <SectionHeader title="Cycle Stats" accent="cyan" icon={<Flame size={13} />} />
        <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <MetricTile label="Win Rate" value={formatPercent(stats.winRate)} accent="cyan" icon={<Target size={14} />} />
          <MetricTile label="Current Streak" value={String(stats.currentWinStreak)} accent="amber" icon={<Flame size={14} />} />
          <MetricTile label="Best Streak" value={String(stats.bestWinStreak)} accent="amber" icon={<Zap size={14} />} />
          <MetricTile label="Avg Win" value={formatUSD(stats.averageProfitPerWinningTrade)} accent="profit" />
          <MetricTile label="Avg Loss" value={formatUSD(-stats.averageLossPerLosingTrade)} accent="loss" />
          <MetricTile label="Profit Factor" value={Number.isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "Inf"} accent="blue" />
        </div>
      </section>

      {/* Milestones */}
      <section className="mt-5">
        <SectionHeader title="Milestones" accent="amber" icon={<Award size={13} />} />
        <div className="mt-2 space-y-1.5">
          {goalsSummary.milestones.map((milestone) => (
            <div key={milestone.label} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${milestone.done ? "border-emerald-500/15 bg-emerald-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <div className="flex items-center gap-2.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${milestone.done ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.06] text-slate-500"}`}>
                  <CheckCircle2 size={12} />
                </div>
                <span className={`text-sm ${milestone.done ? "text-emerald-300" : "text-slate-400"}`}>{milestone.label}</span>
              </div>
              <span className={`text-xs font-medium ${milestone.done ? "text-emerald-400" : "text-slate-500"}`}>
                {milestone.done ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Motivation */}
      <section className="mt-5 mb-4">
        <AppCard accent="emerald">
          <p className="text-sm text-slate-300">{goalsSummary.motivationMessage}</p>
        </AppCard>
      </section>

      {/* Confirm Modal */}
      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <AppCard className="w-full max-w-lg animate-scale-in" accent="cyan">
            <h2 className="text-lg font-semibold text-white">Confirm Payout</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat label="Cycle" value={String(data.settings.currentCycleNumber)} />
              <MiniStat label="Profit" value={`$${stats.currentProfit.toFixed(2)}`} />
              <MiniStat label="Split" value={`${data.settings.profitSplit}%`} />
              <MiniStat label="Payout" value={`$${payoutUsd.toFixed(2)}`} />
              <MiniStat label="INR" value={formatINR(payoutInr)} />
              <MiniStat label="Debt After" value={formatINR(debtAfter)} />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <AppButton type="button" className="flex-1" onClick={confirmPayout} variant="profit">Confirm Payout</AppButton>
              <AppButton type="button" variant="secondary" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</AppButton>
            </div>
          </AppCard>
        </div>
      ) : null}
    </AppShell>
  );
}

function GoalCard({ label, current, target, progress, accent, icon }: { label: string; current: string; target: string; progress: number; accent: "emerald" | "cyan" | "amber" | "violet"; icon: ReactNode }) {
  const accents: Record<string, { border: string; iconBg: string; iconText: string; barFrom: string; barTo: string; text: string }> = {
    emerald: { border: "border-emerald-500/15", iconBg: "bg-emerald-500/10", iconText: "text-emerald-400", barFrom: "from-emerald-500", barTo: "to-emerald-400", text: "text-emerald-400" },
    cyan: { border: "border-cyan-500/15", iconBg: "bg-cyan-500/10", iconText: "text-cyan-400", barFrom: "from-cyan-500", barTo: "to-cyan-400", text: "text-cyan-400" },
    amber: { border: "border-amber-500/15", iconBg: "bg-amber-500/10", iconText: "text-amber-400", barFrom: "from-amber-500", barTo: "to-amber-400", text: "text-amber-400" },
    violet: { border: "border-violet-500/15", iconBg: "bg-violet-500/10", iconText: "text-violet-400", barFrom: "from-violet-500", barTo: "to-violet-400", text: "text-violet-400" },
  };
  const a = accents[accent];

  return (
    <div className={`rounded-xl border ${a.border} bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${a.iconBg} ${a.iconText}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-200">{label}</p>
            <p className={`text-xs font-semibold ${progress >= 100 ? "text-emerald-400" : a.text}`}>{progress}%</p>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white">{current}</span>
            {target ? <span className="text-xs text-slate-500">/ {target}</span> : null}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={progress} barClassName={`bg-gradient-to-r ${a.barFrom} ${a.barTo}`} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2.5 py-2">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

import { ReactNode } from "react";
