export interface Settings {
  accountSize: number;
  startingBalance: number;
  profitSplit: number;
  minimumTradingDays: number;
  minimumProfitForPayout: number;
  payoutCycleDays: 7 | 14;
  cycleStartDate: string;
  currentCycleNumber: number;
  currentDebt: number;
  monthlySalary: number;
  monthlyEmi: number;
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
  riskAmount?: number;
  notes?: string;
  strategy?: string;
  mistake?: string;
  emotion?: string;
  screenshotUrl?: string;
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
  accountSize: 2500,
  startingBalance: 1000,
  profitSplit: 80,
  minimumTradingDays: 5,
  minimumProfitForPayout: 100,
  payoutCycleDays: 14,
  cycleStartDate: new Date().toISOString().slice(0, 10),
  currentCycleNumber: 1,
  currentDebt: 250000,
  monthlySalary: 90000,
  monthlyEmi: 12000,
  monthlySalaryContribution: 12000,
  usdToInr: 84,
};
