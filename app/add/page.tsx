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
    <AppShell activeTab="add" maxWidth="max-w-5xl">
        <PageHeader
          eyebrow="Add Trade"
          title="Record a new trade"
          description="Save the trade, clear the form, and return to the dashboard automatically."
        />

        <AppCard accent="cyan" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <TradeForm onSaved={handleSaved} onCancel={() => router.push("/")} />
        </AppCard>
    </AppShell>
  );
}
