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
  const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

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
