"use client";

export const dynamic = "force-dynamic";

import { TrendingUp, TrendingDown, Calendar, Target, Flame, Zap, BarChart3, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppCard, AppLinkButton, AppShell, HeroMetric, MetricTile, PageHeader, ProgressBar, SectionHeader, SkeletonCard } from "./components/ui-primitives";
import { formatUSD, formatINR, formatPercent } from "./lib/tracker-data";
import { getDashboardMetrics } from "./lib/tracker-calculations";
import { useTrackerStore } from "./lib/tracker-store";

const TOAST_KEY = "trade-tracker-toast";

export default function Home() {
  const data = useTrackerStore();
  const [isReady, setIsReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const message = window.sessionStorage.getItem(TOAST_KEY);
    if (message) {
      setToast(message);
      window.sessionStorage.removeItem(TOAST_KEY);
      const timeoutId = window.setTimeout(() => setToast(null), 2200);
      return () => window.clearTimeout(timeoutId);
    }
  }, []);

  const stats = useMemo(() => data.stats, [data.stats]);
  const metrics = useMemo(() => getDashboardMetrics(data.trades), [data.trades]);

  const profitProgress = Math.min(100, Math.round((Math.max(0, stats.currentProfit) / data.settings.minimumProfitForPayout) * 100));
  const daysProgress = Math.min(100, Math.round((stats.tradingDaysCompleted / data.settings.minimumTradingDays) * 100));
  const consistencyPercent = stats.winRate;
  const consistencySafe = consistencyPercent <= 20;

  const profitAccent = stats.currentProfit >= 0 ? "profit" : "loss";

  return (
    <AppShell activeTab="dashboard">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 shadow-lg backdrop-blur animate-fade-in">{toast}</div>
      ) : null}

      <PageHeader
        title="Dashboard"
        subtitle={`Cycle ${data.settings.currentCycleNumber}`}
        accent="cyan"
        action={<AppLinkButton href="/add" className="hidden sm:inline-flex" variant="primary"><Zap size={14} />Add Trade</AppLinkButton>}
      />

      {!isReady ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
      ) : (
        <>
          {/* Current Cycle - Hero Section */}
          <section className="mt-4">
            <HeroMetric
              label="Current Profit"
              value={formatUSD(stats.currentProfit)}
              accent={profitAccent}
              icon={stats.currentProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              subtitle={`${profitProgress}% of ${formatUSD(data.settings.minimumProfitForPayout)} target`}
            />
            <div className="mt-3">
              <ProgressBar
                value={profitProgress}
                barClassName={stats.currentProfit >= 0 ? "from-emerald-500 to-cyan-400" : "from-rose-500 to-rose-400"}
              />
            </div>
          </section>

          {/* Supporting Metrics */}
          <section className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            <MetricTile
              label="Best Day"
              value={formatUSD(metrics.largestWin)}
              accent="profit"
              icon={<TrendingUp size={14} />}
            />
            <MetricTile
              label="Consistency"
              value={`${consistencyPercent.toFixed(1)}%`}
              accent={consistencySafe ? "profit" : consistencyPercent <= 30 ? "amber" : "loss"}
              icon={<Target size={14} />}
            />
            <MetricTile
              label="Trading Days"
              value={`${stats.tradingDaysCompleted} / ${data.settings.minimumTradingDays}`}
              accent="cyan"
              icon={<Calendar size={14} />}
            />
            <MetricTile
              label="Win Streak"
              value={String(stats.currentWinStreak)}
              accent={stats.currentWinStreak > 0 ? "amber" : "default"}
              icon={<Flame size={14} />}
            />
          </section>

          {/* Payout Readiness */}
          <section className="mt-5">
            <SectionHeader title="Payout Readiness" accent="cyan" icon={<BarChart3 size={13} />} />
            <AppCard accent={stats.payoutEligible ? "emerald" : "amber"} className="mt-2">
              {stats.payoutEligible ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Zap size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-emerald-400">Ready for Payout</p>
                    <p className="mt-0.5 text-xs text-slate-400">All conditions met</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-emerald-400">{formatUSD(stats.currentProfit)}</p>
                    <p className="text-xs text-slate-500">Available</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      <Target size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-amber-400">Not Ready</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {stats.profitRemainingUntilPayout > 0 && stats.tradingDaysCompleted < data.settings.minimumTradingDays
                          ? "2 conditions remaining"
                          : stats.profitRemainingUntilPayout > 0
                            ? "1 condition remaining"
                            : "1 condition remaining"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {stats.profitRemainingUntilPayout > 0 ? (
                      <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="text-xs text-slate-400">Profit remaining</span>
                        <span className="text-xs font-medium text-amber-300">{formatUSD(stats.profitRemainingUntilPayout)}</span>
                      </div>
                    ) : null}
                    {stats.tradingDaysCompleted < data.settings.minimumTradingDays ? (
                      <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="text-xs text-slate-400">Trading days needed</span>
                        <span className="text-xs font-medium text-amber-300">{stats.tradingDaysCompleted} / {data.settings.minimumTradingDays}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </AppCard>
          </section>

          {/* Debt Impact */}
          <section className="mt-5">
            <SectionHeader title="Debt Impact" accent="violet" icon={<Wallet size={13} />} />
            <AppCard accent="violet" className="mt-2">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold tracking-tight text-violet-400">{formatINR(data.settings.currentDebt)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Remaining debt</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-300">{stats.debtProgressPercent}%</p>
                  <p className="text-xs text-slate-500">cleared</p>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar value={stats.debtProgressPercent} barClassName="from-violet-500 to-violet-400" />
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>{formatINR(data.settings.originalDebt)}</span>
                <span>₹0</span>
              </div>
            </AppCard>
          </section>

          {/* Performance Overview */}
          <section className="mt-5">
            <SectionHeader title="Performance" accent="blue" icon={<BarChart3 size={13} />} />
            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <MetricTile label="Today" value={formatUSD(metrics.todayProfit)} accent={metrics.todayProfit >= 0 ? "profit" : "loss"} />
              <MetricTile label="This Week" value={formatUSD(metrics.weekProfit)} accent={metrics.weekProfit >= 0 ? "profit" : "loss"} />
              <MetricTile label="This Month" value={formatUSD(metrics.monthProfit)} accent={metrics.monthProfit >= 0 ? "profit" : "loss"} />
              <MetricTile label="Avg Daily" value={formatUSD(metrics.averageDailyProfit)} accent="cyan" />
              <MetricTile label="Largest Win" value={formatUSD(metrics.largestWin)} accent="profit" />
              <MetricTile label="Largest Loss" value={formatUSD(metrics.largestLoss)} accent="loss" />
            </div>
          </section>

          {/* Quick Stats */}
          <section className="mt-5 mb-4">
            <div className="grid grid-cols-3 gap-2.5">
              <MetricTile label="Avg Win" value={formatUSD(stats.averageProfitPerWinningTrade)} accent="profit" className="text-center" />
              <MetricTile label="Avg Loss" value={formatUSD(-stats.averageLossPerLosingTrade)} accent="loss" className="text-center" />
              <MetricTile label="Best Streak" value={String(stats.bestWinStreak)} accent="amber" className="text-center" />
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
