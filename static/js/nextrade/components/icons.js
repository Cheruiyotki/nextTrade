import { html } from "../lib.js";

function StrokeIcon({ className = "h-5 w-5", children, viewBox = "0 0 24 24" }) {
  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox=${viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className=${className}
      aria-hidden="true"
    >
      ${children}
    </svg>
  `;
}

function FillIcon({ className = "h-5 w-5", children, viewBox = "0 0 24 24" }) {
  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox=${viewBox}
      fill="currentColor"
      className=${className}
      aria-hidden="true"
    >
      ${children}
    </svg>
  `;
}

export function FiActivity(props) {
  return html`<${StrokeIcon} ...${props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></${StrokeIcon}>`;
}

export function FiArrowRight(props) {
  return html`<${StrokeIcon} ...${props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></${StrokeIcon}>`;
}

export function FiBarChart2(props) {
  return html`<${StrokeIcon} ...${props}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></${StrokeIcon}>`;
}

export function FiDatabase(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path>
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>
    </${StrokeIcon}>
  `;
}

export function FiGift(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <rect x="3" y="8" width="18" height="13" rx="2"></rect>
      <line x1="12" y1="8" x2="12" y2="21"></line>
      <path d="M3 12h18"></path>
      <path d="M7.5 8C6 7.8 5 6.8 5 5.5 5 4 6.2 3 7.5 3 9.5 3 12 6.2 12 8"></path>
      <path d="M16.5 8C18 7.8 19 6.8 19 5.5 19 4 17.8 3 16.5 3 14.5 3 12 6.2 12 8"></path>
    </${StrokeIcon}>
  `;
}

export function FiGlobe(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M3 12h18"></path>
      <path d="M12 3c3 2.5 3 15.5 0 18"></path>
      <path d="M12 3c-3 2.5-3 15.5 0 18"></path>
    </${StrokeIcon}>
  `;
}

export function FiImage(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <rect x="3" y="4" width="18" height="16" rx="2"></rect>
      <circle cx="8" cy="9" r="1.5"></circle>
      <path d="M21 16l-5-5-6 6-3-3-4 4"></path>
    </${StrokeIcon}>
  `;
}

export function FiLayers(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <polygon points="12 2 3 7 12 12 21 7 12 2"></polygon>
      <polyline points="3 12 12 17 21 12"></polyline>
      <polyline points="3 17 12 22 21 17"></polyline>
    </${StrokeIcon}>
  `;
}

export function FiLink2(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"></path>
      <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"></path>
    </${StrokeIcon}>
  `;
}

export function FiLock(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <rect x="4" y="11" width="16" height="10" rx="2"></rect>
      <path d="M8 11V8a4 4 0 1 1 8 0v3"></path>
    </${StrokeIcon}>
  `;
}

export function FiShield(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <path d="M12 3l8 4v6c0 5-3 7-8 8-5-1-8-3-8-8V7l8-4z"></path>
      <path d="M9 12l2 2 4-4"></path>
    </${StrokeIcon}>
  `;
}

export function FiSmartphone(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <rect x="7" y="2" width="10" height="20" rx="2"></rect>
      <line x1="11" y1="18" x2="13" y2="18"></line>
    </${StrokeIcon}>
  `;
}

export function FiTrendingUp(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <polyline points="3 17 9 11 13 15 21 7"></polyline>
      <polyline points="21 11 21 7 17 7"></polyline>
    </${StrokeIcon}>
  `;
}

export function FiUser(props) {
  return html`
    <${StrokeIcon} ...${props}>
      <circle cx="12" cy="8" r="4"></circle>
      <path d="M4 21a8 8 0 0 1 16 0"></path>
    </${StrokeIcon}>
  `;
}

export function FiChevronDown(props) {
  return html`<${StrokeIcon} ...${props}><polyline points="6 9 12 15 18 9"></polyline></${StrokeIcon}>`;
}

export function FaBitcoin({ className = "h-5 w-5" }) {
  return html`
    <span className=${className + " inline-flex items-center justify-center font-bold leading-none"} aria-hidden="true">
      B
    </span>
  `;
}

export function FaEthereum(props) {
  return html`
    <${FillIcon} ...${props} viewBox="0 0 24 24">
      <path d="M12 2l5.2 8.6L12 13 6.8 10.6 12 2zm0 12l5.2-2.4L12 22l-5.2-10.4L12 14z"></path>
    </${FillIcon}>
  `;
}

export function FaStar(props) {
  return html`
    <${FillIcon} ...${props} viewBox="0 0 24 24">
      <path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.3 6.4 20.2l1.1-6.3L2.9 9.4l6.3-.9L12 2.8z"></path>
    </${FillIcon}>
  `;
}
