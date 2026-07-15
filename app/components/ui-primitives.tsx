"use client";

import { Activity, ArrowLeft, BarChart3, CheckCircle2, Home as HomeIcon, History, PlusCircle, Settings, Sparkles, Target, WalletCards, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type SurfaceVariant = "default" | "raised" | "overlay" | "muted";

type CardProps = {
  children: ReactNode;
  className?: string;
  accent?: "default" | "cyan" | "emerald" | "rose" | "violet" | "amber" | "blue";
  interactive?: boolean;
  onClick?: () => void;
  surface?: SurfaceVariant;
  noPadding?: boolean;
};

export function AppCard({ children, className = "", accent = "default", interactive = false, onClick, surface = "default", noPadding = false }: CardProps) {
  const accentStyles: Record<string, string> = {
    default: "border-white/[0.06] bg-[#0a0e17]",
    cyan: "border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-[#0a0e17]",
    emerald: "border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.04] to-[#0a0e17]",
    rose: "border-rose-500/10 bg-gradient-to-br from-rose-500/[0.04] to-[#0a0e17]",
    violet: "border-violet-500/10 bg-gradient-to-br from-violet-500/[0.04] to-[#0a0e17]",
    amber: "border-amber-500/10 bg-gradient-to-br from-amber-500/[0.04] to-[#0a0e17]",
    blue: "border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.04] to-[#0a0e17]",
  };

  const surfaceStyles: Record<SurfaceVariant, string> = {
    default: "",
    raised: "bg-[#0f1420]",
    overlay: "bg-[#141a28]",
    muted: "bg-[#0a0e17]/50 border-white/[0.04]",
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${accentStyles[accent]} ${surfaceStyles[surface]} ${noPadding ? "" : "p-4 sm:p-5"} ${interactive ? "cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.02] active:scale-[0.995]" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "profit" | "loss";

export function AppButton({ children, className = "", variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_2px_12px_rgba(34,211,238,0.25)] hover:from-cyan-400 hover:to-cyan-500",
    secondary: "border border-white/[0.08] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:border-white/[0.12]",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]",
    danger: "border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    profit: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_2px_12px_rgba(16,185,129,0.25)] hover:from-emerald-400 hover:to-emerald-500",
    loss: "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_2px_12px_rgba(244,63,94,0.25)] hover:from-rose-400 hover:to-rose-500",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function AppLinkButton({ children, href, className = "", variant = "primary" }: { children: ReactNode; href: string; className?: string; variant?: ButtonVariant }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_2px_12px_rgba(34,211,238,0.25)] hover:from-cyan-400 hover:to-cyan-500",
    secondary: "border border-white/[0.08] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:border-white/[0.12]",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]",
    danger: "border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    profit: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_2px_12px_rgba(16,185,129,0.25)] hover:from-emerald-400 hover:to-emerald-500",
    loss: "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_2px_12px_rgba(244,63,94,0.25)] hover:from-rose-400 hover:to-rose-500",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function AppInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/30 focus:bg-white/[0.06] placeholder:text-slate-500 ${className}`} {...props} />;
}

export function AppSelect({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/30 focus:bg-white/[0.06] ${className}`} {...props} />;
}

export function AppTextarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/30 focus:bg-white/[0.06] placeholder:text-slate-500 ${className}`} {...props} />;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 pb-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </header>
  );
}

export function SectionHeader({ title, icon, accent = "cyan" }: { title: string; icon?: ReactNode; accent?: "cyan" | "emerald" | "rose" | "violet" | "amber" | "blue" }) {
  const accentColors: Record<string, string> = {
    cyan: "text-cyan-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
    blue: "text-indigo-400",
  };
  return (
    <div className="flex items-center gap-2 pb-1">
      {icon ? <span className={accentColors[accent]}>{icon}</span> : null}
      <h2 className={`text-xs font-semibold uppercase tracking-wider ${accentColors[accent]}`}>{title}</h2>
    </div>
  );
}

export function MetricTile({ label, value, accent = "default", icon, large, className = "" }: { label: string; value: string; accent?: "default" | "profit" | "loss" | "cyan" | "violet" | "amber" | "blue"; icon?: ReactNode; large?: boolean; className?: string }) {
  const valueColors: Record<string, string> = {
    default: "text-white",
    profit: "text-emerald-400",
    loss: "text-rose-400",
    cyan: "text-cyan-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
    blue: "text-indigo-400",
  };

  const iconBg: Record<string, string> = {
    default: "bg-white/[0.06] text-slate-400",
    profit: "bg-emerald-500/10 text-emerald-400",
    loss: "bg-rose-500/10 text-rose-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
    violet: "bg-violet-500/10 text-violet-400",
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-indigo-500/10 text-indigo-400",
  };

  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4 transition-all duration-200 hover:bg-white/[0.04] ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 truncate">{label}</p>
          <p className={`mt-1 font-semibold tracking-tight ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"} ${valueColors[accent]}`}>{value}</p>
        </div>
        {icon ? (
          <div className={`flex-shrink-0 rounded-lg p-1.5 ${iconBg[accent]}`}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function HeroMetric({ label, value, accent = "profit", icon, subtitle }: { label: string; value: string; accent?: "profit" | "loss" | "cyan" | "violet" | "amber"; icon?: ReactNode; subtitle?: string }) {
  const accents: Record<string, { bg: string; border: string; value: string; icon: string; glow: string }> = {
    profit: { bg: "from-emerald-500/[0.08] to-transparent", border: "border-emerald-500/15", value: "text-emerald-400", icon: "bg-emerald-500/10 text-emerald-400", glow: "shadow-[0_0_40px_rgba(16,185,129,0.08)]" },
    loss: { bg: "from-rose-500/[0.08] to-transparent", border: "border-rose-500/15", value: "text-rose-400", icon: "bg-rose-500/10 text-rose-400", glow: "shadow-[0_0_40px_rgba(244,63,94,0.08)]" },
    cyan: { bg: "from-cyan-500/[0.08] to-transparent", border: "border-cyan-500/15", value: "text-cyan-400", icon: "bg-cyan-500/10 text-cyan-400", glow: "shadow-[0_0_40px_rgba(34,211,238,0.08)]" },
    violet: { bg: "from-violet-500/[0.08] to-transparent", border: "border-violet-500/15", value: "text-violet-400", icon: "bg-violet-500/10 text-violet-400", glow: "shadow-[0_0_40px_rgba(139,92,246,0.08)]" },
    amber: { bg: "from-amber-500/[0.08] to-transparent", border: "border-amber-500/15", value: "text-amber-400", icon: "bg-amber-500/10 text-amber-400", glow: "shadow-[0_0_40px_rgba(245,158,11,0.08)]" },
  };

  const a = accents[accent];

  return (
    <div className={`rounded-2xl border ${a.border} bg-gradient-to-br ${a.bg} p-4 sm:p-5 ${a.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className={`mt-2 text-3xl sm:text-4xl font-bold tracking-tight ${a.value}`}>{value}</p>
          {subtitle ? <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {icon ? (
          <div className={`rounded-xl p-2.5 ${a.icon}`}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProgressBar({ value, className = "", trackClassName = "bg-white/[0.06]", barClassName = "from-cyan-500 to-cyan-400" }: { value: number; className?: string; trackClassName?: string; barClassName?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${barClassName} transition-all duration-700 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`min-h-screen text-slate-100 ${className}`}>{children}</main>;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 ${className}`}>
      <div className="h-3 w-24 rounded-full bg-white/[0.06]" />
      <div className="mt-3 h-6 w-32 rounded-full bg-white/[0.06]" />
      <div className="mt-2 h-3 w-40 rounded-full bg-white/[0.04]" />
    </div>
  );
}

export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-200">
      <ArrowLeft size={14} />
      Back
    </Link>
  );
}

export function FormField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      <span className="font-medium text-slate-300">{label}</span>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </label>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
        <CheckCircle2 size={20} />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

type TabId = "dashboard" | "add" | "history" | "analytics" | "goals" | "financial" | "settings";

type NavTab = {
  id: TabId;
  label: string;
  icon: typeof HomeIcon;
  href: string;
};

const navTabs: NavTab[] = [
  { id: "dashboard", label: "Home", icon: HomeIcon, href: "/" },
  { id: "add", label: "Add", icon: PlusCircle, href: "/add" },
  { id: "history", label: "History", icon: History, href: "/history" },
  { id: "analytics", label: "Stats", icon: BarChart3, href: "/analytics" },
  { id: "goals", label: "Goals", icon: Target, href: "/goals" },
  { id: "financial", label: "Finance", icon: WalletCards, href: "/financial" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export function BottomNavigation({ activeTab }: { activeTab: TabId }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.06] bg-[#050810]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5 sm:px-4">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isAdd = tab.id === "add";

          if (isAdd) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative -mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-[0_4px_20px_rgba(34,211,238,0.3)] transition active:scale-95"
              >
                <PlusCircle size={22} />
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? "text-cyan-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" />
                )}
              </div>
              <span className="mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ activeTab, children, maxWidth = "max-w-5xl" }: { activeTab: TabId; children: ReactNode; maxWidth?: string }) {
  return (
    <PageShell>
      <div className={`mx-auto flex min-h-screen ${maxWidth} flex-col px-4 py-5 pb-28 sm:px-6 sm:pb-28 lg:px-8`}>
        {children}
      </div>
      <BottomNavigation activeTab={activeTab} />
    </PageShell>
  );
}

export function SettingsRow({ icon, label, value, onClick }: { icon: ReactNode; label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-left transition hover:bg-white/[0.05] active:scale-[0.99]"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-slate-400">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-slate-200">{label}</span>
      {value ? <span className="text-sm text-slate-400">{value}</span> : null}
      <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
    </button>
  );
}
