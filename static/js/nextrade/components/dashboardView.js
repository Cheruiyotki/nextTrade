import { html, useEffect, useState } from "../lib.js";
import { navLinks } from "../data.js";
import { TopNav } from "./sections.js";
import { DashboardHeader } from "./dashboardHeader.js";

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function HoldingCard({ holding }) {
  return html`
    <article className="nx-glass rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">${holding.symbol}</p>
          <p className="text-xs text-slate-300/70">${holding.name}</p>
        </div>
        <span className="rounded-full border border-slate-400/20 px-2 py-1 text-[10px] text-slate-200">
          Qty ${Number(holding.quantity || 0).toFixed(4)}
        </span>
      </div>
      <div className="mt-3 space-y-1 text-xs text-slate-300/90">
        <p>Unit: ${currency(holding.price)}</p>
        <p className="text-sm font-semibold text-sky-200">Value: ${currency(holding.total_value)}</p>
      </div>
    </article>
  `;
}

function QuickTradeSidebar({ assets, formState, onChange, onSubmit, status, isSubmitting }) {
  return html`
    <aside className="nx-glass rounded-2xl p-4 md:p-5">
      <h3 className="text-lg font-semibold text-white">Quick Trade</h3>
      <p className="mt-1 text-xs text-slate-300/70">Buy assets instantly using your wallet balance.</p>

      <form className="mt-4 grid gap-3" onSubmit=${onSubmit}>
        <label className="text-xs text-slate-300">
          Asset
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 p-2 text-sm text-white"
            value=${formState.assetId}
            onChange=${(event) => onChange("assetId", event.target.value)}
            required
          >
            <option value="">Select asset</option>
            ${assets.map(
              (asset) => html`
                <option key=${asset.id} value=${String(asset.id)}>
                  ${asset.symbol} - ${asset.name} (${currency(asset.price)})
                </option>
              `
            )}
          </select>
        </label>

        <label className="text-xs text-slate-300">
          Quantity
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 p-2 text-sm text-white"
            value=${formState.quantity}
            onInput=${(event) => onChange("quantity", event.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          disabled=${isSubmitting}
          className="rounded-full bg-electric px-4 py-2 text-xs font-semibold text-white shadow-glowBlue disabled:opacity-60"
        >
          ${isSubmitting ? "Executing..." : "Buy Asset"}
        </button>
      </form>

      ${
        status
          ? html`<p className="mt-3 text-xs text-slate-200">${status}</p>`
          : null
      }
    </aside>
  `;
}

export function AuthenticatedDashboardView({ config }) {
  const [holdings, setHoldings] = useState([]);
  const [marketAssets, setMarketAssets] = useState([]);
  const [summary, setSummary] = useState({
    netWorth: 0,
    availableCash: 0,
    change24h: 0,
    live: true,
  });
  const [tradeForm, setTradeForm] = useState({ assetId: "", quantity: "" });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      const [holdingsResponse, summaryResponse, marketResponse] = await Promise.all([
        fetch(config.api.userAssets),
        fetch(config.api.dashboardSummary),
        fetch(config.api.marketAssets),
      ]);

      if (!holdingsResponse.ok || !summaryResponse.ok || !marketResponse.ok) {
        throw new Error(
          holdingsResponse.status === 401 || summaryResponse.status === 401 || marketResponse.status === 401
            ? "Session expired. Please log in again."
            : "Failed to load dashboard data."
        );
      }

      const holdingsData = await holdingsResponse.json();
      const summaryData = await summaryResponse.json();
      const marketData = await marketResponse.json();

      setHoldings(Array.isArray(holdingsData) ? holdingsData : []);
      setMarketAssets(Array.isArray(marketData) ? marketData : []);
      setSummary({
        netWorth: Number(summaryData.net_worth || 0),
        availableCash: Number(summaryData.balance || 0),
        change24h: Number(summaryData.change_24h_pct || 0),
        live: Boolean(summaryData.live),
      });
    } catch (error) {
      setStatus(error.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function submitQuickTrade(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch(config.api.buyAsset, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: Number(tradeForm.assetId),
          quantity: Number(tradeForm.quantity),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.message || "Trade failed.");
      }

      setStatus(data.message || "Trade completed.");
      setTradeForm((current) => ({ ...current, quantity: "" }));
      await loadDashboardData();
    } catch (error) {
      setStatus(error.message || "Trade failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateTradeForm(key, value) {
    setTradeForm((current) => ({ ...current, [key]: value }));
  }

  return html`
    <main className="relative min-h-screen overflow-hidden px-3 py-5 sm:px-5 lg:px-8 lg:py-7">
      <div className="pointer-events-none absolute inset-0 nx-grid-noise"></div>

      <section className="nx-panel relative mx-auto max-w-[1400px] overflow-hidden">
        <${TopNav}
          links=${navLinks}
          urls=${config.urls}
          user=${config.user}
          primaryLabel="Portfolio"
          primaryHref=${config.urls.portfolio}
          hideLinks=${false}
        />

        <div className="space-y-5 p-4 md:p-6">
          <${DashboardHeader}
            stats=${{
              netWorth: summary.netWorth,
              availableCash: summary.availableCash,
              change24h: summary.change24h,
              live: summary.live,
            }}
          />

          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Your Holdings</h2>
                <a href=${config.urls.explore} className="text-xs text-sky-200 underline underline-offset-2">Explore market</a>
              </div>

              ${
                isLoading
                  ? html`<p className="text-sm text-slate-300/75">Loading holdings...</p>`
                  : holdings.length
                    ? html`
                        <div className="grid gap-3 md:grid-cols-2">
                          ${holdings.map((holding) => html`<${HoldingCard} key=${holding.asset_id} holding=${holding} />`)}
                        </div>
                      `
                    : html`<p className="text-sm text-slate-300/75">No holdings yet. Use Quick Trade to buy your first asset.</p>`
              }
            </section>

            <${QuickTradeSidebar}
              assets=${marketAssets}
              formState=${tradeForm}
              onChange=${updateTradeForm}
              onSubmit=${submitQuickTrade}
              status=${status}
              isSubmitting=${isSubmitting}
            />
          </div>
        </div>
      </section>
    </main>
  `;
}
