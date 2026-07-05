"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { AppButton, AppCard, AppInput, AppSelect, AppShell, FormField, PageHeader } from "../components/ui-primitives";
import { STORAGE_KEY, createDefaultData, isValidDateInput, readTrackerData, writeTrackerData } from "../lib/tracker-data";
import type { Settings, TrackerData } from "../lib/tracker-models";
import { setTrackerData, updateTrackerSettings, useTrackerStore } from "../lib/tracker-store";

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
    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = (changes: Partial<Settings>) => {
    updateTrackerSettings(changes);
    setSavedToast("Settings Saved ✓");
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
      {savedToast ? <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 shadow-lg backdrop-blur">{savedToast}</div> : null}
      <PageHeader eyebrow="Settings" title="Manage your tracker" description="Adjust your account assumptions and app preferences." />

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <AppCard>
          <p className="text-sm text-slate-400">App version</p>
          <p className="mt-2 text-2xl font-semibold text-white">{APP_VERSION}</p>
        </AppCard>
        <AppCard>
          <p className="text-sm text-slate-400">Storage usage</p>
          <p className="mt-2 text-xl font-semibold text-white">{storageSummary}</p>
        </AppCard>
        <AppCard>
          <p className="text-sm text-slate-400">Storage key</p>
          <p className="mt-2 break-all text-lg font-semibold text-white">{STORAGE_KEY}</p>
        </AppCard>
      </section>

      <AppCard accent="default" className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Account Size" value={data.settings.accountSize} onChange={(value) => updateSettings({ accountSize: value })} />
          <NumberField label="Profit Target for Payout" value={data.settings.minimumProfitForPayout} onChange={(value) => updateSettings({ minimumProfitForPayout: value })} />
          <NumberField label="Minimum Trading Days" value={data.settings.minimumTradingDays} step="1" onChange={(value) => updateSettings({ minimumTradingDays: value })} />
          <FormField label="Payout Cycle Length">
            <AppSelect value={data.settings.payoutCycleDays} onChange={(event) => updateSettings({ payoutCycleDays: Number(event.target.value) as 7 | 14 })}>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </AppSelect>
          </FormField>
          <FormField label="Cycle Start Date">
            <AppInput
              type="date"
              value={data.settings.cycleStartDate}
              onChange={(event) => {
                if (isValidDateInput(event.target.value)) updateSettings({ cycleStartDate: event.target.value });
              }}
            />
          </FormField>
          <NumberField label="Current Cycle Number" value={data.settings.currentCycleNumber} min="1" step="1" onChange={(value) => updateSettings({ currentCycleNumber: value })} />
          <NumberField label="Current Debt (INR)" value={data.settings.currentDebt} onChange={(value) => updateSettings({ currentDebt: value })} />
          <NumberField label="Original Debt (INR)" value={data.settings.originalDebt} onChange={(value) => updateSettings({ originalDebt: value })} />
          <NumberField label="Monthly Salary (INR)" value={data.settings.monthlySalary} onChange={(value) => updateSettings({ monthlySalary: value })} />
          <NumberField label="Monthly EMI (INR)" value={data.settings.monthlyEmi} onChange={(value) => updateSettings({ monthlyEmi: value })} />
          <NumberField label="Default Salary Contribution (INR)" value={data.settings.monthlySalaryContribution} onChange={(value) => updateSettings({ monthlySalaryContribution: value })} />
          <NumberField label="USD to INR exchange rate" value={data.settings.usdToInr} onChange={(value) => updateSettings({ usdToInr: value })} />
          <NumberField label="Profit Split (%)" value={data.settings.profitSplit} min="0" max="100" onChange={(value) => updateSettings({ profitSplit: value })} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <AppButton type="button" onClick={handleReset} variant="danger">Reset all data</AppButton>
          <AppButton type="button" onClick={handleExport} variant="secondary">Export Backup</AppButton>
          <label className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-semibold text-slate-300 transition hover:bg-white/10">
            Import Backup
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
        </div>

        {status ? <p className="mt-4 text-sm text-emerald-300">{status}</p> : null}
        {backupError ? <p className="mt-2 text-sm text-rose-300">{backupError}</p> : null}
      </AppCard>
    </AppShell>
  );
}

function NumberField({ label, value, onChange, min = "0", max, step = "0.01" }: { label: string; value: number; onChange: (value: number) => void; min?: string; max?: string; step?: string }) {
  return (
    <FormField label={label}>
      <AppInput type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </FormField>
  );
}
