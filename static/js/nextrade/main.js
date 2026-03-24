import { createRoot, html } from "./lib.js";
import { CenterHeroView, LeftSidebarView, RightWorkflowView } from "./components/views.js";

function App() {
  const config = window.NEXTRADE_CONFIG || {
    urls: {
      home: "/",
      explore: "/explore",
      howItWorks: "/how-it-works",
      portfolio: "/portfolio",
      login: "/login",
      register: "/register",
      logout: "/logout"
    },
    user: {
      isAuthenticated: false,
      username: null
    }
  };

  return html`
    <main className="relative min-h-screen overflow-hidden px-3 py-5 sm:px-5 lg:px-8 lg:py-7">
      <div className="pointer-events-none absolute inset-0 nx-grid-noise"></div>
      <div className="relative mx-auto mb-4 max-w-[1700px] px-1 text-center">
        <p className="inline-flex items-center rounded-full border border-blue-300/30 bg-blue-500/10 px-4 py-1 text-xs text-slate-200/85">
          ${
            config.user?.isAuthenticated
              ? `Welcome back, ${config.user.username || "Trader"}`
              : "Nextrade Digital Exchange"
          }
        </p>
      </div>

      <div className="relative mx-auto grid max-w-[1700px] gap-4 xl:grid-cols-[0.95fr_1.15fr_0.95fr]">
        <div className="order-2 xl:order-1">
          <${LeftSidebarView} config=${config} />
        </div>
        <div className="order-1 xl:order-2">
          <${CenterHeroView} config=${config} />
        </div>
        <div className="order-3 xl:order-3">
          <${RightWorkflowView} config=${config} />
        </div>
      </div>
    </main>
  `;
}

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(html`<${App} />`);
}
