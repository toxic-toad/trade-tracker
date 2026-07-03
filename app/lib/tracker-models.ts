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
  date: string;
  profitLoss: number;
  lotSize?: number;
  symbol: string;
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
  winRate: number;
  currentWinStreak: number;
  bestWinStreak: number;
  averageProfitPerWinningTrade: number;
  averageLossPerLosingTrade: number;
  profitFactor: number;
  payoutEligible: boolean;
  lastCalculatedAt: string;
}

export interface TrackerData {
  settings: Settings;
  trades: Trade[];
  stats: AccountStats;
}

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
