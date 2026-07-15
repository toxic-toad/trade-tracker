"use client";

export const dynamic = "force-dynamic";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AppShell, PageHeader } from "../../components/ui-primitives";
import { TradeForm } from "../../components/trade-form";
import { removeTrade, useTrackerStore } from "../../lib/tracker-store";

const TOAST_KEY = "trade-tracker-toast";

export default function EditTradePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const data = useTrackerStore();
  const tradeId = Number(params.id);

  const trade = useMemo(() => data.trades.find((item) => item.id === tradeId), [data.trades, tradeId]);

  useEffect(() => {
    if (!trade) {
      router.replace("/history");
    }
  }, [router, trade]);

  if (!trade) return null;

  const handleSaved = (message: string) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(TOAST_KEY, message);
    }
    router.push("/history");
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this trade? This cannot be undone.");
    if (!confirmed) return;
    removeTrade(trade.id);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(TOAST_KEY, "Trade deleted.");
    }
    router.push("/history");
  };

  return (
    <AppShell activeTab="history" maxWidth="max-w-3xl">
      <PageHeader title="Edit Trade" subtitle={trade.symbol} accent="emerald" />

      <div className="mt-4 animate-fade-in">
        <TradeForm trade={trade} onSaved={handleSaved} onDelete={handleDelete} onCancel={() => router.push("/history")} />
      </div>
    </AppShell>
  );
}
