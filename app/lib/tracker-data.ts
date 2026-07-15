import type { Settings, Trade, TrackerData } from "./tracker-models";
import { calculateAccountStats } from "./tracker-calculations";
import { defaultSettings } from "./tracker-models";

export type TabId = "dashboard" | "add" | "history" | "analytics" | "goals" | "financial" | "settings";
export type { Settings, Trade, TrackerData } from "./tracker-models";

export const STORAGE_KEY = "trade-tracker-data-v1";

export function createDefaultData(): TrackerData {
  return {
    settings: { ...defaultSettings },
    trades: [],
    stats: calculateAccountStats(defaultSettings, []),
    payouts: [],
  };
}

export function readTrackerData(): TrackerData {
  if (typeof window === "undefined") return createDefaultData();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultData();

  try {
    const parsed = JSON.parse(raw) as Partial<TrackerData>;
    const settings = { ...defaultSettings, ...(parsed.settings ?? {}) };
    settings.originalDebt = settings.originalDebt || settings.currentDebt || defaultSettings.originalDebt;
    settings.salaryContributions = settings.salaryContributions || 0;
    const trades = Array.isArray(parsed.trades) ? parsed.trades : [];
    const payouts = Array.isArray(parsed.payouts) ? parsed.payouts : [];
    return {
      settings,
      trades,
      stats: calculateAccountStats(settings, trades),
      payouts,
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return createDefaultData();
  }
}

export function writeTrackerData(data: TrackerData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
