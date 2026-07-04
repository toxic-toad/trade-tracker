"use client";

export const dynamic = "force-dynamic";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AppCard, BackLink, PageHeader, PageShell } from "../../components/ui-primitives";
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

  if (!trade) {
    return null;
  }

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
      window.sessionStorage.setItem(TOAST_KEY, "Trade deleted locally.");
    }
    router.push("/history");
  };

  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Edit Trade"
          title="Update trade details"
          description="Changes sync instantly across your dashboard, history, and analytics."
          action={<BackLink href="/history" />}
        />

        <AppCard accent="emerald" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <TradeForm trade={trade} onSaved={handleSaved} onDelete={handleDelete} onCancel={() => router.push("/history")} />
        </AppCard>
      </div>
    </PageShell>
  );
}
