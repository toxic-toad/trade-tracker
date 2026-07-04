import type { AccountStats, Settings, Trade, TrackerData } from "./tracker-models";

export function calculateAccountStats(settings: Settings, trades: Trade[]): AccountStats {
  const totalTradeProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const effectiveProfit = totalTradeProfit * (settings.profitSplit / 100);
  const currentBalance = settings.startingBalance + effectiveProfit;
  const profitRemainingUntilPayout = Math.max(0, settings.minimumProfitForPayout - effectiveProfit);

  const uniqueDays = new Set(trades.map((trade) => trade.date || trade.createdAt.slice(0, 10))).size;
  const anchorDate = trades.length > 0 ? new Date(trades[0].date || trades[0].createdAt) : new Date();
  const nextPayoutDate = new Date(anchorDate);
  nextPayoutDate.setDate(anchorDate.getDate() + settings.payoutCycleDays);
  const countdownMs = nextPayoutDate.getTime() - new Date().getTime();
  const nextPayoutCountdownDays = Math.max(0, Math.ceil(countdownMs / (1000 * 60 * 60 * 24)));

  const debtProgressPercent = settings.currentDebt > 0
    ? Math.min(100, Math.round((settings.monthlySalaryContribution / settings.currentDebt) * 100))
    : 100;

  const winningTrades = trades.filter((trade) => trade.profitLoss > 0);
  const losingTrades = trades.filter((trade) => trade.profitLoss < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  let currentWinStreak = 0;
  let bestWinStreak = 0;
  let runningStreak = 0;

  for (const trade of [...trades].reverse()) {
    if (trade.profitLoss > 0) {
      runningStreak += 1;
      currentWinStreak = runningStreak;
      bestWinStreak = Math.max(bestWinStreak, runningStreak);
    } else {
      runningStreak = 0;
      currentWinStreak = 0;
    }
  }

  const averageProfitPerWinningTrade = winningTrades.length > 0
    ? winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / winningTrades.length
    : 0;
  const averageLossPerLosingTrade = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / losingTrades.length)
    : 0;
  const profitFactor = computeProfitFactor(trades);

  return {
    currentBalance,
    currentProfit: effectiveProfit,
    profitRemainingUntilPayout,
    tradingDaysCompleted: uniqueDays,
    nextPayoutCountdownDays,
    currentDebt: settings.currentDebt,
    debtProgressPercent,
    winRate,
    currentWinStreak,
    bestWinStreak,
    averageProfitPerWinningTrade,
    averageLossPerLosingTrade,
    profitFactor,
    payoutEligible: effectiveProfit >= settings.minimumProfitForPayout && uniqueDays >= settings.minimumTradingDays,
    lastCalculatedAt: new Date().toISOString(),
  };
}

export function getFinancialSummary(data: TrackerData) {
  const totalDebtPaid = Math.max(0, data.settings.currentDebt - data.stats.currentDebt);
  const remainingDebt = data.stats.currentDebt;
  const debtCompletedPercent = data.settings.currentDebt > 0
    ? Math.min(100, Math.round((totalDebtPaid / data.settings.currentDebt) * 100))
    : 100;
  const tradingProfitUsd = data.stats.currentProfit;
  const tradingProfitInr = tradingProfitUsd * data.settings.usdToInr;
  const totalSalaryContribution = data.settings.monthlySalaryContribution;
  const totalAmountPaidTowardsDebt = Math.min(remainingDebt, totalSalaryContribution);
  const averageMonthlyTradingIncome = data.trades.length > 0 ? tradingProfitUsd / Math.max(1, Math.round(data.trades.length / 3)) : 0;
  const averageMonthlyTotalContribution = averageMonthlyTradingIncome + totalSalaryContribution;
  const monthsRemaining = remainingDebt > 0 && averageMonthlyTotalContribution > 0
    ? Math.ceil(remainingDebt / averageMonthlyTotalContribution)
    : 0;

  return {
    totalDebtPaid,
    remainingDebt,
    debtCompletedPercent,
    tradingProfitUsd,
    tradingProfitInr,
    totalSalaryContribution,
    totalAmountPaidTowardsDebt,
    averageMonthlyTradingIncome,
    averageMonthlyTotalContribution,
    monthsRemaining,
  };
}

export function getGoalsSummary(data: TrackerData) {
  const progressPercent = Math.min(100, Math.round((data.stats.currentProfit / data.settings.minimumProfitForPayout) * 100));
  const motivationMessage = data.stats.payoutEligible
    ? "Payout eligible. Keep the discipline and protect your edge."
    : data.stats.tradingDaysCompleted >= data.settings.minimumTradingDays && data.stats.currentProfit >= data.settings.minimumProfitForPayout
      ? "One more disciplined trade will lock in payout eligibility."
      : data.stats.tradingDaysCompleted >= data.settings.minimumTradingDays
        ? "Trading days requirement completed. One focused trade can unlock payout."
        : data.stats.currentProfit >= data.settings.minimumProfitForPayout
          ? "Profit target reached. Stay consistent to complete the trading days requirement."
          : "Stay disciplined. Consistency beats speed.";

  return {
    progressPercent,
    motivationMessage,
    milestones: [
      { label: "Minimum trading days completed", done: data.stats.tradingDaysCompleted >= data.settings.minimumTradingDays },
      { label: "Profit target reached", done: data.stats.currentProfit >= data.settings.minimumProfitForPayout },
      { label: "Payout eligible", done: data.stats.payoutEligible },
    ],
  };
}

export function computeProfitFactor(trades: Trade[]): number {
  const grossProfit = trades.filter((trade) => trade.profitLoss > 0).reduce((sum, trade) => sum + trade.profitLoss, 0);
  const grossLoss = Math.abs(trades.filter((trade) => trade.profitLoss < 0).reduce((sum, trade) => sum + trade.profitLoss, 0));
  return grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
}

export function tradeDateKey(trade: Trade): string {
  return trade.date || trade.createdAt.slice(0, 10);
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface TradeSummary {
  count: number;
  totalProfit: number;
  winRate: number;
  winningCount: number;
  losingCount: number;
}

export function summarizeTrades(trades: Trade[]): TradeSummary {
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningCount = trades.filter((trade) => trade.profitLoss > 0).length;
  const losingCount = trades.filter((trade) => trade.profitLoss < 0).length;
  const winRate = trades.length > 0 ? (winningCount / trades.length) * 100 : 0;
  return { count: trades.length, totalProfit, winRate, winningCount, losingCount };
}

export interface DashboardMetrics {
  todayProfit: number;
  weekProfit: number;
  monthProfit: number;
  averageDailyProfit: number;
  largestWin: number;
  largestLoss: number;
}

export function getDashboardMetrics(trades: Trade[]): DashboardMetrics {
  const now = new Date();
  const todayKey = toLocalDateKey(now);

  const startOfWeek = new Date(now);
  const mondayOffset = (now.getDay() + 6) % 7;
  startOfWeek.setDate(now.getDate() - mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let todayProfit = 0;
  let weekProfit = 0;
  let monthProfit = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let total = 0;
  const activeDays = new Set<string>();

  for (const trade of trades) {
    const dateKey = tradeDateKey(trade);
    activeDays.add(dateKey);
    total += trade.profitLoss;

    const tradeDate = new Date(`${dateKey}T00:00:00`);
    if (dateKey === todayKey) todayProfit += trade.profitLoss;
    if (tradeDate >= startOfWeek) weekProfit += trade.profitLoss;
    if (tradeDate >= startOfMonth) monthProfit += trade.profitLoss;
    if (trade.profitLoss > largestWin) largestWin = trade.profitLoss;
    if (trade.profitLoss < largestLoss) largestLoss = trade.profitLoss;
  }

  const averageDailyProfit = activeDays.size > 0 ? total / activeDays.size : 0;

  return { todayProfit, weekProfit, monthProfit, averageDailyProfit, largestWin, largestLoss };
}

export interface MonthlyProfit {
  key: string;
  label: string;
  profit: number;
}

export interface EquityPoint {
  index: number;
  dateKey: string;
  cumulative: number;
}

export interface WeekdayFrequency {
  label: string;
  count: number;
}

export interface Analytics {
  profitByMonth: MonthlyProfit[];
  winningCount: number;
  losingCount: number;
  winLossRatio: number;
  profitFactor: number;
  averageRMultiple: number | null;
  rTradeCount: number;
  equityCurve: EquityPoint[];
  totalTrades: number;
  activeDays: number;
  averageTradesPerActiveDay: number;
  tradesByWeekday: WeekdayFrequency[];
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getAnalytics(trades: Trade[]): Analytics {
  const chronological = [...trades].sort((left, right) => {
    const leftTime = new Date(left.date || left.createdAt).getTime();
    const rightTime = new Date(right.date || right.createdAt).getTime();
    if (leftTime !== rightTime) return leftTime - rightTime;
    return left.id - right.id;
  });

  const monthlyMap = new Map<string, number>();
  const weekdayCounts = new Array<number>(7).fill(0);
  const activeDays = new Set<string>();
  let cumulative = 0;
  const equityCurve: EquityPoint[] = [];

  chronological.forEach((trade, index) => {
    const dateKey = tradeDateKey(trade);
    activeDays.add(dateKey);

    const monthKey = dateKey.slice(0, 7);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + trade.profitLoss);

    const weekday = new Date(`${dateKey}T00:00:00`).getDay();
    weekdayCounts[weekday] += 1;

    cumulative += trade.profitLoss;
    equityCurve.push({ index, dateKey, cumulative });
  });

  const profitByMonth: MonthlyProfit[] = [...monthlyMap.entries()]
    .sort((left, right) => (left[0] < right[0] ? -1 : 1))
    .map(([key, profit]) => {
      const [year, month] = key.split("-").map(Number);
      const label = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      return { key, label, profit };
    });

  const winningCount = trades.filter((trade) => trade.profitLoss > 0).length;
  const losingCount = trades.filter((trade) => trade.profitLoss < 0).length;
  const winLossRatio = losingCount > 0 ? winningCount / losingCount : winningCount > 0 ? Infinity : 0;

  const rTrades = trades.filter((trade) => typeof trade.riskAmount === "number" && trade.riskAmount > 0);
  const averageRMultiple = rTrades.length > 0
    ? rTrades.reduce((sum, trade) => sum + trade.profitLoss / (trade.riskAmount as number), 0) / rTrades.length
    : null;

  return {
    profitByMonth,
    winningCount,
    losingCount,
    winLossRatio,
    profitFactor: computeProfitFactor(trades),
    averageRMultiple,
    rTradeCount: rTrades.length,
    equityCurve,
    totalTrades: trades.length,
    activeDays: activeDays.size,
    averageTradesPerActiveDay: activeDays.size > 0 ? trades.length / activeDays.size : 0,
    tradesByWeekday: weekdayCounts.map((count, index) => ({ label: WEEKDAY_LABELS[index], count })),
  };
}
