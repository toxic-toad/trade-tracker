"use client";

export const dynamic = "force-dynamic";

import { Activity, PlusCircle, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppCard, AppLinkButton, AppShell, PageHeader, SkeletonCard, StatCard } from "./components/ui-primitives";
import { formatCurrency, formatPercent } from "./lib/tracker-data";
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

  const performanceCards = useMemo(
    () => [
      { title: "Today's Profit/Loss", value: formatCurrency(metrics.todayProfit, data.settings.usdToInr), tone: metrics.todayProfit >= 0 ? "text-emerald-300" : "text-rose-300" },
      { title: "This Week", value: formatCurrency(metrics.weekProfit, data.settings.usdToInr), tone: metrics.weekProfit >= 0 ? "text-emerald-300" : "text-rose-300" },
      { title: "This Month", value: formatCurrency(metrics.monthProfit, data.settings.usdToInr), tone: metrics.monthProfit >= 0 ? "text-emerald-300" : "text-rose-300" },
      { title: "Average Daily Profit", value: formatCurrency(metrics.averageDailyProfit, data.settings.usdToInr), tone: metrics.averageDailyProfit >= 0 ? "text-emerald-300" : "text-rose-300" },
      { title: "Average Winning Trade", value: formatCurrency(stats.averageProfitPerWinningTrade, data.settings.usdToInr), tone: "text-emerald-300" },
      { title: "Average Losing Trade", value: formatCurrency(-stats.averageLossPerLosingTrade, data.settings.usdToInr), tone: "text-rose-300" },
      { title: "Largest Win", value: formatCurrency(metrics.largestWin, data.settings.usdToInr), tone: "text-emerald-300" },
      { title: "Largest Loss", value: formatCurrency(metrics.largestLoss, data.settings.usdToInr), tone: "text-rose-300" },
      { title: "Current Win Streak", value: String(stats.currentWinStreak), tone: "text-white" },
      { title: "Best Win Streak", value: String(stats.bestWinStreak), tone: "text-white" },
    ],
    [metrics, stats.averageProfitPerWinningTrade, stats.averageLossPerLosingTrade, stats.currentWinStreak, stats.bestWinStreak, data.settings.usdToInr],
  );

  const dashboardCards = useMemo(
    () => [
      { title: "Current Balance", value: formatCurrency(stats.currentBalance, 1), subtitle: "Funded account plus current cycle P/L" },
      { title: "Current Profit", value: formatCurrency(stats.currentProfit, data.settings.usdToInr), subtitle: "Sum of current cycle trade P/L" },
      { title: "Profit Remaining Until Payout", value: formatCurrency(stats.profitRemainingUntilPayout, data.settings.usdToInr), subtitle: `${data.settings.minimumProfitForPayout} minimum target` },
      { title: "Trading Days Completed", value: `${stats.tradingDaysCompleted} / ${data.settings.minimumTradingDays}`, subtitle: "Current cycle trading days" },
      { title: "Next Payout Countdown", value: `${stats.nextPayoutCountdownDays}d`, subtitle: `${data.settings.payoutCycleDays}-day cycle` },
      { title: "Current Debt", value: formatCurrency(stats.currentDebt, 1), subtitle: "Only reduced after confirmed payments" },
      { title: "Debt Progress", value: formatPercent(stats.debtProgressPercent), subtitle: "Confirmed reduction from original debt" },
    ],
    [data.settings.minimumProfitForPayout, data.settings.minimumTradingDays, data.settings.payoutCycleDays, data.settings.usdToInr, stats],
  );

  return (
    <AppShell activeTab="dashboard">
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 shadow-lg backdrop-blur">{toast}</div> : null}
      <PageHeader
        eyebrow="Trade Tracker"
        title="Private trading dashboard"
        description="Your current cycle, payout readiness, and debt progress update instantly from saved trades."
        action={<AppLinkButton href="/add" className="hidden sm:inline-flex"><PlusCircle size={16} />Add Trade</AppLinkButton>}
      />

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {!isReady ? (
          Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} className="h-28" />)
        ) : (
          dashboardCards.map((card, index) => (
            <div key={card.title} className="animate-[fadeIn_400ms_ease-out]" style={{ animationDelay: `${index * 70}ms` }}>
              <StatCard label={card.title} value={card.value} subtitle={card.subtitle} icon={card.title === "Current Debt" ? <WalletCards size={16} /> : undefined} />
            </div>
          ))
        )}
      </section>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Performance metrics</h2>
      <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {!isReady ? (
          Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} className="h-24" />)
        ) : (
          performanceCards.map((card, index) => (
            <div key={card.title} className="animate-[fadeIn_400ms_ease-out]" style={{ animationDelay: `${index * 60}ms` }}>
              <StatCard label={card.title} value={card.value} valueClassName={card.tone} icon={<Activity size={16} />} />
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}
