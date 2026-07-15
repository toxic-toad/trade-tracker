"use client";

import { CalendarDays, Save, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { AppButton, AppInput, AppSelect, AppTextarea, FormField } from "./ui-primitives";
import { isValidDateInput } from "../lib/tracker-data";
import type { Trade } from "../lib/tracker-models";
import { addTrade, updateTrade } from "../lib/tracker-store";

const todayString = () => new Date().toISOString().slice(0, 10);

const EMOTIONS = ["Calm", "Confident", "Fearful", "Greedy", "Impatient", "Revenge", "Disciplined", "Anxious"];

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
}

function toDraft(trade?: Trade): Draft {
  return {
    date: trade?.date || todayString(),
    profitLoss: trade ? String(trade.profitLoss) : "",
    lotSize: trade?.lotSize != null ? String(trade.lotSize) : "",
    symbol: trade?.symbol ?? "XAUUSD",
    riskAmount: trade?.riskAmount != null ? String(trade.riskAmount) : "",
    strategy: trade?.strategy ?? "",
    emotion: trade?.emotion ?? "",
    mistake: trade?.mistake ?? "",
    notes: trade?.notes ?? "",
    screenshotUrl: trade?.screenshotUrl ?? "",
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

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const plValue = Number(draft.profitLoss);
  const isProfit = Number.isFinite(plValue) && plValue > 0;
  const isLoss = Number.isFinite(plValue) && plValue < 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!draft.profitLoss.trim()) {
      setError("Profit/Loss is required.");
      return;
    }

    const profitLossValue = Number(draft.profitLoss);
    if (!Number.isFinite(profitLossValue)) {
      setError("Enter a valid Profit/Loss value.");
      return;
    }

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
      profitLoss: profitLossValue,
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
      {/* Amount - Hero Input */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
        <p className="text-xs font-medium text-slate-400">Amount</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-2xl text-slate-500">$</span>
          <input
            type="number"
            step="0.01"
            value={draft.profitLoss}
            onChange={(event) => update("profitLoss", event.target.value)}
            placeholder="0.00"
            required
            className={`w-48 bg-transparent text-center text-4xl font-bold tracking-tight outline-none tabular-nums placeholder:text-slate-700 ${
              isProfit ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-white"
            }`}
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-600">Positive = profit, Negative = loss</p>
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

      {/* Journal Section */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Trading Journal</p>
        <div className="mt-3 space-y-3">
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
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <AppButton
          type="submit"
          variant={isProfit ? "profit" : isLoss ? "loss" : "primary"}
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
