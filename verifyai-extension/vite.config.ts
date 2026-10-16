import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { buildManifest, type TargetBrowser } from "./manifest.config";

// `vite build` produces the Chrome-family build; `vite build --mode firefox`
// produces the Firefox one. Each lands in its own folder under dist/.
export default defineConfig(({ mode }) => {
  const browser: TargetBrowser = mode === "firefox" ? "firefox" : "chrome";

  return {
    plugins: [
      react(),
      webExtension({
        manifest: () => buildManifest(browser),
        browser,
        disableAutoLaunch: true,
        watchFilePaths: ["manifest.config.ts"],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: `dist/${browser}`,
      emptyOutDir: true,
    },
  };
});
