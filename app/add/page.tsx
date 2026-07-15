"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { AppCard, AppShell, PageHeader } from "../components/ui-primitives";
import { TradeForm } from "../components/trade-form";

const TOAST_KEY = "trade-tracker-toast";

export default function AddTradePage() {
  const router = useRouter();

  const handleSaved = (message: string) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(TOAST_KEY, message);
    }
    router.push("/");
  };

  return (
    <AppShell activeTab="add" maxWidth="max-w-3xl">
      <PageHeader title="Add Trade" subtitle="Record a new trade" accent="emerald" />

      <div className="mt-4 animate-fade-in">
        <TradeForm onSaved={handleSaved} onCancel={() => router.push("/")} />
      </div>
    </AppShell>
  );
}
