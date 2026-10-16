import { createRoot } from "react-dom/client";
import { App } from "@/content-scripts/App";
import { HOST_ID } from "@/content-scripts/constants";
import tailwindStyles from "@/index.css?inline";

// The design tokens are declared on `:root`, which never matches inside a shadow
// tree; without this the widget would render with no background or border colours.
// `all: initial` keeps the host page's own CSS from leaking in.
const SHADOW_STYLES = `:host { all: initial; }\n${tailwindStyles.replace(/:root/g, ":host")}`;

function followSystemTheme(container: HTMLElement): void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => container.classList.toggle("dark", query.matches);
  apply();
  query.addEventListener("change", apply);
}

function mount(): void {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = SHADOW_STYLES;
  shadowRoot.appendChild(style);

  const container = document.createElement("div");
  shadowRoot.appendChild(container);
  followSystemTheme(container);

  createRoot(container).render(<App />);
}

mount();
