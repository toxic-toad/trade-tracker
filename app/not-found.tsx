import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "#050810" }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-slate-400 mb-6 text-sm">Page not found</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_2px_12px_rgba(34,211,238,0.25)] transition hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.97]"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
