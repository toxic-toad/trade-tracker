"use client";

import { CalendarDays, Save, Trash2, XCircle, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { AppButton, AppInput, AppSelect, AppTextarea, FormField } from "./ui-primitives";
import { isValidDateInput } from "../lib/tracker-data";
import type { Trade } from "../lib/tracker-models";
import { addTrade, updateTrade } from "../lib/tracker-store";

const todayString = () => new Date().toISOString().slice(0, 10);

const EMOTIONS = ["Calm", "Confident", "Fearful", "Greedy", "Impatient", "Revenge", "Disciplined", "Anxious"];

const QUICK_AMOUNTS = [
  { label: "$5", value: 5 },
  { label: "$10", value: 10 },
  { label: "$25", value: 25 },
  { label: "$50", value: 50 },
  { label: "$100", value: 100 },
];

interface Draft {
  date: string;
  profitLoss: string;
  lotSize: string;
  symbol: string;
  riskAmount: string;
  strategy: string;
  emotion: string;
  mistake: string;
  notes: string;
  screenshotUrl: string;
  resultMode: "profit" | "loss";
}

function toDraft(trade?: Trade): Draft {
  const plValue = trade?.profitLoss ?? 0;
  return {
    date: trade?.date || todayString(),
    profitLoss: trade ? String(Math.abs(trade.profitLoss)) : "",
    lotSize: trade?.lotSize != null ? String(trade.lotSize) : "",
    symbol: trade?.symbol ?? "XAUUSD",
    riskAmount: trade?.riskAmount != null ? String(trade.riskAmount) : "",
    strategy: trade?.strategy ?? "",
    emotion: trade?.emotion ?? "",
    mistake: trade?.mistake ?? "",
    notes: trade?.notes ?? "",
    screenshotUrl: trade?.screenshotUrl ?? "",
    resultMode: plValue >= 0 ? "profit" : "loss",
  };
}

function parseOptionalNumber(value: string): { ok: boolean; value?: number } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: undefined };
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return { ok: false };
  return { ok: true, value: num };
}

function cleanText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

interface TradeFormProps {
  trade?: Trade;
  onSaved?: (message: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function TradeForm({ trade, onSaved, onCancel, onDelete }: TradeFormProps) {
  const isEdit = Boolean(trade);
  const [draft, setDraft] = useState<Draft>(() => toDraft(trade));
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const numValue = Number(draft.profitLoss);
  const hasAmount = Number.isFinite(numValue) && numValue > 0;
  const displayColor = draft.resultMode === "profit" ? "text-emerald-400" : "text-rose-400";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!draft.profitLoss.trim()) {
      setError("Profit/Loss is required.");
      return;
    }

    const profitLossValue = Number(draft.profitLoss);
    if (!Number.isFinite(profitLossValue) || profitLossValue <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const signedValue = draft.resultMode === "loss" ? -profitLossValue : profitLossValue;

    if (!isValidDateInput(draft.date)) {
      setError("Enter a valid date.");
      return;
    }

    const lot = parseOptionalNumber(draft.lotSize);
    if (!lot.ok || (lot.value !== undefined && lot.value < 0)) {
      setError("Enter a valid lot size.");
      return;
    }

    const risk = parseOptionalNumber(draft.riskAmount);
    if (!risk.ok || (risk.value !== undefined && risk.value < 0)) {
      setError("Enter a valid risk amount.");
      return;
    }

    const nextTrade: Trade = {
      id: trade?.id ?? Date.now(),
      createdAt: trade?.createdAt ?? new Date().toISOString(),
      date: draft.date,
      profitLoss: signedValue,
      lotSize: lot.value,
      symbol: draft.symbol.trim() || trade?.symbol || "XAUUSD",
      riskAmount: risk.value,
      strategy: cleanText(draft.strategy),
      emotion: cleanText(draft.emotion),
      mistake: cleanText(draft.mistake),
      notes: cleanText(draft.notes),
      screenshotUrl: cleanText(draft.screenshotUrl),
    };

    if (isEdit) {
      updateTrade(nextTrade);
    } else {
      addTrade(nextTrade);
    }

    setError(null);
    const message = isEdit ? "Trade updated." : "Trade saved.";
    if (onSaved) {
      onSaved(message);
    } else {
      setStatus(message);
    }
    setDraft(toDraft());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Profit/Loss Toggle */}
      <div className="flex gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        <button
          type="button"
          onClick={() => update("resultMode", "profit")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            draft.resultMode === "profit"
              ? "bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <TrendingUp size={16} />
          Profit
        </button>
        <button
          type="button"
          onClick={() => update("resultMode", "loss")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            draft.resultMode === "loss"
              ? "bg-rose-500/15 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <TrendingDown size={16} />
          Loss
        </button>
      </div>

      {/* Amount - Hero Input */}
      <div className={`rounded-2xl border p-4 text-center transition-all ${
        draft.resultMode === "profit"
          ? "border-emerald-500/15 bg-emerald-500/[0.04]"
          : "border-rose-500/15 bg-rose-500/[0.04]"
      }`}>
        <p className="text-xs font-medium text-slate-400">{draft.resultMode === "profit" ? "Profit Amount" : "Loss Amount"}</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className={`text-2xl ${displayColor}`}>$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={draft.profitLoss}
            onChange={(event) => update("profitLoss", event.target.value)}
            placeholder="0.00"
            required
            autoFocus
            className={`w-48 bg-transparent text-center text-4xl font-bold tracking-tight outline-none tabular-nums placeholder:text-slate-700 ${displayColor}`}
          />
        </div>
        {/* Quick Amounts */}
        <div className="mt-3 flex justify-center gap-2">
          {QUICK_AMOUNTS.map((qa) => (
            <button
              key={qa.value}
              type="button"
              onClick={() => update("profitLoss", String(qa.value))}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                hasAmount && numValue === qa.value
                  ? draft.resultMode === "profit"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
              }`}
            >
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Core Fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Date">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <AppInput type="date" value={draft.date} onChange={(e) => update("date", e.target.value)} className="pl-8" />
          </div>
        </FormField>
        <FormField label="Symbol">
          <AppInput value={draft.symbol} onChange={(e) => update("symbol", e.target.value)} placeholder="XAUUSD" />
        </FormField>
      </div>

      {/* Details - Collapsible */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.03]"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trade Details</span>
          {detailsOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </button>
        {detailsOpen ? (
          <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
            <FormField label="Lot Size">
              <AppInput type="number" step="0.01" min="0" value={draft.lotSize} onChange={(e) => update("lotSize", e.target.value)} placeholder="Optional" />
            </FormField>
            <FormField label="Risk Amount" hint="For R multiple calculation">
              <AppInput type="number" step="0.01" min="0" value={draft.riskAmount} onChange={(e) => update("riskAmount", e.target.value)} placeholder="Optional" />
            </FormField>
            <FormField label="Strategy">
              <AppInput value={draft.strategy} onChange={(e) => update("strategy", e.target.value)} placeholder="Optional" />
            </FormField>
          </div>
        ) : null}
      </div>

      {/* Journal - Collapsible */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <button
          type="button"
          onClick={() => setJournalOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.03]"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Trading Journal</span>
          {journalOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </button>
        {journalOpen ? (
          <div className="space-y-3 px-4 pb-4">
            <FormField label="Emotion">
              <AppSelect value={draft.emotion} onChange={(e) => update("emotion", e.target.value)}>
                <option value="">Not recorded</option>
                {EMOTIONS.map((emotion) => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
              </AppSelect>
            </FormField>
            <FormField label="Notes">
              <AppTextarea rows={2} value={draft.notes} onChange={(e) => update("notes", e.target.value)} placeholder="What happened? (optional)" />
            </FormField>
            <FormField label="Mistake">
              <AppTextarea rows={2} value={draft.mistake} onChange={(e) => update("mistake", e.target.value)} placeholder="Avoid next time? (optional)" />
            </FormField>
            <FormField label="Screenshot URL">
              <AppInput type="url" value={draft.screenshotUrl} onChange={(e) => update("screenshotUrl", e.target.value)} placeholder="https://... (optional)" />
            </FormField>
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <AppButton
          type="submit"
          variant={draft.resultMode === "profit" ? "profit" : "loss"}
          className="flex-1"
        >
          <Save size={16} />
          {isEdit ? "Save Changes" : "Save Trade"}
        </AppButton>
        {isEdit && onDelete ? (
          <AppButton type="button" variant="danger" className="flex-1" onClick={onDelete}>
            <Trash2 size={16} />
            Delete
          </AppButton>
        ) : null}
        <AppButton
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setError(null);
            setStatus(null);
            if (onCancel) { onCancel(); return; }
            setDraft(toDraft());
          }}
        >
          <XCircle size={16} />
          Cancel
        </AppButton>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-400">{status}</p> : null}
    </form>
  );
}
