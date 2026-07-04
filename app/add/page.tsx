"use client";

export const dynamic = "force-dynamic";

import { AppCard, PageHeader, PageShell } from "../components/ui-primitives";
import { TradeForm } from "../components/trade-form";

export default function AddTradePage() {
  return (
    <PageShell>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Add Trade"
          title="Record a new trade"
          description="Everything is stored locally and synced instantly to your dashboard."
          action={<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">Local save</div>}
        />

        <AppCard accent="cyan" className="mt-4 animate-[fadeIn_400ms_ease-out]">
          <TradeForm />
        </AppCard>
      </div>
    </PageShell>
  );
}
