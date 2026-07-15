"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { AppButton, AppCard, AppInput, AppShell, FormField, HeroMetric, MetricTile, PageHeader, ProgressBar, SectionHeader } from "../components/ui-primitives";
import { formatUSD, formatINR, formatPercent } from "../lib/tracker-data";
import { getFinancialSummary } from "../lib/tracker-calculations";
import { recordSalaryContribution, useTrackerStore } from "../lib/tracker-store";
import { Wallet, TrendingUp, ArrowRightLeft, Calendar, DollarSign } from "lucide-react";

export default function FinancialProgressPage() {
  const data = useTrackerStore();
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState(String(data.settings.monthlySalaryContribution || ""));
  const [toast, setToast] = useState<string | null>(null);
  const financialSummary = useMemo(() => getFinancialSummary(data), [data]);

  const estimatedDebtFreeDate = useMemo(() => {
    if (financialSummary.monthsRemaining === 0) return financialSummary.remainingDebt <= 0 ? "Now" : "Needs payout data";
    const date = new Date();
    date.setMonth(date.getMonth() + financialSummary.monthsRemaining);
    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }, [financialSummary.monthsRemaining, financialSummary.remainingDebt]);

  const submitSalaryContribution = () => {
    const amount = Number(salaryAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    recordSalaryContribution(amount);
    setShowSalaryForm(false);
    setToast("Salary contribution recorded.");
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <AppShell activeTab="financial">
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 shadow-lg backdrop-blur animate-fade-in">{toast}</div> : null}

      <PageHeader
        title="Financial"
        subtitle="Debt payoff progress"
        accent="violet"
        action={
          <AppButton type="button" variant="secondary" onClick={() => setShowSalaryForm((c) => !c)} className="text-xs">
            <DollarSign size={14} />
            Salary
          </AppButton>
        }
      />

      {/* Salary Form */}
      {showSalaryForm ? (
        <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3.5">
          <p className="text-xs font-medium text-emerald-400 mb-2">Record Salary Contribution (INR)</p>
          <div className="flex gap-2">
            <AppInput type="number" min="0" step="0.01" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} className="flex-1" />
            <AppButton type="button" onClick={submitSalaryContribution} variant="profit" className="flex-shrink-0">Apply</AppButton>
          </div>
        </div>
      ) : null}

      {/* Debt Overview Hero */}
      <section className="mt-4">
        <HeroMetric
          label="Remaining Debt"
          value={formatINR(financialSummary.remainingDebt)}
          accent="violet"
          icon={<Wallet size={20} />}
          subtitle={`${financialSummary.debtCompletedPercent}% of ${formatINR(data.settings.originalDebt)} cleared`}
        />
        <div className="mt-3">
          <ProgressBar value={financialSummary.debtCompletedPercent} barClassName="from-violet-500 to-violet-400" />
        </div>
      </section>

      {/* Debt Metrics */}
      <section className="mt-4 grid grid-cols-2 gap-2.5">
        <MetricTile label="Total Paid" value={formatINR(financialSummary.totalDebtPaid)} accent="profit" icon={<TrendingUp size={14} />} />
        <MetricTile label="Via Payouts" value={formatINR(financialSummary.totalPayoutDebtReduction)} accent="cyan" icon={<ArrowRightLeft size={14} />} />
        <MetricTile label="Via Salary" value={formatINR(financialSummary.totalSalaryContribution)} accent="amber" icon={<DollarSign size={14} />} />
        <MetricTile label="Total Contributed" value={formatINR(financialSummary.totalAmountPaidTowardsDebt)} accent="violet" />
      </section>

      {/* Income Breakdown */}
      <section className="mt-5">
        <SectionHeader title="Current Cycle Income" accent="emerald" icon={<TrendingUp size={13} />} />
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <MetricTile label="Profit (USD)" value={formatUSD(financialSummary.tradingProfitUsd)} accent="profit" />
          <MetricTile label="Profit (INR)" value={formatINR(financialSummary.tradingProfitInr)} accent="profit" />
        </div>
      </section>

      {/* Forecast */}
      <section className="mt-5">
        <SectionHeader title="Forecast" accent="amber" icon={<Calendar size={13} />} />
        <AppCard className="mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-[10px] text-slate-500">Debt-Free Date</p>
              <p className="mt-1 text-lg font-bold text-amber-400">{estimatedDebtFreeDate}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-[10px] text-slate-500">Months Left</p>
              <p className="mt-1 text-lg font-bold text-white">{financialSummary.monthsRemaining}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-[10px] text-slate-500">Avg Monthly Income</p>
              <p className="mt-1 text-sm font-semibold text-emerald-400">{formatUSD(financialSummary.averageMonthlyTradingIncome)}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-[10px] text-slate-500">Avg Contribution</p>
              <p className="mt-1 text-sm font-semibold text-violet-400">{formatUSD(financialSummary.averageMonthlyTotalContribution)}</p>
            </div>
          </div>
        </AppCard>
      </section>

      {/* USD/INR Rate */}
      <section className="mt-5 mb-4">
        <AppCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"><ArrowRightLeft size={14} /></div>
              <div>
                <p className="text-xs text-slate-500">USD / INR</p>
                <p className="text-sm font-semibold text-white">₹{data.settings.usdToInr}</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-600">Manual rate</span>
          </div>
        </AppCard>
      </section>
    </AppShell>
  );
}
