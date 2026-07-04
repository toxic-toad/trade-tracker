"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    let isMounted = true;

    getStorageUsage()?.then((estimate) => {
      if (isMounted) {
        setStorageUsage(estimate ?? null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = (changes: Partial<Settings>) => {
    updateTrackerSettings(changes);
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
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<TrackerData>;
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid backup format.");
      }

      const nextData = {
        settings: { ...data.settings, ...(parsed.settings ?? {}) },
        trades: Array.isArray(parsed.trades) ? parsed.trades : [],
        stats: data.stats,
      } as TrackerData;

      setTrackerData(nextData);
      writeTrackerData(nextData);
      setStatus("Backup imported.");
      event.target.value = "";
    } catch {
      setBackupError("Could not import backup. Please choose a valid JSON file.");
    }
  };

  const storageSummary = useMemo(() => {
    if (!storageUsage) return "Checking…";

    const usage = storageUsage.usage ?? 0;
    const quota = storageUsage.quota ?? 0;
    if (usage === 0) return "No usage detected";
    return quota > 0 ? `${Math.round((usage / quota) * 100)}% of available storage` : `${Math.round(usage / 1024)} KB used`;
  }, [storageUsage]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400">Settings</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Manage your tracker</h1>
              <p className="mt-2 text-sm text-slate-300">Everything stays local and updates instantly across your dashboard and reports.</p>
            </div>
            <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              Back
            </Link>
          </div>
        </header>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_16px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">App version</p>
            <p className="mt-2 text-2xl font-semibold text-white">{APP_VERSION}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_16px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Storage usage</p>
            <p className="mt-2 text-xl font-semibold text-white">{storageSummary}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_16px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Local key</p>
            <p className="mt-2 text-lg font-semibold text-white break-all">{STORAGE_KEY}</p>
          </article>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              Account Size
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.settings.accountSize}
                onChange={(event) => updateSettings({ accountSize: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Profit Target for Payout
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.settings.minimumProfitForPayout}
                onChange={(event) => updateSettings({ minimumProfitForPayout: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Minimum Trading Days
              <input
                type="number"
                min="0"
                step="1"
                value={data.settings.minimumTradingDays}
                onChange={(event) => updateSettings({ minimumTradingDays: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Payout Cycle Length
              <select
                value={data.settings.payoutCycleDays}
                onChange={(event) => updateSettings({ payoutCycleDays: Number(event.target.value) as 7 | 14 })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
              </select>
            </label>
            <label className="text-sm text-slate-300">
              Cycle Start Date
              <input
                type="date"
                value={data.settings.cycleStartDate}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  if (isValidDateInput(nextValue)) {
                    updateSettings({ cycleStartDate: nextValue });
                  }
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Current Cycle Number
              <input
                type="number"
                min="1"
                step="1"
                value={data.settings.currentCycleNumber}
                onChange={(event) => updateSettings({ currentCycleNumber: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Current Debt (INR)
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.settings.currentDebt}
                onChange={(event) => updateSettings({ currentDebt: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Monthly Salary (INR)
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.settings.monthlySalary}
                onChange={(event) => updateSettings({ monthlySalary: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Monthly EMI (INR)
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.settings.monthlyEmi}
                onChange={(event) => updateSettings({ monthlyEmi: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Monthly Salary Contribution Towards Debt (INR)
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.settings.monthlySalaryContribution}
                onChange={(event) => updateSettings({ monthlySalaryContribution: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              USD to INR exchange rate
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.settings.usdToInr}
                onChange={(event) => updateSettings({ usdToInr: Number(event.target.value) })}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleReset} className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 font-semibold text-rose-300 transition hover:bg-rose-500/20">
              Reset all data
            </button>
            <button type="button" onClick={handleExport} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500/20">
              Export Backup
            </button>
            <label className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10">
              Import Backup
              <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
            </label>
          </div>

          {status ? <p className="mt-4 text-sm text-emerald-300">{status}</p> : null}
          {backupError ? <p className="mt-2 text-sm text-rose-300">{backupError}</p> : null}
        </section>
      </div>
    </main>
  );
}
