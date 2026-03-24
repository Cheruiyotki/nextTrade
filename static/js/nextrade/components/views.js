import { html, useMemo, useState } from "../lib.js";
import {
  assetCategories,
  footerColumns,
  leftPanelHighlights,
  marketAssets,
  navLinks,
  testimonials,
  workflowSteps
} from "../data.js";
import {
  AssetCategories,
  FooterBlock,
  HeroContent,
  HowItWorks,
  LeftHeroHighlight,
  LiveMarket,
  SecurityTrust,
  TopNav,
  Testimonials
} from "./sections.js";
import { MiniMarketChart } from "./charts.js";
import { FiChevronDown, FiTrendingUp } from "./icons.js";

function LiveMarketBrief({ assets }) {
  return html`
    <div className="nx-glass mt-4 rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-100">
        <span>Live Market</span>
        <${FiChevronDown} className="h-4 w-4 text-slate-300/70" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        ${assets.slice(0, 2).map(
          (asset) => html`
            <article key=${asset.symbol} className="rounded-lg border border-blue-300/20 bg-slate-900/45 p-2.5">
              <p className="text-xs font-semibold text-slate-100">${asset.symbol}</p>
              <p className="text-[10px] text-slate-300/60">${asset.name}</p>
              <p className=${`mt-1 text-xs font-semibold ${asset.trend === "up" ? "text-growth" : "text-rose-300"}`}>
                ${asset.value}
              </p>
              <p className=${`text-[10px] ${asset.trend === "up" ? "text-growth/85" : "text-rose-300/85"}`}>
                ${asset.percent}
              </p>
            </article>
          `
        )}
      </div>
    </div>
  `;
}

function SidebarGrowthWidget({ asset, actionHref, onAction }) {
  return html`
    <article className="nx-glass mt-4 grid gap-3 rounded-2xl p-4 md:grid-cols-[1.1fr_1.2fr] md:items-center">
      <div>
        <h3 className="max-w-[180px] text-xl font-semibold leading-tight text-white">
          TRADE EVERYTHING. CRYPTO, POINTS, NFTS.
        </h3>
        <p className="mt-2 text-xs leading-relaxed nx-subtle-text">
          Nurture a portfolio in one platform to buy, sell, and manage diverse digital assets.
        </p>
        <a
          href=${actionHref}
          className="nx-cta mt-4 rounded-full bg-electric px-4 py-2 text-xs font-semibold text-white"
          onClick=${onAction}
        >
          Get Started Now
        </a>
      </div>
      <div className="rounded-xl border border-blue-300/25 bg-slate-900/40 p-2">
        <${MiniMarketChart}
          points=${asset.linePoints}
          candles=${asset.candles}
          color=${asset.color}
          id=${`sidebar-${asset.symbol}`}
        />
      </div>
    </article>
  `;
}

export function LeftSidebarView({ config }) {
  const [registerCount, setRegisterCount] = useState(0);
  const [widgetClicks, setWidgetClicks] = useState(0);
  const status = registerCount > 0 ? `Registration intent captured ${registerCount}x` : "Awaiting registration";

  return html`
    <section className="nx-panel min-h-full p-0">
      <${TopNav}
        links=${navLinks.slice(0, 3)}
        urls=${config.urls}
        user=${config.user}
        primaryLabel="Get Started Free"
        primaryHref=${config.urls.register}
        hideLinks=${true}
        onPrimaryClick=${() => setRegisterCount((current) => current + 1)}
      />

      <div className="p-4 md:p-5">
        <${LeftHeroHighlight}
          title=${leftPanelHighlights[0].title}
          description=${leftPanelHighlights[0].description}
          buttonLabel=${leftPanelHighlights[0].button}
          buttonHref=${config.urls.register}
          onClick=${() => setRegisterCount((current) => current + 1)}
        />

        <article className="nx-glass mt-4 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-semibold text-white">Trade & Option.</h3>
            <span className="rounded-full bg-growth/20 p-2 text-growth">
              <${FiTrendingUp} className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-xs nx-subtle-text">
            ${leftPanelHighlights[1].description}
          </p>
          <a
            href=${config.urls.register}
            className="nx-cta mt-4 rounded-full bg-electric px-4 py-2 text-xs font-semibold text-white"
            onClick=${() => setWidgetClicks((current) => current + 1)}
          >
            ${leftPanelHighlights[1].button}
          </a>
        </article>

        <${LiveMarketBrief} assets=${marketAssets} />
        <${SidebarGrowthWidget}
          asset=${marketAssets[1]}
          actionHref=${config.urls.register}
          onAction=${() => setWidgetClicks((current) => current + 1)}
        />

        <div className="mt-5 flex items-center justify-between">
          <h3 className="text-3xl font-semibold">Testimonials</h3>
          <span className="nx-status-pill">${status}</span>
        </div>
        ${
          widgetClicks > 0
            ? html`<p className="mt-2 text-xs text-sky-200/80">Action tracker: ${widgetClicks} onboarding interactions</p>`
            : null
        }
      </div>
    </section>
  `;
}

export function CenterHeroView({ config }) {
  const [ctaClicks, setCtaClicks] = useState(0);
  const ctaMessage = ctaClicks > 0 ? `Great. Setup started (${ctaClicks})` : "";

  return html`
    <section className="nx-panel min-h-full p-0">
      <${TopNav}
        links=${navLinks}
        urls=${config.urls}
        user=${config.user}
        primaryLabel="Get Started Free"
        primaryHref=${config.urls.register}
        onPrimaryClick=${() => setCtaClicks((current) => current + 1)}
      />

      <${HeroContent}
        headline="TRADE EVERYTHING. CRYPTO, POINTS, NFTS."
        actionLabel="Get Started Now"
        actionHref=${config.urls.register}
        ctaFeedback=${ctaMessage}
        onAction=${() => setCtaClicks((current) => current + 1)}
      />

      <div className="space-y-5 px-4 pb-6 md:px-6 md:pb-8">
        <${AssetCategories} categories=${assetCategories} />
        <${LiveMarket} assets=${marketAssets} />
        <${HowItWorks} steps=${workflowSteps} />
      </div>
    </section>
  `;
}

export function RightWorkflowView({ config }) {
  const [freeTrials, setFreeTrials] = useState(0);
  const ctaLabel = freeTrials > 0 ? `Trial Requested (${freeTrials})` : "Get Started Free";

  const denseLinks = useMemo(() => navLinks.slice(1), []);

  return html`
    <section className="nx-panel min-h-full p-0">
      <${TopNav}
        links=${denseLinks}
        urls=${config.urls}
        user=${config.user}
        primaryLabel=${ctaLabel}
        primaryHref=${config.urls.register}
        onPrimaryClick=${() => setFreeTrials((current) => current + 1)}
      />

      <div className="px-4 pb-6 pt-5 md:px-6 md:pb-8">
        <div className="mb-4 flex justify-center">
          <a
            href=${config.urls.register}
            className="nx-cta rounded-full bg-electric px-5 py-2 text-xs font-semibold text-white"
            onClick=${() => setFreeTrials((current) => current + 1)}
          >
            Get Started Free
          </a>
        </div>

        <${LiveMarket} assets=${marketAssets} compact=${false} title="Live Market Data" />
        <${HowItWorks} steps=${workflowSteps} />
        <${Testimonials} items=${testimonials} />
        <${SecurityTrust} />
        <${FooterBlock} columns=${footerColumns} />
      </div>
    </section>
  `;
}
