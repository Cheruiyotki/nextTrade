import { html } from "../lib.js";

const SVG_WIDTH = 250;
const SVG_HEIGHT = 96;

function normalizePoints(points) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const spread = Math.max(1, max - min);

  return points.map((value, index) => {
    const x = (index / (points.length - 1 || 1)) * (SVG_WIDTH - 18) + 9;
    const y = SVG_HEIGHT - ((value - min) / spread) * (SVG_HEIGHT - 18) - 8;
    return { x, y };
  });
}

function pointsToPolyline(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function pointsToArea(points) {
  if (!points.length) {
    return "";
  }

  const start = `M ${points[0].x.toFixed(2)} ${SVG_HEIGHT - 4}`;
  const line = points
    .map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const end = `L ${points[points.length - 1].x.toFixed(2)} ${SVG_HEIGHT - 4} Z`;
  return `${start} ${line} ${end}`;
}

function renderCandles(candles) {
  if (!candles?.length) {
    return null;
  }

  const max = Math.max(...candles.map((candle) => candle[1]));
  const min = Math.min(...candles.map((candle) => candle[2]));
  const spread = Math.max(1, max - min);

  return candles.map((candle, index) => {
    const [open, high, low, close] = candle;
    const candleX = (index / candles.length) * (SVG_WIDTH - 12) + 8;
    const scaleY = (value) => SVG_HEIGHT - ((value - min) / spread) * (SVG_HEIGHT - 18) - 7;
    const highY = scaleY(high);
    const lowY = scaleY(low);
    const openY = scaleY(open);
    const closeY = scaleY(close);
    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(2, Math.abs(closeY - openY));
    const bodyClass = close >= open ? "bull" : "bear";

    return html`
      <g key=${`candle-${index}`} className="nx-candles">
        <line x1=${candleX} y1=${highY} x2=${candleX} y2=${lowY}></line>
        <rect
          className=${bodyClass}
          x=${candleX - 2.6}
          y=${bodyY}
          width="5.2"
          height=${bodyHeight}
          rx="1"
        ></rect>
      </g>
    `;
  });
}

export function MiniMarketChart({ points, candles, color, id }) {
  const normalized = normalizePoints(points);
  const polyline = pointsToPolyline(normalized);
  const area = pointsToArea(normalized);

  return html`
    <svg
      viewBox=${`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="h-24 w-full"
      role="img"
      aria-label="Market trend chart"
    >
      <defs>
        <linearGradient id=${`line-grad-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor=${color} stopOpacity="0.95"></stop>
          <stop offset="100%" stopColor="#9dd0ff" stopOpacity="0.8"></stop>
        </linearGradient>
        <linearGradient id=${`area-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor=${color} stopOpacity="0.35"></stop>
          <stop offset="100%" stopColor="#0d1117" stopOpacity="0.03"></stop>
        </linearGradient>
        <filter id=${`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.6" result="blur"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>

      <g opacity="0.28" stroke="rgba(126,172,224,0.35)">
        <line x1="8" y1="16" x2="242" y2="16"></line>
        <line x1="8" y1="40" x2="242" y2="40"></line>
        <line x1="8" y1="64" x2="242" y2="64"></line>
        <line x1="8" y1="88" x2="242" y2="88"></line>
      </g>

      <path d=${area} fill=${`url(#area-grad-${id})`}></path>
      <polyline
        points=${polyline}
        fill="none"
        stroke=${`url(#line-grad-${id})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter=${`url(#glow-${id})`}
      ></polyline>

      <g opacity="0.75">${renderCandles(candles)}</g>
    </svg>
  `;
}
