"use client";

export const dynamic = "force-dynamic";

import { Search, Trash2, TrendingUp, TrendingDown, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppButton, AppCard, AppInput, AppSelect, AppShell, EmptyState, FormField, MetricTile, PageHeader, SectionHeader, SkeletonCard } from "../components/ui-primitives";
import { formatUSD, formatPercent, isValidDateInput } from "../lib/tracker-data";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    <AppShell activeTab="history">
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm text-cyan-300 shadow-lg backdrop-blur animate-fade-in">{toast}</div> : null}

      <PageHeader title="Trade History" subtitle={`${data.trades.length} total trades`} accent="emerald" />

      {/* Summary */}
      <section className="mt-4 grid grid-cols-3 gap-2.5">
        <MetricTile label="Trades" value={String(summary.count)} accent="cyan" className="text-center" />
        <MetricTile label="Profit" value={formatUSD(summary.totalProfit)} accent={summary.totalProfit >= 0 ? "profit" : "loss"} className="text-center" />
        <MetricTile label="Win Rate" value={formatPercent(summary.winRate)} accent="cyan" className="text-center" />
      </section>

      {/* Filters */}
      <section className="mt-4">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Filters</span>
            {hasActiveFilters && <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500/20 px-1 text-[10px] font-bold text-indigo-300">!</span>}
          </div>
          {filtersOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </button>
        {filtersOpen ? (
          <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Search">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <AppInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Symbol..." className="pl-8 py-2 text-xs" />
                </div>
              </FormField>
              <FormField label="Result">
                <AppSelect value={resultFilter} onChange={(e) => setResultFilter(e.target.value as ResultFilter)} className="py-2 text-xs">
                  <option value="all">All</option>
                  <option value="wins">Wins</option>
                  <option value="losses">Losses</option>
                </AppSelect>
              </FormField>
              <FormField label="Sort">
                <AppSelect value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="py-2 text-xs">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </AppSelect>
              </FormField>
              <FormField label="From">
                <AppInput type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="py-2 text-xs" />
              </FormField>
              <FormField label="To">
                <AppInput type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="py-2 text-xs" />
              </FormField>
              <div className="flex items-end">
                <AppButton type="button" variant="ghost" className="w-full text-xs" onClick={resetFilters} disabled={!hasActiveFilters}>Reset</AppButton>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Trade List */}
      <section className="mt-4 mb-4">
        {!isReady ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="h-20" />)}
          </div>
        ) : data.trades.length === 0 ? (
          <EmptyState title="No trades yet" description="Start building your history with your first trade." action={<AppButton variant="primary" onClick={() => router.push("/add")}>Add your first trade</AppButton>} />
        ) : filteredTrades.length === 0 ? (
          <EmptyState title="No matching trades" description="Try adjusting your search or filters." action={<AppButton variant="secondary" onClick={resetFilters}>Reset filters</AppButton>} />
        ) : (
          <div className="space-y-1">
            {filteredTrades.map((trade) => {
              const isProfit = trade.profitLoss >= 0;
              const dateStr = trade.date || new Date(trade.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
              return (
                <div
                  key={trade.id}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-3 py-2.5 transition hover:bg-white/[0.04] cursor-pointer active:scale-[0.99]"
                  onClick={() => router.push(`/edit/${trade.id}`)}
                >
                  {/* Indicator */}
                  <div className={`h-2 w-2 flex-shrink-0 rounded-full ${isProfit ? "bg-emerald-400" : "bg-rose-400"}`} />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{trade.symbol}</p>
                      {trade.strategy ? <span className="text-[10px] text-slate-500 hidden sm:inline">{trade.strategy}</span> : null}
                    </div>
                    <p className="text-[11px] text-slate-500">{dateStr} {trade.cycleNumber ? `\u00B7 Cycle ${trade.cycleNumber}` : ""}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold tabular-nums ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                      {isProfit ? "+" : "-"}${Math.abs(trade.profitLoss).toFixed(2)}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteTrade(trade.id); }}
                    className="flex-shrink-0 rounded-lg p-1.5 text-slate-600 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
