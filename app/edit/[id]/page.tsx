"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Trade } from "../../lib/tracker-models";
import { removeTrade, updateTrade, useTrackerStore } from "../../lib/tracker-store";

const todayString = () => new Date().toISOString().slice(0, 10);
const TOAST_KEY = "trade-tracker-toast";

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function toDraft(trade: Trade) {
  return {
    date: trade.date || todayString(),
    profitLoss: trade.profitLoss.toString(),
    lotSize: trade.lotSize?.toString() ?? "",
    symbol: trade.symbol,
  };
}

export default function EditTradePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const data = useTrackerStore();
  const [draft, setDraft] = useState({ date: todayString(), profitLoss: "", lotSize: "", symbol: "XAUUSD" });
  const [status, setStatus] = useState<string | null>(null);
  const tradeId = Number(params.id);

  const trade = useMemo(() => data.trades.find((item) => item.id === tradeId), [data.trades, tradeId]);

  useEffect(() => {
    if (!trade) {
      router.replace("/history");
      return;
    }

    setDraft(toDraft(trade));
  }, [router, trade]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.profitLoss.trim()) {
      setStatus("Profit/Loss is required.");
      return;
    }

    const profitLossValue = Number(draft.profitLoss);
    if (!Number.isFinite(profitLossValue)) {
      setStatus("Enter a valid Profit/Loss value.");
      return;
    }

    if (!isValidDateInput(draft.date)) {
      setStatus("Enter a valid date.");
      return;
    }

    if (!trade) return;

    const nextTrade: Trade = {
      ...trade,
      date: draft.date || todayString(),
      profitLoss: profitLossValue,
      lotSize: draft.lotSize ? Number(draft.lotSize) : undefined,
      symbol: draft.symbol.trim() || trade.symbol,
      createdAt: trade.createdAt,
    };

    updateTrade(nextTrade);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(TOAST_KEY, "Trade updated locally.");
    }
    router.push("/history");
  };

  const handleDelete = () => {
    if (!trade) return;

    const confirmed = window.confirm("Delete this trade? This cannot be undone.");
    if (!confirmed) return;

    removeTrade(trade.id);
    router.push("/history");
  };

  if (!trade) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">Edit Trade</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Update trade details</h1>
              <p className="mt-2 text-sm text-slate-300">Changes sync instantly across your dashboard and reports.</p>
            </div>
            <Link href="/history" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              Back
            </Link>
          </div>
        </header>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="text-sm text-slate-300">
              Date
              <input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>

            <label className="text-sm text-slate-300">
              Profit / Loss
              <input
                type="number"
                step="0.01"
                value={draft.profitLoss}
                onChange={(event) => setDraft((current) => ({ ...current, profitLoss: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
                placeholder="e.g. 125.5 or -45"
                required
              />
            </label>

            <label className="text-sm text-slate-300">
              Lot Size
              <input
                type="number"
                step="0.01"
                value={draft.lotSize}
                onChange={(event) => setDraft((current) => ({ ...current, lotSize: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
                placeholder="Optional"
              />
            </label>

            <label className="text-sm text-slate-300">
              Symbol
              <input
                value={draft.symbol}
                onChange={(event) => setDraft((current) => ({ ...current, symbol: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
                placeholder="XAUUSD"
              />
            </label>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 font-semibold text-rose-300 transition hover:bg-rose-500/20"
              >
                Delete Trade
              </button>
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
          </form>
        </section>
      </div>
    </main>
  );
}
