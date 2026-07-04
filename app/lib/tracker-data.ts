import type { Settings, Trade, TrackerData } from "./tracker-models";
import { calculateAccountStats } from "./tracker-calculations";
import { defaultSettings } from "./tracker-models";

export type TabId = "dashboard" | "add" | "history" | "analytics" | "payout" | "debt" | "settings";
export type { Settings, Trade, TrackerData } from "./tracker-models";

export const STORAGE_KEY = "trade-tracker-data-v1";

export function createDefaultData(): TrackerData {
  return {
    settings: { ...defaultSettings },
    trades: [],
    stats: calculateAccountStats(defaultSettings, []),
  };
}

export function readTrackerData(): TrackerData {
  if (typeof window === "undefined") return createDefaultData();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultData();

  try {
    const parsed = JSON.parse(raw) as Partial<TrackerData>;
    const settings = parsed.settings ?? defaultSettings;
    const trades = Array.isArray(parsed.trades) ? parsed.trades : [];
    return {
      settings: { ...defaultSettings, ...settings },
      trades,
      stats: calculateAccountStats({ ...defaultSettings, ...settings }, trades),
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

export function formatCurrency(value: number, usdToInr: number): string {
  const inrValue = value * usdToInr;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(inrValue);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
