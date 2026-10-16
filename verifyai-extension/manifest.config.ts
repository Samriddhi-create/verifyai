import pkg from "./package.json";

export type TargetBrowser = "chrome" | "firefox";

export const FIREFOX_ADDON_ID = "verifyai@verifyai.app";

const BACKGROUND_ENTRY = "src/background/service-worker.ts";

// The Chrome build also loads unchanged in Edge, Brave, Opera, Vivaldi and Arc.
// Firefox differs in two ways that matter here: no background service workers
// (it runs the same script as an event page) and a required add-on ID.
export function buildManifest(browser: TargetBrowser) {
  const isFirefox = browser === "firefox";

  return {
    manifest_version: 3,
    name: "VerifyAI — AI Answer Fact-Checker",
    version: pkg.version,
    description:
      "Check AI-generated text for made-up facts. Paste it, get a trust score, and see which claims the web contradicts.",
    icons: {
      16: "icons/icon-16.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
    action: {
      default_title: "VerifyAI",
      default_popup: "src/popup/index.html",
      default_icon: {
        16: "icons/icon-16.png",
        48: "icons/icon-48.png",
        128: "icons/icon-128.png",
      },
    },
    background: isFirefox
      ? { scripts: [BACKGROUND_ENTRY], type: "module" }
      : { service_worker: BACKGROUND_ENTRY, type: "module" },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["src/content-scripts/content-script.tsx"],
        run_at: "document_idle",
      },
    ],
    commands: {
      "open-widget": {
        suggested_key: { default: "Alt+Shift+V", mac: "Alt+Shift+V" },
        description: "Open the VerifyAI widget on this page",
      },
    },
    permissions: ["storage", "identity", "contextMenus"],
    host_permissions: ["http://localhost:8000/*", "https://verifyai-api.vercel.app/*", "https://*.verifyai.app/*"],
    ...(isFirefox
      ? {
          browser_specific_settings: {
            gecko: {
              id: FIREFOX_ADDON_ID,
              strict_min_version: "115.0",
              // Text the user submits for checking is sent to the VerifyAI API.
              data_collection_permissions: { required: ["websiteContent"] },
            },
          },
        }
      : {}),
  };
}
