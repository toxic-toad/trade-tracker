"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateAccountStats, readTrackerData, type Trade, writeTrackerData } from "../lib/tracker-data";

const todayString = () => new Date().toISOString().slice(0, 10);

const emptyDraft = () => ({
  date: todayString(),
  profitLoss: "",
  lotSize: "",
  symbol: "XAUUSD",
});

export default function AddTradePage() {
  const [draft, setDraft] = useState(emptyDraft);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setDraft(emptyDraft());
  }, []);

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

    const trade: Trade = {
      id: Date.now(),
      date: draft.date || todayString(),
      profitLoss: profitLossValue,
      lotSize: draft.lotSize ? Number(draft.lotSize) : undefined,
      symbol: draft.symbol.trim() || "XAUUSD",
      createdAt: new Date().toISOString(),
    };

    const currentData = readTrackerData();
    const nextTrades = [trade, ...currentData.trades];
    const nextData = {
      ...currentData,
      trades: nextTrades,
      stats: calculateAccountStats(currentData.settings, nextTrades),
    };

    writeTrackerData(nextData);
    window.dispatchEvent(new Event("trade-tracker-data-changed"));

    setStatus("Trade saved locally.");
    setDraft(emptyDraft());
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">Add Trade</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Record a new trade</h1>
              <p className="mt-2 text-sm text-slate-300">Everything is stored locally and synced instantly to your dashboard.</p>
            </div>
            <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
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
                Save Trade
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(emptyDraft());
                  setStatus(null);
                }}
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
