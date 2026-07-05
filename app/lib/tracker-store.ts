"use client";

import { useEffect, useSyncExternalStore } from "react";
import { calculateAccountStats, getCurrentCycleTrades } from "./tracker-calculations";
import { createDefaultData, readTrackerData, writeTrackerData } from "./tracker-data";
import type { Payout, Settings, TrackerData, Trade } from "./tracker-models";

const listeners = new Set<() => void>();
let currentData = createDefaultData();
const serverSnapshot = createDefaultData();

function emit() {
  listeners.forEach((listener) => listener());
}

function hydrate() {
  currentData = readTrackerData();
  emit();
}

function getSnapshot() {
  if (typeof window !== "undefined" && !window.__TRADE_TRACKER_INITIALIZED__) {
    initializeTrackerStore();
  }
  return currentData;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function initializeTrackerStore() {
  if (typeof window === "undefined") return;
  if (window.__TRADE_TRACKER_INITIALIZED__) return;

  window.__TRADE_TRACKER_INITIALIZED__ = true;
  hydrate();
  window.addEventListener("storage", hydrate);
  window.addEventListener("trade-tracker-data-changed", hydrate);
}

export function getTrackerData(): TrackerData {
  return getSnapshot();
}

export function subscribeTrackerStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTrackerData(nextData: TrackerData) {
  currentData = nextData;
  writeTrackerData(nextData);
  emit();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("trade-tracker-data-changed"));
  }
}

export function updateTrackerSettings(changes: Partial<Settings>) {
  const data = getTrackerData();
  const nextSettings = { ...data.settings, ...changes };
  const nextData = {
    ...data,
    settings: nextSettings,
    stats: calculateAccountStats(nextSettings, data.trades),
  };
  setTrackerData(nextData);
}

export function addTrade(trade: Trade) {
  const data = getTrackerData();
  const nextTrades = [{ ...trade, cycleNumber: data.settings.currentCycleNumber }, ...data.trades];
  const nextData = {
    ...data,
    trades: nextTrades,
    stats: calculateAccountStats(data.settings, nextTrades),
  };
  setTrackerData(nextData);
}

export function updateTrade(updatedTrade: Trade) {
  const data = getTrackerData();
  const nextTrades = data.trades.map((trade) => (trade.id === updatedTrade.id ? updatedTrade : trade));
  const nextData = {
    ...data,
    trades: nextTrades,
    stats: calculateAccountStats(data.settings, nextTrades),
  };
  setTrackerData(nextData);
}

export function removeTrade(tradeId: number) {
  const data = getTrackerData();
  const nextTrades = data.trades.filter((trade) => trade.id !== tradeId);
  const nextData = {
    ...data,
    trades: nextTrades,
    stats: calculateAccountStats(data.settings, nextTrades),
  };
  setTrackerData(nextData);
}

export function addPayout(payout: Payout) {
  const data = getTrackerData();
  const nextPayouts = [payout, ...data.payouts];
  const nextData = {
    ...data,
    payouts: nextPayouts,
  };
  setTrackerData(nextData);
}

export function processPayout() {
  const data = getTrackerData();
  const settings = data.settings;
  
  const currentCycleTrades = getCurrentCycleTrades(settings, data.trades);
  const totalTradeProfit = currentCycleTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const payoutUsd = Math.max(0, totalTradeProfit * (settings.profitSplit / 100));
  const payoutInr = payoutUsd * settings.usdToInr;
  const debtBefore = settings.currentDebt;
  const debtAfter = Math.max(0, debtBefore - payoutInr);
  
  const payout: Payout = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    cycleNumber: settings.currentCycleNumber,
    tradingProfitUsd: totalTradeProfit,
    tradingProfitInr: totalTradeProfit * settings.usdToInr,
    profitSplitPercent: settings.profitSplit,
    payoutUsd,
    payoutInr,
    debtBefore,
    debtAfter,
    createdAt: new Date().toISOString(),
  };
  
  const nextSettings = {
    ...settings,
    currentDebt: debtAfter,
    currentCycleNumber: settings.currentCycleNumber + 1,
    cycleStartDate: new Date().toISOString().slice(0, 10),
  };
  
  const nextData = {
    ...data,
    settings: nextSettings,
    payouts: [payout, ...data.payouts],
    stats: calculateAccountStats(nextSettings, data.trades),
  };
  
  setTrackerData(nextData);
  return payout;
}

export function recordSalaryContribution(amountInr: number) {
  const data = getTrackerData();
  const amount = Math.max(0, amountInr);
  if (amount <= 0) return;

  const nextSettings = {
    ...data.settings,
    salaryContributions: data.settings.salaryContributions + amount,
    currentDebt: Math.max(0, data.settings.currentDebt - amount),
  };

  setTrackerData({
    ...data,
    settings: nextSettings,
    stats: calculateAccountStats(nextSettings, data.trades),
  });
}

export function useTrackerStore() {
  useEffect(() => {
    initializeTrackerStore();
  }, []);

  return useSyncExternalStore(subscribeTrackerStore, getSnapshot, getServerSnapshot);
}

interface WindowWithTracker extends Window {
  __TRADE_TRACKER_INITIALIZED__?: boolean;
}

declare global {
  interface Window {
    __TRADE_TRACKER_INITIALIZED__?: boolean;
  }
}
