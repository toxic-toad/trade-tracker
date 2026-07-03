"use client";

import { useEffect, useSyncExternalStore } from "react";
import { calculateAccountStats } from "./tracker-calculations";
import { createDefaultData, readTrackerData, writeTrackerData } from "./tracker-data";
import type { Settings, TrackerData, Trade } from "./tracker-models";

const listeners = new Set<() => void>();
let currentData = createDefaultData();

function emit() {
  listeners.forEach((listener) => listener());
}

function hydrate() {
  currentData = readTrackerData();
  emit();
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
  if (typeof window !== "undefined" && !window.__TRADE_TRACKER_INITIALIZED__) {
    initializeTrackerStore();
  }
  return currentData;
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
  const nextTrades = [trade, ...data.trades];
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

export function useTrackerStore() {
  useEffect(() => {
    initializeTrackerStore();
  }, []);

  return useSyncExternalStore(subscribeTrackerStore, getTrackerData, createDefaultData);
}

interface WindowWithTracker extends Window {
  __TRADE_TRACKER_INITIALIZED__?: boolean;
}

declare global {
  interface Window {
    __TRADE_TRACKER_INITIALIZED__?: boolean;
  }
}
