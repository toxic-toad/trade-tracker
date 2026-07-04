"use client";

export const dynamic = "force-dynamic";

import { Search, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppButton, AppCard, AppInput, AppSelect, EmptyState, FormField, PageHeader, PageShell, SkeletonCard, StatCard } from "../components/ui-primitives";
import { formatCurrency, formatPercent, isValidDateInput } from "../lib/tracker-data";
import { summarizeTrades, tradeDateKey } from "../lib/tracker-calculations";
import { removeTrade, useTrackerStore } from "../lib/tracker-store";

const TOAST_KEY = "trade-tracker-toast";

type ResultFilter = "all" | "wins" | "losses";
type SortOrder = "newest" | "oldest";

export default function HistoryPage() {
  const data = useTrackerStore();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  const filteredTrades = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = isValidDateInput(fromDate) ? fromDate : "";
    const to = isValidDateInput(toDate) ? toDate : "";

    const matched = data.trades.filter((trade) => {
      if (query && !trade.symbol.toLowerCase().includes(query)) return false;
      if (resultFilter === "wins" && trade.profitLoss <= 0) return false;
      if (resultFilter === "losses" && trade.profitLoss >= 0) return false;

      const dateKey = tradeDateKey(trade);
      if (from && dateKey < from) return false;
      if (to && dateKey > to) return false;

      return true;
    });

    return matched.sort((left, right) => {
      const leftTime = new Date(left.date || left.createdAt).getTime();
      const rightTime = new Date(right.date || right.createdAt).getTime();
      return sortOrder === "newest" ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [data.trades, search, resultFilter, sortOrder, fromDate, toDate]);

  const summary = useMemo(() => summarizeTrades(filteredTrades), [filteredTrades]);

  const deleteTrade = (tradeId: number) => {
    const confirmed = window.confirm("Delete this trade? This cannot be undone.");
    if (!confirmed) return;

    removeTrade(tradeId);
  };

  const resetFilters = () => {
    setSearch("");
    setResultFilter("all");
    setSortOrder("newest");
    setFromDate("");
    setToDate("");
  };

  const hasActiveFilters = Boolean(search || fromDate || toDate) || resultFilter !== "all" || sortOrder !== "newest";

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        {toast ? <div className="fixed right-4 top-4 z-50 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 shadow-lg backdrop-blur">{toast}</div> : null}

        <PageHeader eyebrow="History" title="Your private trade log" description="Search, filter, and review every trade. Stored locally and available offline." action={<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">Offline history</div>} />

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="Filtered trades" value={String(summary.count)} icon={<Sparkles size={16} />} />
          <StatCard label="Filtered profit" value={formatCurrency(summary.totalProfit, data.settings.usdToInr)} valueClassName={summary.totalProfit >= 0 ? "text-emerald-300" : "text-rose-300"} icon={<Sparkles size={16} />} />
          <StatCard label="Filtered win rate" value={formatPercent(summary.winRate)} subtitle={`${summary.winningCount}W / ${summary.losingCount}L`} icon={<Sparkles size={16} />} />
        </section>

        <AppCard accent="default" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Search symbol">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <AppInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. XAUUSD" className="pl-10" />
              </div>
            </FormField>

            <FormField label="Result">
              <AppSelect value={resultFilter} onChange={(event) => setResultFilter(event.target.value as ResultFilter)}>
                <option value="all">All trades</option>
                <option value="wins">Winning trades</option>
                <option value="losses">Losing trades</option>
              </AppSelect>
            </FormField>

            <FormField label="Sort">
              <AppSelect value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </AppSelect>
            </FormField>

            <FormField label="From date">
              <AppInput type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </FormField>

            <FormField label="To date">
              <AppInput type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </FormField>

            <div className="flex items-end">
              <AppButton type="button" variant="secondary" className="w-full" onClick={resetFilters} disabled={!hasActiveFilters}>
                Reset filters
              </AppButton>
            </div>
          </div>
        </AppCard>

        <section className="mt-4">
          {!isReady ? (
            <div className="grid gap-3">
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-24" />
            </div>
          ) : data.trades.length === 0 ? (
            <EmptyState title="No trades yet" description="Start building your offline history with your first trade." action={<AppButton variant="primary" onClick={() => router.push("/add")}>Add your first trade</AppButton>} />
          ) : filteredTrades.length === 0 ? (
            <EmptyState title="No matching trades" description="Try adjusting your search or filters to see more results." action={<AppButton variant="secondary" onClick={resetFilters}>Reset filters</AppButton>} />
          ) : (
            <div className="space-y-3">
              {filteredTrades.map((trade, index) => {
                const isProfit = trade.profitLoss >= 0;
                return (
                  <AppCard key={trade.id} accent="default" className="cursor-pointer animate-[fadeIn_400ms_ease-out]" interactive onClick={() => router.push(`/edit/${trade.id}`)}>
                    <div className="flex items-start justify-between gap-3" style={{ animationDelay: `${index * 60}ms` }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{trade.symbol}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{isProfit ? "Profit" : "Loss"}</span>
                          {trade.strategy ? <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">{trade.strategy}</span> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{trade.date || new Date(trade.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${isProfit ? "text-emerald-300" : "text-rose-300"}`}>{isProfit ? "+" : ""}{trade.profitLoss.toFixed(2)}</p>
                        {trade.lotSize ? <p className="mt-1 text-xs text-slate-500">Lot size {trade.lotSize}</p> : null}
                      </div>
                    </div>

                    {trade.emotion || trade.notes || trade.mistake ? (
                      <div className="mt-3 space-y-1 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3 text-sm text-slate-400">
                        {trade.emotion ? <p><span className="text-slate-500">Emotion:</span> {trade.emotion}</p> : null}
                        {trade.notes ? <p><span className="text-slate-500">Notes:</span> {trade.notes}</p> : null}
                        {trade.mistake ? <p><span className="text-slate-500">Mistake:</span> {trade.mistake}</p> : null}
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">Tap to edit</p>
                      <AppButton type="button" variant="danger" onClick={(event) => { event.stopPropagation(); deleteTrade(trade.id); }} className="px-3 py-2">
                        <Trash2 size={14} />
                        Delete
                      </AppButton>
                    </div>
                  </AppCard>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
