"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Activity, Home as HomeIcon, History, PlusCircle, Settings, Target, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppCard, AppLinkButton, PageHeader, PageShell, SkeletonCard, StatCard } from "./components/ui-primitives";
import { formatCurrency, formatPercent, type TabId } from "./lib/tracker-data";
import { useTrackerStore } from "./lib/tracker-store";

const tabs: Array<{ id: TabId; label: string; icon: typeof HomeIcon; href?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: HomeIcon, href: "/" },
  { id: "add", label: "Add Trade", icon: PlusCircle, href: "/add" },
  { id: "history", label: "History", icon: History },
  { id: "payout", label: "Goals", icon: Target, href: "/goals" },
  { id: "debt", label: "Financial Progress", icon: WalletCards, href: "/financial" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export default function Home() {
  const data = useTrackerStore();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => data.stats, [data.stats]);

  const dashboardCards = useMemo(
    () => [
      { title: "Current Balance", value: formatCurrency(stats.currentBalance, data.settings.usdToInr), subtitle: "Starting balance + realized profit" },
      { title: "Current Profit", value: formatCurrency(stats.currentProfit, data.settings.usdToInr), subtitle: "Based on your profit split" },
      { title: "Profit Remaining Until Payout", value: formatCurrency(stats.profitRemainingUntilPayout, data.settings.usdToInr), subtitle: `${data.settings.minimumProfitForPayout} minimum target` },
      { title: "Trading Days Completed", value: `${stats.tradingDaysCompleted} / ${data.settings.minimumTradingDays}`, subtitle: "Days with recorded trades" },
      { title: "Next Payout Countdown", value: `${stats.nextPayoutCountdownDays}d`, subtitle: `${data.settings.payoutCycleDays}-day cycle` },
      { title: "Current Debt", value: formatCurrency(stats.currentDebt, 1), subtitle: "Stored in INR" },
      { title: "Debt Progress", value: formatPercent(stats.debtProgressPercent), subtitle: "Salary contribution vs debt" },
    ],
    [data.settings.minimumProfitForPayout, data.settings.minimumTradingDays, data.settings.payoutCycleDays, data.settings.usdToInr, stats],
  );

  const panelCopy: Record<TabId, { title: string; description: string; accent: string }> = {
    dashboard: { title: "Daily overview", description: "Your private finance cockpit stays local, fast, and available offline.", accent: "Offline-first" },
    add: { title: "Add trade", description: "Capture a new trade quickly without syncing or leaving the app.", accent: "Quick capture" },
    history: { title: "Trade history", description: "Review all trades in one private place with zero cloud dependency.", accent: "Local history" },
    payout: { title: "Goals", description: "Track payout progress, consistency, and debt motivation from your own data.", accent: "Goal focus" },
    debt: { title: "Financial progress", description: "Monitor debt payoff, income flow, and your forecast from your own data.", accent: "Financial focus" },
    settings: { title: "Personal settings", description: "Adjust your account assumptions and preferences whenever you need to.", accent: "Persistent settings" },
  };

  const activeContent = panelCopy[activeTab];

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-8">
        <PageHeader
          eyebrow="Trade Tracker"
          title="Private trading dashboard"
          description="Everything stays in your browser storage, works offline, and updates from your personal settings."
          action={
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">Offline</p>
              <p className="text-lg font-semibold text-white">Local only</p>
            </div>
          }
        />

        <AppCard accent="cyan" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-300">{activeContent.title}</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{activeContent.description}</h2>
            </div>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">{activeContent.accent}</span>
          </div>
        </AppCard>

        {activeTab === "dashboard" && (
          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {!isReady ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} className="h-28" />)
            ) : (
              dashboardCards.map((card, index) => (
                <div key={card.title} className="animate-[fadeIn_400ms_ease-out]" style={{ animationDelay: `${index * 70}ms` }}>
                  <StatCard label={card.title} value={card.value} subtitle={card.subtitle} />
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === "add" && (
          <section className="mt-4">
            <AppCard accent="emerald" className="animate-[fadeIn_400ms_ease-out]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300"><PlusCircle size={18} /></div>
                <div>
                  <p className="text-sm text-slate-300">Open the dedicated add-trade page to save a new trade locally.</p>
                  <AppLinkButton href="/add" className="mt-4" variant="primary">Go to Add Trade</AppLinkButton>
                </div>
              </div>
            </AppCard>
          </section>
        )}

        {activeTab === "history" && (
          <section className="mt-4 space-y-3">
            {!isReady ? (
              Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} className="h-24" />)
            ) : data.trades.length === 0 ? (
              <AppCard accent="cyan" className="animate-[fadeIn_400ms_ease-out]">
                <p className="text-sm text-slate-400">No trades yet. Add your first trade and it will stay available offline.</p>
              </AppCard>
            ) : (
              data.trades.map((trade, index) => (
                <AppCard key={trade.id} accent="default" className="animate-[fadeIn_400ms_ease-out]" interactive>
                  <div className="flex items-center justify-between gap-3" style={{ animationDelay: `${index * 60}ms` }}>
                    <div>
                      <p className="font-semibold text-white">{trade.symbol}</p>
                      <p className="mt-1 text-sm text-slate-400">{trade.date || new Date(trade.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-sm ${trade.profitLoss >= 0 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-rose-500/20 bg-rose-500/10 text-rose-300"}`}>
                      {trade.profitLoss >= 0 ? "+" : ""}{trade.profitLoss}
                    </span>
                  </div>
                  {trade.lotSize ? <p className="mt-2 text-sm text-slate-400">Lot size: {trade.lotSize}</p> : null}
                </AppCard>
              ))
            )}
          </section>
        )}

        {activeTab === "payout" && (
          <section className="mt-4">
            <AppCard accent="cyan" className="animate-[fadeIn_400ms_ease-out]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300"><Target size={18} /></div>
                <div>
                  <p className="text-sm text-slate-300">Open the dedicated Goals page for payout progress, consistency, and motivation.</p>
                  <AppLinkButton href="/goals" className="mt-4" variant="primary">Go to Goals</AppLinkButton>
                </div>
              </div>
            </AppCard>
          </section>
        )}

        {activeTab === "debt" && (
          <section className="mt-4">
            <AppCard accent="emerald" className="animate-[fadeIn_400ms_ease-out]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300"><WalletCards size={18} /></div>
                <div>
                  <p className="text-sm text-slate-300">Open the dedicated Financial Progress page for debt payoff and income forecasts.</p>
                  <AppLinkButton href="/financial" className="mt-4" variant="primary">Go to Financial Progress</AppLinkButton>
                </div>
              </div>
            </AppCard>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="mt-4">
            <AppCard accent="cyan" className="animate-[fadeIn_400ms_ease-out]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300"><Activity size={18} /></div>
                <div>
                  <p className="text-sm text-slate-300">Open the dedicated Settings page to manage trading assumptions, backups, reset, and app details.</p>
                  <AppLinkButton href="/settings" className="mt-4" variant="primary">Go to Settings</AppLinkButton>
                </div>
              </div>
            </AppCard>
          </section>
        )}

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/95 px-2 py-2 backdrop-blur-xl sm:px-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              if (tab.href) {
                return (
                  <Link key={tab.id} href={tab.href} className={`flex min-w-[70px] flex-1 flex-col items-center rounded-2xl px-1 py-2 text-[10px] font-medium transition sm:min-w-[90px] ${isActive ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>
                    <Icon size={16} />
                    <span className="mt-1">{tab.label}</span>
                  </Link>
                );
              }

              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex min-w-[70px] flex-1 flex-col items-center rounded-2xl px-1 py-2 text-[10px] font-medium transition sm:min-w-[90px] ${isActive ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>
                  <Icon size={16} />
                  <span className="mt-1">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </PageShell>
  );
}
