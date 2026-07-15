"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { AppButton, AppInput, AppSelect, AppShell, FormField, PageHeader } from "../components/ui-primitives";
import { STORAGE_KEY, createDefaultData, isValidDateInput, readTrackerData, writeTrackerData } from "../lib/tracker-data";
import type { Settings, TrackerData } from "../lib/tracker-models";
import { setTrackerData, updateTrackerSettings, useTrackerStore } from "../lib/tracker-store";
import { Target, TrendingUp, DollarSign, Calendar, Wallet, ArrowRightLeft, Percent, RotateCcw, Download, Upload, AlertTriangle, Info } from "lucide-react";

const APP_VERSION = "1.0.0";

function getStorageUsage() {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  return navigator.storage.estimate();
}

export default function SettingsPage() {
  const data = useTrackerStore();
  const [storageUsage, setStorageUsage] = useState<{ usage?: number; quota?: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getStorageUsage()?.then((estimate) => {
      if (isMounted) setStorageUsage(estimate ?? null);
    });
    return () => { isMounted = false; };
  }, []);

  const updateSettings = (changes: Partial<Settings>) => {
    updateTrackerSettings(changes);
    setSavedToast("Saved");
    window.setTimeout(() => setSavedToast(null), 1500);
  };

  const handleReset = () => {
    const confirmed = window.confirm("Reset all tracker data? This cannot be undone.");
    if (!confirmed) return;
    setTrackerData(createDefaultData());
    setStatus("All data reset.");
  };

  const handleExport = () => {
    const exportData = readTrackerData();
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trade-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Backup exported.");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Partial<TrackerData>;
      if (!parsed || typeof parsed !== "object") throw new Error("Invalid backup format.");
      const nextData = {
        settings: { ...data.settings, ...(parsed.settings ?? {}) },
        trades: Array.isArray(parsed.trades) ? parsed.trades : [],
        stats: data.stats,
        payouts: Array.isArray(parsed.payouts) ? parsed.payouts : [],
      } as TrackerData;
      setTrackerData(nextData);
      writeTrackerData(nextData);
      setStatus("Backup imported.");
      setBackupError(null);
      event.target.value = "";
    } catch {
      setBackupError("Could not import backup. Please choose a valid JSON file.");
    }
  };

  const storageSummary = useMemo(() => {
    if (!storageUsage) return "Checking...";
    const usage = storageUsage.usage ?? 0;
    const quota = storageUsage.quota ?? 0;
    if (usage === 0) return "No usage detected";
    return quota > 0 ? `${Math.round((usage / quota) * 100)}% of available storage` : `${Math.round(usage / 1024)} KB used`;
  }, [storageUsage]);

  return (
    <AppShell activeTab="settings">
      {savedToast ? <div className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 shadow-lg backdrop-blur animate-fade-in">{savedToast}</div> : null}

      <PageHeader title="Settings" subtitle="Manage your preferences" />

      {/* Trading Settings */}
      <section className="mt-5">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400"><Target size={12} /></div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Trading</h2>
        </div>
        <div className="space-y-1.5">
          <SettingsRow icon={<TrendingUp size={14} />} label="Profit Target" value={`$${data.settings.minimumProfitForPayout}`}>
            <NumberFieldInline value={data.settings.minimumProfitForPayout} onChange={(v) => updateSettings({ minimumProfitForPayout: v })} />
          </SettingsRow>
          <SettingsRow icon={<Percent size={14} />} label="Consistency Limit" value={`${data.settings.profitSplit}%`}>
            <NumberFieldInline value={data.settings.profitSplit} min="0" max="100" onChange={(v) => updateSettings({ profitSplit: v })} />
          </SettingsRow>
          <SettingsRow icon={<DollarSign size={14} />} label="Account Size" value={`$${data.settings.accountSize}`}>
            <NumberFieldInline value={data.settings.accountSize} onChange={(v) => updateSettings({ accountSize: v })} />
          </SettingsRow>
          <SettingsRow icon={<Calendar size={14} />} label="Min Trading Days" value={String(data.settings.minimumTradingDays)}>
            <NumberFieldInline value={data.settings.minimumTradingDays} step="1" onChange={(v) => updateSettings({ minimumTradingDays: v })} />
          </SettingsRow>
          <SettingsRow icon={<Calendar size={14} />} label="Cycle Length" value={`${data.settings.payoutCycleDays} days`}>
            <AppSelect value={data.settings.payoutCycleDays} onChange={(e) => updateSettings({ payoutCycleDays: Number(e.target.value) as 7 | 14 })} className="mt-1">
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </AppSelect>
          </SettingsRow>
          <SettingsRow icon={<Calendar size={14} />} label="Cycle Start Date" value={data.settings.cycleStartDate}>
            <AppInput type="date" value={data.settings.cycleStartDate} onChange={(e) => { if (isValidDateInput(e.target.value)) updateSettings({ cycleStartDate: e.target.value }); }} className="mt-1" />
          </SettingsRow>
          <SettingsRow icon={<Target size={14} />} label="Cycle Number" value={String(data.settings.currentCycleNumber)}>
            <NumberFieldInline value={data.settings.currentCycleNumber} min="1" step="1" onChange={(v) => updateSettings({ currentCycleNumber: v })} />
          </SettingsRow>
        </div>
      </section>

      {/* Financial Settings */}
      <section className="mt-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400"><Wallet size={12} /></div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Financial</h2>
        </div>
        <div className="space-y-1.5">
          <SettingsRow icon={<ArrowRightLeft size={14} />} label="USD / INR Rate" value={`₹${data.settings.usdToInr}`}>
            <NumberFieldInline value={data.settings.usdToInr} onChange={(v) => updateSettings({ usdToInr: v })} />
          </SettingsRow>
          <SettingsRow icon={<Wallet size={14} />} label="Current Debt (INR)" value={`₹${data.settings.currentDebt.toLocaleString("en-IN")}`}>
            <NumberFieldInline value={data.settings.currentDebt} onChange={(v) => updateSettings({ currentDebt: v })} />
          </SettingsRow>
          <SettingsRow icon={<Wallet size={14} />} label="Original Debt (INR)" value={`₹${data.settings.originalDebt.toLocaleString("en-IN")}`}>
            <NumberFieldInline value={data.settings.originalDebt} onChange={(v) => updateSettings({ originalDebt: v })} />
          </SettingsRow>
          <SettingsRow icon={<DollarSign size={14} />} label="Monthly Salary (INR)" value={`₹${data.settings.monthlySalary.toLocaleString("en-IN")}`}>
            <NumberFieldInline value={data.settings.monthlySalary} onChange={(v) => updateSettings({ monthlySalary: v })} />
          </SettingsRow>
          <SettingsRow icon={<DollarSign size={14} />} label="Monthly EMI (INR)" value={`₹${data.settings.monthlyEmi.toLocaleString("en-IN")}`}>
            <NumberFieldInline value={data.settings.monthlyEmi} onChange={(v) => updateSettings({ monthlyEmi: v })} />
          </SettingsRow>
          <SettingsRow icon={<DollarSign size={14} />} label="Salary Contribution (INR)" value={`₹${data.settings.monthlySalaryContribution.toLocaleString("en-IN")}`}>
            <NumberFieldInline value={data.settings.monthlySalaryContribution} onChange={(v) => updateSettings({ monthlySalaryContribution: v })} />
          </SettingsRow>
        </div>
      </section>

      {/* Data */}
      <section className="mt-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400"><Download size={12} /></div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Data</h2>
        </div>
        <div className="space-y-1.5">
          <button type="button" onClick={handleExport} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-left transition hover:bg-white/[0.05] active:scale-[0.99]">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400"><Download size={14} /></div>
            <span className="flex-1 text-sm font-medium text-slate-200">Export Data</span>
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>
          <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-left transition hover:bg-white/[0.05] active:scale-[0.99]">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400"><Upload size={14} /></div>
            <span className="flex-1 text-sm font-medium text-slate-200">Import Data</span>
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </label>
        </div>
        {status ? <p className="mt-2 text-xs text-emerald-400">{status}</p> : null}
        {backupError ? <p className="mt-2 text-xs text-rose-400">{backupError}</p> : null}
      </section>

      {/* Danger Zone */}
      <section className="mt-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-400"><AlertTriangle size={12} /></div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-400">Danger Zone</h2>
        </div>
        <button type="button" onClick={handleReset} className="flex w-full items-center gap-3 rounded-xl border border-rose-500/15 bg-rose-500/[0.04] px-3 py-3 text-left transition hover:bg-rose-500/[0.08] active:scale-[0.99]">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400"><RotateCcw size={14} /></div>
          <div>
            <span className="text-sm font-medium text-rose-300">Reset All Data</span>
            <p className="text-xs text-rose-400/60">This action cannot be undone</p>
          </div>
        </button>
      </section>

      {/* About */}
      <section className="mt-8 mb-4 text-center">
        <p className="text-xs text-slate-600">Trade Tracker v{APP_VERSION}</p>
        {storageUsage ? <p className="mt-0.5 text-[10px] text-slate-700">{storageSummary}</p> : null}
      </section>
    </AppShell>
  );
}

function SettingsRow({ icon, label, value, children }: { icon: ReactNode; label: string; value?: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-slate-400">
          {icon}
        </div>
        <span className="flex-1 text-sm font-medium text-slate-200">{label}</span>
        <span className="text-sm text-slate-400 max-w-[120px] truncate">{value}</span>
        <svg className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
      </button>
      {expanded ? <div className="px-3 pb-3 pt-1 border-t border-white/[0.04]">{children}</div> : null}
    </div>
  );
}

function NumberFieldInline({ value, onChange, min = "0", max, step = "0.01" }: { value: number; onChange: (value: number) => void; min?: string; max?: string; step?: string }) {
  return (
    <AppInput type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  );
}

import { ReactNode } from "react";
