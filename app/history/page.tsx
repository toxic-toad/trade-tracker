"use client";

export const dynamic = "force-dynamic";

import { Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppButton, AppCard, EmptyState, PageHeader, PageShell, SkeletonCard, StatCard } from "../components/ui-primitives";
import { formatCurrency, formatPercent } from "../lib/tracker-data";
import { removeTrade, useTrackerStore } from "../lib/tracker-store";

const TOAST_KEY = "trade-tracker-toast";

export default function HistoryPage() {
  const data = useTrackerStore();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

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

  const sortedTrades = useMemo(() => {
    return [...data.trades].sort((left, right) => {
      const leftTime = new Date(left.date || left.createdAt).getTime();
      const rightTime = new Date(right.date || right.createdAt).getTime();
      return rightTime - leftTime;
    });
  }, [data.trades]);

  const totalProfit = useMemo(() => data.trades.reduce((sum, trade) => sum + trade.profitLoss, 0), [data.trades]);

  const winRate = useMemo(() => {
    if (data.trades.length === 0) return 0;
    const wins = data.trades.filter((trade) => trade.profitLoss > 0).length;
    return (wins / data.trades.length) * 100;
  }, [data.trades]);

  const deleteTrade = (tradeId: number) => {
    const confirmed = window.confirm("Delete this trade? This cannot be undone.");
    if (!confirmed) return;

    removeTrade(tradeId);
  };

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        {toast ? <div className="fixed right-4 top-4 z-50 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 shadow-lg backdrop-blur">{toast}</div> : null}

        <PageHeader eyebrow="History" title="Your private trade log" description="Every trade is stored locally and stays available offline." action={<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">Offline history</div>} />

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="Total trades" value={String(data.trades.length)} icon={<Sparkles size={16} />} />
          <StatCard label="Total profit" value={formatCurrency(totalProfit, data.settings.usdToInr)} valueClassName={totalProfit >= 0 ? "text-emerald-300" : "text-rose-300"} icon={<Sparkles size={16} />} />
          <StatCard label="Win rate" value={formatPercent(winRate)} icon={<Sparkles size={16} />} />
        </section>

        <section className="mt-4">
          {!isReady ? (
            <div className="grid gap-3">
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-24" />
            </div>
          ) : sortedTrades.length === 0 ? (
            <EmptyState title="No trades yet" description="Start building your offline history with your first trade." action={<AppButton variant="primary" onClick={() => router.push("/add")}>Add your first trade</AppButton>} />
          ) : (
            <div className="space-y-3">
              {sortedTrades.map((trade, index) => {
                const isProfit = trade.profitLoss >= 0;
                return (
                  <AppCard key={trade.id} accent="default" className="cursor-pointer animate-[fadeIn_400ms_ease-out]" interactive onClick={() => router.push(`/edit/${trade.id}`)}>
                    <div className="flex items-start justify-between gap-3" style={{ animationDelay: `${index * 60}ms` }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{trade.symbol}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{isProfit ? "Profit" : "Loss"}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{trade.date || new Date(trade.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${isProfit ? "text-emerald-300" : "text-rose-300"}`}>{isProfit ? "+" : ""}{trade.profitLoss.toFixed(2)}</p>
                        {trade.lotSize ? <p className="mt-1 text-xs text-slate-500">Lot size {trade.lotSize}</p> : null}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">{trade.date ? "Recorded on date" : "Saved locally"}</p>
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
