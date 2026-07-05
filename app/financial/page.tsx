"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { AppButton, AppCard, AppInput, AppShell, FormField, PageHeader, ProgressBar, StatCard } from "../components/ui-primitives";
import { formatCurrency, formatPercent } from "../lib/tracker-data";
import { getFinancialSummary } from "../lib/tracker-calculations";
import { recordSalaryContribution, useTrackerStore } from "../lib/tracker-store";

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
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 shadow-lg backdrop-blur">{toast}</div> : null}
      <PageHeader
        eyebrow="Financial"
        title="Track debt payoff momentum"
        description="Debt only decreases after a confirmed payout or an explicit salary contribution."
        action={<AppButton type="button" variant="secondary" onClick={() => setShowSalaryForm((current) => !current)}>Record Salary Contribution</AppButton>}
      />

      {showSalaryForm ? (
        <AppCard accent="emerald" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <FormField label="Salary contribution amount (INR)">
              <AppInput type="number" min="0" step="0.01" value={salaryAmount} onChange={(event) => setSalaryAmount(event.target.value)} />
            </FormField>
            <AppButton type="button" onClick={submitSalaryContribution}>Apply Contribution</AppButton>
          </div>
        </AppCard>
      ) : null}

      <AppCard accent="cyan" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-300">Debt Overview</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Your confirmed debt payoff progress</h2>
          </div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
            {financialSummary.debtCompletedPercent}% completed
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Debt Paid" value={formatCurrency(financialSummary.totalDebtPaid, 1)} valueClassName="text-emerald-300" />
          <StatCard label="Remaining Debt" value={formatCurrency(financialSummary.remainingDebt, 1)} />
          <StatCard label="Percentage Completed" value={formatPercent(financialSummary.debtCompletedPercent)} />
          <StatCard label="Payout Debt Reduction" value={formatCurrency(financialSummary.totalPayoutDebtReduction, 1)} valueClassName="text-emerald-300" />
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm text-slate-400">
            <span>Debt reduction</span>
            <span>{financialSummary.debtCompletedPercent}%</span>
          </div>
          <ProgressBar value={financialSummary.debtCompletedPercent} />
        </div>
      </AppCard>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <AppCard accent="default">
          <h2 className="text-xl font-semibold text-white">Income Breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Current Cycle Profit (USD)" value={`$${financialSummary.tradingProfitUsd.toFixed(2)}`} />
            <StatCard label="Current Cycle Profit (INR)" value={formatCurrency(financialSummary.tradingProfitInr, 1)} />
            <StatCard label="Salary Contributions" value={formatCurrency(financialSummary.totalSalaryContribution, 1)} />
            <StatCard label="Total Amount Paid" value={formatCurrency(financialSummary.totalAmountPaidTowardsDebt, 1)} />
          </div>
        </AppCard>

        <AppCard accent="default">
          <h2 className="text-xl font-semibold text-white">Forecast</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Estimated Debt-Free Date" value={estimatedDebtFreeDate} />
            <StatCard label="Avg Monthly Trading Income" value={formatCurrency(financialSummary.averageMonthlyTradingIncome, data.settings.usdToInr)} />
            <StatCard label="Avg Monthly Contribution" value={formatCurrency(financialSummary.averageMonthlyTotalContribution, data.settings.usdToInr)} />
            <StatCard label="Months Remaining" value={String(financialSummary.monthsRemaining)} />
          </div>
        </AppCard>
      </section>

      <AppCard accent="default" className="mt-4">
        <h2 className="text-xl font-semibold text-white">Payout History</h2>
        {data.payouts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Confirmed payouts will appear here.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Cycle</th>
                  <th className="pb-3 font-medium">Trading Profit</th>
                  <th className="pb-3 font-medium">Split</th>
                  <th className="pb-3 font-medium">Payout USD</th>
                  <th className="pb-3 font-medium">Payout INR</th>
                  <th className="pb-3 font-medium">Debt Before</th>
                  <th className="pb-3 font-medium">Debt After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.payouts.map((payout) => (
                  <tr key={payout.id} className="text-slate-200">
                    <td className="py-3">{payout.date}</td>
                    <td className="py-3">{payout.cycleNumber}</td>
                    <td className="py-3">{formatCurrency(payout.tradingProfitInr, 1)}</td>
                    <td className="py-3">{payout.profitSplitPercent}%</td>
                    <td className="py-3">${payout.payoutUsd.toFixed(2)}</td>
                    <td className="py-3">{formatCurrency(payout.payoutInr, 1)}</td>
                    <td className="py-3">{formatCurrency(payout.debtBefore, 1)}</td>
                    <td className="py-3">{formatCurrency(payout.debtAfter, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AppCard>
    </AppShell>
  );
}
