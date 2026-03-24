import { html } from "../lib.js";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiDatabase,
  FiGift,
  FiGlobe,
  FiImage,
  FiLayers,
  FiLink2,
  FiLock,
  FiShield,
  FiSmartphone,
  FiTrendingUp,
  FiUser,
  FaBitcoin,
  FaEthereum,
  FaStar
} from "./icons.js";
import { MiniMarketChart } from "./charts.js";

function classJoin(...chunks) {
  return chunks.filter(Boolean).join(" ");
}

export function BrandLogo({ compact = false }) {
  return html`
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric/55 via-blue-500/30 to-transparent ring-1 ring-blue-300/40">
        <${FiBarChart2} className="h-4 w-4 text-sky-200" />
      </div>
      <span className=${classJoin("font-semibold tracking-wide text-slate-100", compact ? "text-base" : "text-2xl")}>
        Nextrade
      </span>
    </div>
  `;
}

export function TopNav({ links, urls, primaryLabel, primaryHref, user, onPrimaryClick, hideLinks = false }) {
  return html`
    <header className="relative z-10 flex items-center justify-between gap-4 border-b border-blue-300/20 px-4 py-3 md:px-5">
      <${BrandLogo} compact=${true} />

      <nav className=${classJoin("items-center gap-4 text-[11px] text-slate-200/80 xl:text-xs", hideLinks ? "hidden" : "hidden lg:flex")}>
        ${links.map(
          (link) => html`
            <a key=${link.label} href=${urls[link.key]} className="nx-link">
              ${link.label}
            </a>
          `
        )}
      </nav>

      <div className="flex items-center gap-2">
        ${
          user?.isAuthenticated
            ? html`<a href=${urls.logout} className="rounded-full border border-slate-400/30 px-3 py-1.5 text-[11px] text-slate-100 hover:border-sky-300/45">Logout</a>`
            : html`<a href=${urls.login} className="rounded-full border border-slate-400/30 px-3 py-1.5 text-[11px] text-slate-100 hover:border-sky-300/45">Login</a>`
        }
        <a
          href=${primaryHref}
          className="nx-cta rounded-full bg-electric px-3 py-1.5 text-[11px] font-semibold text-white shadow-glowBlue"
          onClick=${onPrimaryClick}
        >
          ${primaryLabel}
        </a>
      </div>
    </header>
  `;
}

function CategoryIcon({ type }) {
  if (type === "crypto") {
    return html`
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/85 text-white shadow-glowBlue">
          <${FaBitcoin} className="h-5 w-5" />
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/70 text-white shadow-glowBlue">
          <${FaEthereum} className="h-5 w-5" />
        </span>
      </div>
    `;
  }

  if (type === "points") {
    return html`
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-growth/80 text-white shadow-glowGreen">
          <${FiGift} className="h-5 w-5" />
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/75 text-white">
          <${FiSmartphone} className="h-5 w-5" />
        </span>
      </div>
    `;
  }

  return html`
    <div className="flex items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500/55 text-cyan-100 shadow-glowBlue">
        <${FiImage} className="h-5 w-5" />
      </span>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-nft/65 text-violet-100 shadow-glowPurple">
        <${FiLayers} className="h-5 w-5" />
      </span>
    </div>
  `;
}

export function AssetCategories({ categories }) {
  return html`
    <section className="nx-glass grid gap-3 p-3 md:grid-cols-3 md:p-4">
      ${categories.map(
        (item) => html`
          <article key=${item.id} className="rounded-xl border border-blue-300/20 bg-slate-950/30 p-3">
            <${CategoryIcon} type=${item.type} />
            <h3 className="mt-3 text-xs font-semibold tracking-wide text-white">${item.title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed nx-subtle-text">${item.subtitle}</p>
          </article>
        `
      )}
    </section>
  `;
}

function MarketCoin({ symbol }) {
  if (symbol === "BTC") {
    return html`<span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">B</span>`;
  }
  if (symbol === "ETH") {
    return html`<span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-950">E</span>`;
  }
  return html`<span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">P</span>`;
}

export function LiveMarket({ assets, title = "Live Market Data", compact = false }) {
  return html`
    <section className="nx-glass p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-medium text-slate-100/90 md:text-sm">${title}</h3>
        <${FiActivity} className="h-4 w-4 text-slate-300/70" />
      </div>

      <div className=${classJoin("grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-3")}>
        ${assets.map(
          (asset) => html`
            <article key=${asset.symbol} className="nx-live-card p-3">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <${MarketCoin} symbol=${asset.symbol} />
                  <div>
                    <p className="text-xs font-semibold">${asset.symbol}</p>
                    <p className="text-[10px] text-slate-300/65">${asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className=${classJoin("text-xs font-semibold", asset.trend === "up" ? "text-growth" : "text-rose-400")}>
                    ${asset.value}
                  </p>
                  <p className=${classJoin("text-[10px]", asset.trend === "up" ? "text-growth/90" : "text-rose-300")}>
                    ${asset.percent}
                  </p>
                </div>
              </div>
              <${MiniMarketChart}
                points=${asset.linePoints}
                candles=${asset.candles}
                color=${asset.color}
                id=${asset.symbol}
              />
            </article>
          `
        )}
      </div>
    </section>
  `;
}

function StepIcon({ stepKey }) {
  if (stepKey === "account") return html`<${FiUser} className="h-5 w-5 text-sky-300" />`;
  if (stepKey === "link") return html`<${FiLink2} className="h-5 w-5 text-cyan-300" />`;
  if (stepKey === "trade") return html`<${FiTrendingUp} className="h-5 w-5 text-growth" />`;
  return html`<${FiDatabase} className="h-5 w-5 text-violet-300" />`;
}

export function HowItWorks({ steps, alignCenter = true }) {
  return html`
    <section className="mt-8">
      <h2 className=${classJoin("mb-4 text-3xl font-semibold", alignCenter ? "text-center" : "")}>How It Works</h2>
      <div className="grid gap-3 md:grid-cols-4">
        ${steps.map(
          (step) => html`
            <article key=${step.number} className="nx-glass rounded-2xl p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/35 text-xs font-bold text-sky-100">
                  ${step.number}
                </span>
                <${StepIcon} stepKey=${step.key} />
              </div>
              <h3 className="text-xs font-semibold tracking-wide text-white">${step.title}</h3>
              <p className="mt-2 text-[10px] leading-relaxed nx-subtle-text">${step.description}</p>
            </article>
          `
        )}
      </div>
    </section>
  `;
}

export function Testimonials({ items }) {
  return html`
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-3xl font-semibold">Testimonials</h3>
        <span className="rounded-full border border-blue-300/25 px-2 py-1 text-[10px] text-slate-300">1 / 3</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        ${items.map(
          (item) => html`
            <article key=${item.name} className="nx-glass rounded-2xl p-4">
              <div className="mb-2 flex text-amber-300">
                <${FaStar} className="mr-1 h-4 w-4" />
                <${FaStar} className="mr-1 h-4 w-4" />
                <${FaStar} className="mr-1 h-4 w-4" />
                <${FaStar} className="mr-1 h-4 w-4" />
                <${FaStar} className="h-4 w-4" />
              </div>
              <p className="text-[11px] leading-relaxed nx-subtle-text">${item.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/25 text-sky-100">
                  <${FiUser} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-medium">${item.name}</p>
                  <p className="text-[10px] text-slate-300/60">${item.role}</p>
                </div>
              </div>
            </article>
          `
        )}
      </div>
    </section>
  `;
}

export function SecurityTrust() {
  return html`
    <section className="mt-8 rounded-2xl border border-growth/30 bg-gradient-to-r from-emerald-900/35 via-emerald-500/15 to-cyan-500/10 p-4 md:p-6">
      <h3 className="text-center text-3xl font-semibold">Security and Trust</h3>
      <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-emerald-100/80">
        Nextrade is committed to secure cross-product exchange with layered safeguards, compliance, and transparent auditing.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-emerald-300/25 bg-slate-950/25 p-3">
          <div className="flex items-center gap-2">
            <${FiShield} className="h-4 w-4 text-growth" />
            <p className="text-sm font-semibold text-slate-100">Secure Transactions</p>
          </div>
          <p className="mt-1 text-xs text-emerald-100/80">End-to-end encrypted trades, wallet signatures, and anti-fraud controls.</p>
        </article>
        <article className="rounded-xl border border-emerald-300/25 bg-slate-950/25 p-3">
          <div className="flex items-center gap-2">
            <${FiLock} className="h-4 w-4 text-growth" />
            <p className="text-sm font-semibold text-slate-100">Asset Protection</p>
          </div>
          <p className="mt-1 text-xs text-emerald-100/80">Cold-storage segregation, role controls, and insurance-backed coverage.</p>
        </article>
      </div>
    </section>
  `;
}

export function FooterBlock({ columns }) {
  return html`
    <footer className="relative mt-8 border-t border-blue-300/20 pt-6">
      <div className="grid gap-6 md:grid-cols-4">
        <div>
          <${BrandLogo} compact=${true} />
          <p className="mt-2 text-[11px] leading-relaxed text-slate-300/70">
            Your gateway to secure and connected digital asset trading.
          </p>
          <div className="mt-3 flex gap-2 text-slate-300/75">
            <${FiGlobe} className="h-4 w-4" />
            <${FiShield} className="h-4 w-4" />
            <${FiActivity} className="h-4 w-4" />
          </div>
        </div>

        ${columns.map(
          (column) => html`
            <div key=${column.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-100">${column.title}</h4>
              <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300/75">
                ${column.links.map((link) => html`<li key=${link}>${link}</li>`)}
              </ul>
            </div>
          `
        )}
      </div>

      <p className="mt-6 border-t border-blue-300/15 pt-3 text-[10px] text-slate-300/55">
        Copyright 2026 Nextrade. All rights reserved.
      </p>
      <div className="nx-footer-star" aria-hidden="true"></div>
    </footer>
  `;
}

export function HeroContent({ headline, onAction, actionLabel, ctaFeedback }) {
  return html`
    <section className="relative overflow-hidden px-6 pb-7 pt-10 text-center md:px-10">
      <div className="nx-hero-network">
        <svg className="h-full w-full" viewBox="0 0 800 380" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="networkGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur"></feGaussianBlur>
              <feMerge>
                <feMergeNode in="blur"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
          </defs>
          <g stroke="rgba(120,213,255,0.45)" strokeWidth="1" filter="url(#networkGlow)">
            <line x1="60" y1="70" x2="180" y2="120"></line>
            <line x1="180" y1="120" x2="250" y2="80"></line>
            <line x1="250" y1="80" x2="390" y2="130"></line>
            <line x1="390" y1="130" x2="530" y2="90"></line>
            <line x1="530" y1="90" x2="700" y2="160"></line>
            <line x1="700" y1="160" x2="645" y2="250"></line>
            <line x1="645" y1="250" x2="500" y2="220"></line>
            <line x1="500" y1="220" x2="370" y2="270"></line>
          </g>
          <g fill="rgba(137, 234, 255, 0.95)">
            <circle cx="60" cy="70" r="3"></circle>
            <circle cx="180" cy="120" r="3"></circle>
            <circle cx="250" cy="80" r="3"></circle>
            <circle cx="390" cy="130" r="4"></circle>
            <circle cx="530" cy="90" r="3"></circle>
            <circle cx="700" cy="160" r="4"></circle>
            <circle cx="645" cy="250" r="3"></circle>
            <circle cx="500" cy="220" r="3"></circle>
            <circle cx="370" cy="270" r="2.6"></circle>
          </g>
        </svg>
      </div>

      <h1 className="relative z-10 mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
        ${headline}
      </h1>
      <p className="relative z-10 mx-auto mt-4 max-w-2xl text-sm nx-subtle-text md:text-base">
        Nextrade is your all-in-one platform to buy, sell, and manage diverse digital assets. Effortless. Secure. Connected.
      </p>
      <button
        type="button"
        className="nx-cta relative z-10 mt-6 rounded-full bg-electric px-6 py-2 text-sm font-semibold text-white shadow-glowBlue"
        onClick=${onAction}
      >
        ${actionLabel}
      </button>
      ${
        ctaFeedback
          ? html`<p className="relative z-10 mt-3 text-xs text-sky-200/90">${ctaFeedback}</p>`
          : null
      }
    </section>
  `;
}

export function LeftHeroHighlight({ title, description, buttonLabel, onClick }) {
  return html`
    <article className="nx-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-slate-100">
        <${BrandLogo} compact=${true} />
      </div>
      <h3 className="mt-5 max-w-xs text-3xl font-semibold leading-tight">${title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed nx-subtle-text">${description}</p>
      <button
        type="button"
        className="nx-cta mt-4 inline-flex items-center gap-2 rounded-full bg-electric px-4 py-2 text-xs font-semibold"
        onClick=${onClick}
      >
        ${buttonLabel}
        <${FiArrowRight} className="h-3.5 w-3.5" />
      </button>
    </article>
  `;
}
