"use client";

export const dynamic = "force-dynamic";

import { Activity, BarChart3, CalendarClock, Gauge, LineChart as LineChartIcon, Ratio } from "lucide-react";
import { useMemo } from "react";
import { AppCard, AppShell, EmptyState, PageHeader, StatCard } from "../components/ui-primitives";
import { BarChart, LineChart, RatioBar } from "../components/charts";
import { formatCurrency, formatPercent } from "../lib/tracker-data";
import { getAnalytics, getDashboardMetrics } from "../lib/tracker-calculations";
import { useTrackerStore } from "../lib/tracker-store";

export default function AnalyticsPage() {
  const data = useTrackerStore();
  const analytics = useMemo(() => getAnalytics(data.trades), [data.trades]);
  const metrics = useMemo(() => getDashboardMetrics(data.trades), [data.trades]);
  const stats = data.stats;
  const usdToInr = data.settings.usdToInr;

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

  return (
    <AppShell activeTab="analytics">
        <PageHeader
          eyebrow="Analytics"
          title="Understand your trading edge"
          description="Every chart is calculated from your saved trades with the shared metrics engine."
        />

        {data.trades.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No analytics yet" description="Add trades to unlock profit, equity, and frequency insights." />
          </div>
        ) : (
          <>
            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Profit factor" value={profitFactorLabel} icon={<Gauge size={16} />} />
              <StatCard label="Win Rate" value={formatPercent(stats.winRate)} icon={<Gauge size={16} />} />
              <StatCard label="Win / Loss ratio" value={winLossRatioLabel} subtitle={`${analytics.winningCount}W / ${analytics.losingCount}L`} icon={<Ratio size={16} />} />
              <StatCard label="Average R multiple" value={averageRLabel} subtitle={analytics.rTradeCount > 0 ? `From ${analytics.rTradeCount} trades` : "Add risk amount to enable"} icon={<Activity size={16} />} />
              <StatCard label="Trades / active day" value={analytics.averageTradesPerActiveDay.toFixed(2)} subtitle={`${analytics.activeDays} active days`} icon={<CalendarClock size={16} />} />
              <StatCard label="Average Win" value={formatCurrency(stats.averageProfitPerWinningTrade, usdToInr)} valueClassName="text-emerald-300" icon={<Activity size={16} />} />
              <StatCard label="Average Loss" value={formatCurrency(-stats.averageLossPerLosingTrade, usdToInr)} valueClassName="text-rose-300" icon={<Activity size={16} />} />
              <StatCard label="Largest Win" value={formatCurrency(metrics.largestWin, usdToInr)} valueClassName="text-emerald-300" icon={<Activity size={16} />} />
              <StatCard label="Largest Loss" value={formatCurrency(metrics.largestLoss, usdToInr)} valueClassName="text-rose-300" icon={<Activity size={16} />} />
              <StatCard label="Current Streak" value={String(stats.currentWinStreak)} icon={<Activity size={16} />} />
              <StatCard label="Best Streak" value={String(stats.bestWinStreak)} icon={<Activity size={16} />} />
              <StatCard label="Today's Profit" value={formatCurrency(metrics.todayProfit, usdToInr)} valueClassName={metrics.todayProfit >= 0 ? "text-emerald-300" : "text-rose-300"} icon={<Activity size={16} />} />
              <StatCard label="Week" value={formatCurrency(metrics.weekProfit, usdToInr)} valueClassName={metrics.weekProfit >= 0 ? "text-emerald-300" : "text-rose-300"} icon={<Activity size={16} />} />
              <StatCard label="Month" value={formatCurrency(metrics.monthProfit, usdToInr)} valueClassName={metrics.monthProfit >= 0 ? "text-emerald-300" : "text-rose-300"} icon={<Activity size={16} />} />
            </section>

            <AppCard accent="default" className="mt-4">
              <div className="flex items-center gap-2 text-slate-200">
                <LineChartIcon size={16} className="text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">Equity curve</h2>
              </div>
              <p className="mt-1 text-sm text-slate-400">Cumulative profit/loss across your trade history.</p>
              <div className="mt-4">
                <LineChart values={equityValues} formatValue={(value) => formatCurrency(value, usdToInr)} />
              </div>
            </AppCard>

            <AppCard accent="default" className="mt-4">
              <div className="flex items-center gap-2 text-slate-200">
                <BarChart3 size={16} className="text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">Profit by month</h2>
              </div>
              <p className="mt-1 text-sm text-slate-400">Net profit/loss grouped by calendar month.</p>
              <div className="mt-4">
                <BarChart data={monthlyBars} diverging valueFormatter={(value) => formatCurrency(value, usdToInr)} />
              </div>
            </AppCard>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <AppCard accent="default">
                <div className="flex items-center gap-2 text-slate-200">
                  <Ratio size={16} className="text-cyan-300" />
                  <h2 className="text-lg font-semibold text-white">Win / Loss ratio</h2>
                </div>
                <p className="mt-1 text-sm text-slate-400">Share of winning versus losing trades.</p>
                <div className="mt-4">
                  <RatioBar winning={analytics.winningCount} losing={analytics.losingCount} />
                </div>
              </AppCard>

              <AppCard accent="default">
                <div className="flex items-center gap-2 text-slate-200">
                  <CalendarClock size={16} className="text-cyan-300" />
                  <h2 className="text-lg font-semibold text-white">Trading frequency</h2>
                </div>
                <p className="mt-1 text-sm text-slate-400">Number of trades taken by weekday.</p>
                <div className="mt-4">
                  <BarChart data={weekdayBars} valueFormatter={(value) => String(value)} height={140} />
                </div>
              </AppCard>
            </div>
          </>
        )}
    </AppShell>
  );
}
