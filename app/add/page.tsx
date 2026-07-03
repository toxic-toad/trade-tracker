"use client";

export const dynamic = "force-dynamic";

import { CalendarDays, PlusCircle, Save, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AppButton, AppCard, AppInput, FormField, PageHeader, PageShell } from "../components/ui-primitives";
import type { Trade } from "../lib/tracker-data";
import { addTrade } from "../lib/tracker-store";

const todayString = () => new Date().toISOString().slice(0, 10);

const emptyDraft = () => ({ date: todayString(), profitLoss: "", lotSize: "", symbol: "XAUUSD" });

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

    addTrade(trade);
    setStatus("Trade saved locally.");
    setDraft(emptyDraft());
  };

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Add Trade"
          title="Record a new trade"
          description="Everything is stored locally and synced instantly to your dashboard."
          action={<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">Local save</div>}
        />

        <AppCard accent="cyan" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <FormField label="Date">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <AppInput type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="pl-10" />
              </div>
            </FormField>

            <FormField label="Profit / Loss" hint="Positive or negative values are both accepted.">
              <AppInput type="number" step="0.01" value={draft.profitLoss} onChange={(event) => setDraft((current) => ({ ...current, profitLoss: event.target.value }))} placeholder="e.g. 125.5 or -45" required />
            </FormField>

            <FormField label="Lot Size">
              <AppInput type="number" step="0.01" value={draft.lotSize} onChange={(event) => setDraft((current) => ({ ...current, lotSize: event.target.value }))} placeholder="Optional" />
            </FormField>

            <FormField label="Symbol">
              <AppInput value={draft.symbol} onChange={(event) => setDraft((current) => ({ ...current, symbol: event.target.value }))} placeholder="XAUUSD" />
            </FormField>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <AppButton type="submit" variant="primary" className="flex-1">
                <Save size={16} />
                Save Trade
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setDraft(emptyDraft());
                  setStatus(null);
                }}
              >
                <XCircle size={16} />
                Cancel
              </AppButton>
            </div>

            {status ? <p className="text-sm text-cyan-300">{status}</p> : null}
          </form>
        </AppCard>
      </div>
    </PageShell>
  );
}
