"use client";

export const dynamic = "force-dynamic";

import { Activity, BarChart3, CalendarClock, Gauge, LineChart as LineChartIcon, Ratio, TrendingUp, TrendingDown, Zap, Flame } from "lucide-react";
import { useMemo } from "react";
import { AppCard, AppShell, EmptyState, HeroMetric, MetricTile, PageHeader, SectionHeader } from "../components/ui-primitives";
import { BarChart, LineChart, RatioBar } from "../components/charts";
import { formatUSD, formatPercent } from "../lib/tracker-data";
import { getAnalytics, getDashboardMetrics } from "../lib/tracker-calculations";
import { useTrackerStore } from "../lib/tracker-store";

export default function AnalyticsPage() {
  const data = useTrackerStore();
  const analytics = useMemo(() => getAnalytics(data.trades), [data.trades]);
  const metrics = useMemo(() => getDashboardMetrics(data.trades), [data.trades]);
  const stats = data.stats;

  const monthlyBars = useMemo(
    () => analytics.profitByMonth.map((month) => ({ label: month.label, value: month.profit })),
    [analytics.profitByMonth],
  );
  const weekdayBars = useMemo(
    () => analytics.tradesByWeekday.map((weekday) => ({ label: weekday.label, value: weekday.count })),
    [analytics.tradesByWeekday],
  );
  const equityValues = useMemo(() => analytics.equityCurve.map((point) => point.cumulative), [analytics.equityCurve]);

  const winLossRatioLabel = Number.isFinite(analytics.winLossRatio) ? `${analytics.winLossRatio.toFixed(2)} : 1` : "Infinity";
  const profitFactorLabel = Number.isFinite(analytics.profitFactor) ? analytics.profitFactor.toFixed(2) : "Infinity";
  const averageRLabel = analytics.averageRMultiple === null ? "N/A" : `${analytics.averageRMultiple.toFixed(2)}R`;

  const totalProfit = equityValues.length > 0 ? equityValues[equityValues.length - 1] : 0;

  return (
    <AppShell activeTab="analytics">
      <PageHeader title="Analytics" subtitle="Performance insights from your trades" accent="blue" />

      {data.trades.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No analytics yet" description="Add trades to unlock profit, equity, and frequency insights." />
        </div>
      ) : (
        <>
          {/* Hero Metric */}
          <section className="mt-4">
            <HeroMetric
              label="Total Profit"
              value={formatUSD(totalProfit)}
              accent={totalProfit >= 0 ? "profit" : "loss"}
              icon={totalProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              subtitle={`${analytics.totalTrades} total trades`}
            />
          </section>

          {/* Key Metrics Grid */}
          <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MetricTile label="Win Rate" value={formatPercent(stats.winRate)} accent="cyan" icon={<Target size={14} />} />
            <MetricTile label="Profit Factor" value={profitFactorLabel} accent="blue" icon={<Gauge size={14} />} />
            <MetricTile label="Win/Loss" value={winLossRatioLabel} accent={analytics.winningCount > analytics.losingCount ? "profit" : "loss"} icon={<Ratio size={14} />} />
            <MetricTile label="Avg R" value={averageRLabel} accent="cyan" icon={<Activity size={14} />} />
            <MetricTile label="Avg Win" value={formatUSD(stats.averageProfitPerWinningTrade)} accent="profit" icon={<TrendingUp size={14} />} />
            <MetricTile label="Avg Loss" value={formatUSD(-stats.averageLossPerLosingTrade)} accent="loss" icon={<TrendingDown size={14} />} />
            <MetricTile label="Big Win" value={formatUSD(metrics.largestWin)} accent="profit" />
            <MetricTile label="Big Loss" value={formatUSD(metrics.largestLoss)} accent="loss" />
            <MetricTile label="Trades/Day" value={analytics.averageTradesPerActiveDay.toFixed(1)} accent="amber" icon={<CalendarClock size={14} />} />
          </section>

          {/* Streaks & Activity */}
          <section className="mt-5 grid grid-cols-3 gap-2.5">
            <MetricTile label="Win Streak" value={String(stats.currentWinStreak)} accent="amber" icon={<Flame size={14} />} className="text-center" />
            <MetricTile label="Best Streak" value={String(stats.bestWinStreak)} accent="amber" icon={<Zap size={14} />} className="text-center" />
            <MetricTile label="Active Days" value={String(analytics.activeDays)} accent="cyan" className="text-center" />
          </section>

          {/* Period Performance */}
          <section className="mt-5">
            <SectionHeader title="Period Performance" accent="emerald" icon={<BarChart3 size={13} />} />
            <div className="mt-2 grid grid-cols-3 gap-2.5">
              <MetricTile label="Today" value={formatUSD(metrics.todayProfit)} accent={metrics.todayProfit >= 0 ? "profit" : "loss"} />
              <MetricTile label="This Week" value={formatUSD(metrics.weekProfit)} accent={metrics.weekProfit >= 0 ? "profit" : "loss"} />
              <MetricTile label="This Month" value={formatUSD(metrics.monthProfit)} accent={metrics.monthProfit >= 0 ? "profit" : "loss"} />
            </div>
          </section>

          {/* Equity Curve */}
          <section className="mt-5">
            <SectionHeader title="Equity Curve" accent="cyan" icon={<LineChartIcon size={13} />} />
            <AppCard className="mt-2">
              <LineChart values={equityValues} formatValue={(v) => formatUSD(v)} color="cyan" />
            </AppCard>
          </section>

          {/* Profit by Month */}
          <section className="mt-5">
            <SectionHeader title="Profit by Month" accent="emerald" icon={<BarChart3 size={13} />} />
            <AppCard className="mt-2">
              <BarChart data={monthlyBars} diverging color="emerald" valueFormatter={(v) => formatUSD(v)} />
            </AppCard>
          </section>

          {/* Win/Loss & Frequency */}
          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <SectionHeader title="Win / Loss Ratio" accent="emerald" icon={<Ratio size={13} />} />
              <AppCard className="mt-2">
                <RatioBar winning={analytics.winningCount} losing={analytics.losingCount} />
              </AppCard>
            </div>
            <div>
              <SectionHeader title="Trading Frequency" accent="amber" icon={<CalendarClock size={13} />} />
              <AppCard className="mt-2">
                <BarChart data={weekdayBars} color="amber" valueFormatter={(v) => String(v)} height={140} />
              </AppCard>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Target({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
