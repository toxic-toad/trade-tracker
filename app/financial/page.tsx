"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useMemo } from "react";
import { formatCurrency, formatPercent } from "../lib/tracker-data";
import { getFinancialSummary } from "../lib/tracker-calculations";
import { useTrackerStore } from "../lib/tracker-store";

export default function FinancialProgressPage() {
  const data = useTrackerStore();
  const financialSummary = useMemo(() => getFinancialSummary(data), [data]);

  const estimatedDebtFreeDate = useMemo(() => {
    if (financialSummary.monthsRemaining === 0) return "Now";
    const date = new Date();
    date.setMonth(date.getMonth() + financialSummary.monthsRemaining);
    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }, [financialSummary.monthsRemaining]);

  const motivationMessage = financialSummary.debtCompletedPercent >= 75
    ? "You're closer than last month."
    : financialSummary.debtCompletedPercent >= 40
      ? "Every payout reduces your debt."
      : "Stay consistent.";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">Financial Progress</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Track debt payoff momentum</h1>
              <p className="mt-2 text-sm text-slate-300">All calculations come from your saved trades and settings in local storage.</p>
            </div>
            <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              Back
            </Link>
          </div>
        </header>

        <section className="mt-4 rounded-[28px] border border-cyan-400/20 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-300">Debt Overview</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Your debt payoff progress</h2>
            </div>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
              {financialSummary.debtCompletedPercent}% completed
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Current Debt</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.remainingDebt, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Total Debt Paid</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-400">{formatCurrency(financialSummary.totalDebtPaid, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Remaining Debt</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.remainingDebt, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Percentage Completed</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(financialSummary.debtCompletedPercent)}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm text-slate-400">
              <span>Debt reduction</span>
              <span>{financialSummary.debtCompletedPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-950/70">
              <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${financialSummary.debtCompletedPercent}%` }} />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <h2 className="text-xl font-semibold text-white">Income Breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Total Trading Profit (USD)</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.tradingProfitUsd, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Converted Trading Profit (INR)</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.tradingProfitInr, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Total Salary Contribution</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.totalSalaryContribution, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Total Amount Paid Towards Debt</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.totalAmountPaidTowardsDebt, 1)}</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <h2 className="text-xl font-semibold text-white">Forecast</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Estimated Debt-Free Date</p>
              <p className="mt-2 text-2xl font-semibold text-white">{estimatedDebtFreeDate}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Average Monthly Trading Income</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.averageMonthlyTradingIncome, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Average Monthly Total Contribution</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(financialSummary.averageMonthlyTotalContribution, 1)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Months Remaining</p>
              <p className="mt-2 text-2xl font-semibold text-white">{financialSummary.monthsRemaining}</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-emerald-400/20 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <h2 className="text-xl font-semibold text-white">Motivation</h2>
          <p className="mt-2 text-sm text-slate-300">{motivationMessage}</p>
        </section>
      </div>
    </main>
  );
}
