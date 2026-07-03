"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateAccountStats,
  createDefaultData,
  formatCurrency,
  formatPercent,
  readTrackerData,
  type Settings,
  type TabId,
  type Trade,
  type TrackerData,
  writeTrackerData,
} from "./lib/tracker-data";

const tabs: Array<{ id: TabId; label: string; icon: string; href?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", href: "/" },
  { id: "add", label: "Add Trade", icon: "➕", href: "/add" },
  { id: "history", label: "History", icon: "📈" },
  { id: "payout", label: "Payout", icon: "🎯" },
  { id: "debt", label: "Debt", icon: "💳" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Home() {
  const [data, setData] = useState<TrackerData>(createDefaultData);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const refreshData = () => {
      setData(readTrackerData());
      setHasLoaded(true);
    };

    refreshData();
    window.addEventListener("storage", refreshData);
    window.addEventListener("trade-tracker-data-changed", refreshData);

    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("trade-tracker-data-changed", refreshData);
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    writeTrackerData(data);
  }, [data, hasLoaded]);

  const stats = useMemo(() => data.stats, [data.stats]);

  const updateSettings = (changes: Partial<Settings>) => {
    setData((current) => {
      const nextSettings = { ...current.settings, ...changes };
      return {
        ...current,
        settings: nextSettings,
        stats: calculateAccountStats(nextSettings, current.trades),
      };
    });
  };

  const dashboardCards = [
    {
      title: "Current Balance",
      value: formatCurrency(stats.currentBalance, data.settings.usdToInr),
      subtitle: "Starting balance + realized profit",
    },
    {
      title: "Current Profit",
      value: formatCurrency(stats.currentProfit, data.settings.usdToInr),
      subtitle: "Based on your profit split",
    },
    {
      title: "Profit Remaining Until Payout",
      value: formatCurrency(stats.profitRemainingUntilPayout, data.settings.usdToInr),
      subtitle: `${data.settings.minimumProfitForPayout} minimum target`,
    },
    {
      title: "Trading Days Completed",
      value: `${stats.tradingDaysCompleted} / ${data.settings.minimumTradingDays}`,
      subtitle: "Days with recorded trades",
    },
    {
      title: "Next Payout Countdown",
      value: `${stats.nextPayoutCountdownDays}d`,
      subtitle: `${data.settings.payoutCycleDays}-day cycle`,
    },
    {
      title: "Current Debt",
      value: formatCurrency(stats.currentDebt, 1),
      subtitle: "Stored in INR",
    },
    {
      title: "Debt Progress",
      value: formatPercent(stats.debtProgressPercent),
      subtitle: "Salary contribution vs debt",
    },
  ];

  const panelCopy: Record<TabId, { title: string; description: string; accent: string }> = {
    dashboard: {
      title: "Daily overview",
      description: "Your private finance cockpit stays local, fast, and available offline.",
      accent: "Offline-first",
    },
    add: {
      title: "Add trade",
      description: "Capture a new trade quickly without syncing or leaving the app.",
      accent: "Quick capture",
    },
    history: {
      title: "Trade history",
      description: "Review all trades in one private place with zero cloud dependency.",
      accent: "Local history",
    },
    payout: {
      title: "Payout target",
      description: "Track how close you are to your preferred payout milestone.",
      accent: "Payout focus",
    },
    debt: {
      title: "Debt overview",
      description: "Monitor debt pressure and contribution pacing from your own device.",
      accent: "Debt control",
    },
    settings: {
      title: "Personal settings",
      description: "Adjust your account assumptions and preferences whenever you need to.",
      accent: "Persistent settings",
    },
  };

  const activeContent = panelCopy[activeTab];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">Trade Tracker</p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Private trading dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                Everything stays in your browser storage, works offline, and updates from your personal settings.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-300">Offline</p>
              <p className="text-lg font-semibold text-white">Local only</p>
            </div>
          </div>
        </header>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-300">{activeContent.title}</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{activeContent.description}</h2>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
              {activeContent.accent}
            </span>
          </div>
        </section>

        {activeTab === "dashboard" && (
          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardCards.map((card) => (
              <article key={card.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_16px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
                <p className="text-sm text-slate-400">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
              </article>
            ))}
          </section>
        )}

        {activeTab === "add" && (
          <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              Open the dedicated add-trade page to save a new trade locally.
            </div>
            <Link href="/add" className="mt-4 inline-flex rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Go to Add Trade
            </Link>
          </section>
        )}

        {activeTab === "history" && (
          <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
            <div className="space-y-3">
              {data.trades.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
                  No trades yet. Add your first trade and it will stay available offline.
                </div>
              ) : (
                data.trades.map((trade) => (
                  <article key={trade.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{trade.symbol}</p>
                        <p className="text-sm text-slate-400">{trade.date || new Date(trade.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-sm text-emerald-300">
                        {trade.profitLoss >= 0 ? "+" : ""}{trade.profitLoss}
                      </span>
                    </div>
                    {trade.lotSize ? <p className="mt-2 text-sm text-slate-400">Lot size: {trade.lotSize}</p> : null}
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "payout" && (
          <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Minimum payout target</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(data.settings.minimumProfitForPayout, data.settings.usdToInr)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Remaining to payout</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.profitRemainingUntilPayout, data.settings.usdToInr)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Profit split</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(data.settings.profitSplit)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Cycle</p>
                <p className="mt-2 text-2xl font-semibold text-white">{data.settings.payoutCycleDays}-day</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "debt" && (
          <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Current debt</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(stats.currentDebt, 1)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Monthly salary</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(data.settings.monthlySalary, 1)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Contribution</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(data.settings.monthlySalaryContribution, 1)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Debt progress</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(stats.debtProgressPercent)}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">
                Account Size
                <input
                  type="number"
                  value={data.settings.accountSize}
                  onChange={(event) => updateSettings({ accountSize: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Starting Balance
                <input
                  type="number"
                  value={data.settings.startingBalance}
                  onChange={(event) => updateSettings({ startingBalance: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Profit Split (%)
                <input
                  type="number"
                  value={data.settings.profitSplit}
                  onChange={(event) => updateSettings({ profitSplit: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Minimum Trading Days
                <input
                  type="number"
                  value={data.settings.minimumTradingDays}
                  onChange={(event) => updateSettings({ minimumTradingDays: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Minimum Profit for Payout
                <input
                  type="number"
                  value={data.settings.minimumProfitForPayout}
                  onChange={(event) => updateSettings({ minimumProfitForPayout: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Payout Cycle
                <select
                  value={data.settings.payoutCycleDays}
                  onChange={(event) => updateSettings({ payoutCycleDays: Number(event.target.value) as 7 | 14 })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">
                Current Debt (INR)
                <input
                  type="number"
                  value={data.settings.currentDebt}
                  onChange={(event) => updateSettings({ currentDebt: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Monthly Salary
                <input
                  type="number"
                  value={data.settings.monthlySalary}
                  onChange={(event) => updateSettings({ monthlySalary: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Monthly Salary Contribution
                <input
                  type="number"
                  value={data.settings.monthlySalaryContribution}
                  onChange={(event) => updateSettings({ monthlySalaryContribution: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                USD to INR Exchange Rate
                <input
                  type="number"
                  step="0.01"
                  value={data.settings.usdToInr}
                  onChange={(event) => updateSettings({ usdToInr: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
                />
              </label>
            </div>
          </section>
        )}

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/95 px-2 py-2 backdrop-blur-xl sm:px-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              if (tab.href) {
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex min-w-[70px] flex-1 flex-col items-center rounded-2xl px-1 py-2 text-[10px] font-medium transition sm:min-w-[90px] ${
                      isActive ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="mt-1">{tab.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-[70px] flex-1 flex-col items-center rounded-2xl px-1 py-2 text-[10px] font-medium transition sm:min-w-[90px] ${
                    isActive ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="mt-1">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </main>
  );
}
