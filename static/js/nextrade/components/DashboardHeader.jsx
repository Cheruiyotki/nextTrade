import React from "react";

export const mockDashboardStats = {
  netWorth: 12452.31,
  availableCash: 8764.1,
  change24h: 2.17,
  live: true,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function DashboardHeader({ stats = mockDashboardStats }) {
  const isPositive = Number(stats.change24h || 0) >= 0;

  return (
    <section className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 rounded-2xl p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{stats.live ? "Live market connected" : "Feed paused"}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-slate-900/45 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Net Worth</p>
          <p
            className="mt-1 text-3xl font-semibold text-white font-mono"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            {currency.format(stats.netWorth || 0)}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-slate-900/45 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Available Cash</p>
          <p
            className="mt-1 text-xl font-semibold text-sky-200 font-mono"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            {currency.format(stats.availableCash || 0)}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-slate-900/45 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">24h Change</p>
          <p className={`mt-1 text-xl font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "?" : "?"} {Math.abs(Number(stats.change24h || 0)).toFixed(2)}%
          </p>
        </article>
      </div>
    </section>
  );
}

export function DashboardHeaderMockPreview() {
  return <DashboardHeader stats={mockDashboardStats} />;
}
