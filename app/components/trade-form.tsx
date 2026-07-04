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
    const message = isEdit ? "Trade updated locally." : "Trade saved locally.";
    if (onSaved) {
      onSaved(message);
      return;
    }

    setStatus(message);
    setDraft(toDraft());
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <AppInput type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} className="pl-10" />
          </div>
        </FormField>

        <FormField label="Symbol">
          <AppInput value={draft.symbol} onChange={(event) => update("symbol", event.target.value)} placeholder="XAUUSD" />
        </FormField>

        <FormField label="Profit / Loss" hint="Positive or negative values are both accepted.">
          <AppInput type="number" step="0.01" value={draft.profitLoss} onChange={(event) => update("profitLoss", event.target.value)} placeholder="e.g. 125.5 or -45" required />
        </FormField>

        <FormField label="Lot Size">
          <AppInput type="number" step="0.01" min="0" value={draft.lotSize} onChange={(event) => update("lotSize", event.target.value)} placeholder="Optional" />
        </FormField>

        <FormField label="Risk Amount" hint="Used to calculate R multiple in analytics.">
          <AppInput type="number" step="0.01" min="0" value={draft.riskAmount} onChange={(event) => update("riskAmount", event.target.value)} placeholder="Optional" />
        </FormField>

        <FormField label="Strategy">
          <AppInput value={draft.strategy} onChange={(event) => update("strategy", event.target.value)} placeholder="Optional" />
        </FormField>
      </div>

      <div className="rounded-[24px] border border-slate-800/90 bg-slate-950/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Trading Journal</p>
        <div className="mt-4 grid gap-4">
          <FormField label="Emotion">
            <AppSelect value={draft.emotion} onChange={(event) => update("emotion", event.target.value)}>
              <option value="">Not recorded</option>
              {EMOTIONS.map((emotion) => (
                <option key={emotion} value={emotion}>{emotion}</option>
              ))}
            </AppSelect>
          </FormField>

          <FormField label="Notes">
            <AppTextarea rows={3} value={draft.notes} onChange={(event) => update("notes", event.target.value)} placeholder="What happened on this trade? (optional)" />
          </FormField>

          <FormField label="Mistake">
            <AppTextarea rows={2} value={draft.mistake} onChange={(event) => update("mistake", event.target.value)} placeholder="Anything to avoid next time? (optional)" />
          </FormField>

          <FormField label="Screenshot URL">
            <AppInput type="url" value={draft.screenshotUrl} onChange={(event) => update("screenshotUrl", event.target.value)} placeholder="https://... (optional)" />
          </FormField>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <AppButton type="submit" variant="primary" className="flex-1">
          <Save size={16} />
          {isEdit ? "Save Changes" : "Save Trade"}
        </AppButton>

        {isEdit && onDelete ? (
          <AppButton type="button" variant="danger" className="flex-1" onClick={onDelete}>
            <Trash2 size={16} />
            Delete Trade
          </AppButton>
        ) : null}

        <AppButton
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setError(null);
            setStatus(null);
            if (onCancel) {
              onCancel();
              return;
            }
            setDraft(toDraft());
          }}
        >
          <XCircle size={16} />
          Cancel
        </AppButton>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {status ? <p className="text-sm text-cyan-300">{status}</p> : null}
    </form>
  );
}
