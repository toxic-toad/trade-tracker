"use client";

import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  accent?: "default" | "cyan" | "emerald";
  interactive?: boolean;
  onClick?: () => void;
};

export function AppCard({ children, className = "", accent = "default", interactive = false, onClick }: CardProps) {
  const accentClasses = {
    default: "border-slate-800/90 bg-slate-950/70 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_60px_rgba(2,6,23,0.35)]",
    cyan: "border-cyan-500/20 bg-gradient-to-br from-cyan-500/12 via-slate-950/70 to-slate-950/80 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_20px_70px_rgba(2,6,23,0.35)]",
    emerald: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 via-slate-950/70 to-slate-950/80 shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_20px_70px_rgba(2,6,23,0.35)]",
  };

  return (
    <div
      className={`rounded-[24px] border p-4 backdrop-blur-xl transition-all duration-300 ${accentClasses[accent]} ${interactive ? "cursor-pointer hover:-translate-y-0.5 hover:border-cyan-400/40" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function AppButton({ children, className = "", variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_12px_35px_rgba(34,211,238,0.25)] hover:from-cyan-400 hover:to-blue-500",
    secondary: "border border-slate-700 bg-slate-900/70 text-slate-200 hover:border-cyan-400/30 hover:bg-slate-800",
    ghost: "bg-white/5 text-slate-300 hover:bg-white/10",
    danger: "border border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function AppLinkButton({ children, href, className = "", variant = "primary" }: { children: ReactNode; href: string; className?: string; variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_12px_35px_rgba(34,211,238,0.25)] hover:from-cyan-400 hover:to-blue-500",
    secondary: "border border-slate-700 bg-slate-900/70 text-slate-200 hover:border-cyan-400/30 hover:bg-slate-800",
    ghost: "bg-white/5 text-slate-300 hover:bg-white/10",
    danger: "border border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function AppInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full rounded-2xl border border-slate-800/90 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400/40 focus:bg-slate-900 ${className}`} {...props} />;
}

export function AppSelect({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full rounded-2xl border border-slate-800/90 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:bg-slate-900 ${className}`} {...props} />;
}

export function AppTextarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`w-full rounded-2xl border border-slate-800/90 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:bg-slate-900 ${className}`} {...props} />;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <header className="rounded-[30px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(7,18,38,0.95))] p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-400">
            <Sparkles size={14} />
            <span>{eyebrow}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {action}
      </div>
    </header>
  );
}

export function StatCard({ label, value, subtitle, valueClassName = "text-white", icon }: { label: string; value: string; subtitle?: string; valueClassName?: string; icon?: ReactNode }) {
  return (
    <AppCard accent="default" className="animate-[fadeIn_360ms_ease-out]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${valueClassName}`}>{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {icon ? <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300">{icon}</div> : null}
      </div>
    </AppCard>
  );
}

export function ProgressBar({ value, className = "", trackClassName = "bg-slate-900/80", barClassName = "from-cyan-500 to-blue-600" }: { value: number; className?: string; trackClassName?: string; barClassName?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full ${trackClassName} ${className}`}>
      <div className={`h-full rounded-full bg-gradient-to-r ${barClassName} transition-all duration-700 ease-out`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`min-h-screen bg-[#000000] text-slate-100 ${className}`}>{children}</main>;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[24px] border border-slate-800/90 bg-slate-950/70 p-4 ${className}`} />;
}

export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-slate-800">
      <ArrowLeft size={16} />
      Back
    </Link>
  );
}

export function FormField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span className="font-medium text-slate-200">{label}</span>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </label>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <AppCard accent="cyan" className="text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
        <CheckCircle2 size={18} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </AppCard>
  );
}
