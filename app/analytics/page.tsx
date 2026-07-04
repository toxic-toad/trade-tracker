"use client";

export const dynamic = "force-dynamic";

import { Activity, BarChart3, CalendarClock, Gauge, LineChart as LineChartIcon, Ratio } from "lucide-react";
import { useMemo } from "react";
import { AppCard, BackLink, EmptyState, PageHeader, PageShell, StatCard } from "../components/ui-primitives";
import { BarChart, LineChart, RatioBar } from "../components/charts";
import { formatCurrency } from "../lib/tracker-data";
import { getAnalytics } from "../lib/tracker-calculations";
import { useTrackerStore } from "../lib/tracker-store";

export default function AnalyticsPage() {
  const data = useTrackerStore();
  const analytics = useMemo(() => getAnalytics(data.trades), [data.trades]);
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

  const winLossRatioLabel = Number.isFinite(analytics.winLossRatio) ? `${analytics.winLossRatio.toFixed(2)} : 1` : "∞";
  const profitFactorLabel = Number.isFinite(analytics.profitFactor) ? analytics.profitFactor.toFixed(2) : "∞";
  const averageRLabel = analytics.averageRMultiple === null ? "N/A" : `${analytics.averageRMultiple.toFixed(2)}R`;

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <PageHeader
          eyebrow="Analytics"
          title="Understand your trading edge"
          description="Every chart is calculated locally from your saved trades. No cloud, no fake data."
          action={<BackLink href="/" />}
        />

        {data.trades.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No analytics yet" description="Add trades to unlock profit, equity, and frequency insights." />
          </div>
        ) : (
          <>
            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Profit factor" value={profitFactorLabel} icon={<Gauge size={16} />} />
              <StatCard label="Win / Loss ratio" value={winLossRatioLabel} subtitle={`${analytics.winningCount}W / ${analytics.losingCount}L`} icon={<Ratio size={16} />} />
              <StatCard label="Average R multiple" value={averageRLabel} subtitle={analytics.rTradeCount > 0 ? `From ${analytics.rTradeCount} trades` : "Add risk amount to enable"} icon={<Activity size={16} />} />
              <StatCard label="Trades / active day" value={analytics.averageTradesPerActiveDay.toFixed(2)} subtitle={`${analytics.activeDays} active days`} icon={<CalendarClock size={16} />} />
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
      </div>
    </PageShell>
  );
}
