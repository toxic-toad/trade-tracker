export type TabId = "dashboard" | "add" | "history" | "payout" | "debt" | "settings";

export interface Settings {
  accountSize: number;
  startingBalance: number;
  profitSplit: number;
  minimumTradingDays: number;
  minimumProfitForPayout: number;
  payoutCycleDays: 7 | 14;
  currentDebt: number;
  monthlySalary: number;
  monthlySalaryContribution: number;
  usdToInr: number;
}

export interface Trade {
  id: number;
  symbol: string;
  side: "Buy" | "Sell";
  entry: number;
  exit: number;
  notes: string;
  createdAt: string;
}

export interface AccountStats {
  currentBalance: number;
  currentProfit: number;
  profitRemainingUntilPayout: number;
  tradingDaysCompleted: number;
  nextPayoutCountdownDays: number;
  currentDebt: number;
  debtProgressPercent: number;
  lastCalculatedAt: string;
}

export interface TrackerData {
  settings: Settings;
  trades: Trade[];
  stats: AccountStats;
}

export const STORAGE_KEY = "trade-tracker-data-v1";

export const defaultSettings: Settings = {
  accountSize: 10000,
  startingBalance: 1000,
  profitSplit: 80,
  minimumTradingDays: 20,
  minimumProfitForPayout: 1500,
  payoutCycleDays: 14,
  currentDebt: 250000,
  monthlySalary: 90000,
  monthlySalaryContribution: 12000,
  usdToInr: 84,
};

export function createDefaultData(): TrackerData {
  return {
    settings: { ...defaultSettings },
    trades: [],
    stats: calculateAccountStats(defaultSettings, []),
  };
}

export function calculateAccountStats(settings: Settings, trades: Trade[]): AccountStats {
  const grossProfit = trades.reduce((sum, trade) => {
    const pnl = trade.side === "Buy" ? trade.exit - trade.entry : trade.entry - trade.exit;
    return sum + pnl;
  }, 0);

  const effectiveProfit = grossProfit * (settings.profitSplit / 100);
  const currentBalance = settings.startingBalance + effectiveProfit;
  const profitRemainingUntilPayout = Math.max(0, settings.minimumProfitForPayout - effectiveProfit);

  const uniqueDays = new Set(trades.map((trade) => trade.createdAt.slice(0, 10))).size;
  const anchorDate = trades.length > 0 ? new Date(trades[0].createdAt) : new Date();
  const nextPayoutDate = new Date(anchorDate);
  nextPayoutDate.setDate(anchorDate.getDate() + settings.payoutCycleDays);

  const countdownMs = nextPayoutDate.getTime() - new Date().getTime();
  const nextPayoutCountdownDays = Math.max(0, Math.ceil(countdownMs / (1000 * 60 * 60 * 24)));

  const debtProgressPercent = settings.currentDebt > 0
    ? Math.min(100, Math.round((settings.monthlySalaryContribution / settings.currentDebt) * 100))
    : 100;

  return {
    currentBalance,
    currentProfit: effectiveProfit,
    profitRemainingUntilPayout,
    tradingDaysCompleted: uniqueDays,
    nextPayoutCountdownDays,
    currentDebt: settings.currentDebt,
    debtProgressPercent,
    lastCalculatedAt: new Date().toISOString(),
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
