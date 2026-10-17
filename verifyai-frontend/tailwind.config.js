/** @type {import('tailwindcss').Config} */

// Each status gets a solid fill (DEFAULT), a text color that passes contrast
// in both themes (ink) and a soft tint for badges and highlights (soft).
const status = (name) => ({
  DEFAULT: `var(--${name})`,
  ink: `var(--${name}-ink)`,
  soft: `var(--${name}-soft)`,
});

export default {
  // The theme is switched with the "light" class (see src/lib/theme.ts); dark is the default.
  darkMode: ["class", ":root:not(.light)"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design tokens.
        bg: "var(--bg)",
        surface: { DEFAULT: "var(--surface)", 2: "var(--surface-2)" },
        line: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        ink: "var(--ink)",
        violet: { DEFAULT: "var(--violet)", on: "var(--on-violet)", soft: "var(--glow-soft)" },
        supported: status("supported"),
        partial: status("partial"),
        contradicted: status("contradicted"),
        unverified: status("unverified"),
        severity: { high: "var(--severity-high)", medium: "var(--severity-medium)", on: "var(--on-severity)" },

        // Older names, mapped onto the tokens so existing pages follow the theme.
        border: "var(--line)",
        input: "var(--line-strong)",
        ring: "var(--violet)",
        background: "var(--bg)",
        foreground: "var(--ink)",
        primary: { DEFAULT: "var(--violet)", foreground: "var(--on-violet)" },
        secondary: { DEFAULT: "var(--surface-2)", foreground: "var(--ink)" },
        muted: { DEFAULT: "var(--surface-2)", foreground: "var(--muted)" },
        accent: { DEFAULT: "var(--surface-2)", foreground: "var(--ink)" },
        card: { DEFAULT: "var(--surface)", foreground: "var(--ink)" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
        tile: "var(--radius-tile)",
      },
      boxShadow: {
        // Glow is only for the score ring, the search trail and primary buttons.
        "glow-ring": "0 0 48px 8px var(--glow)",
        "glow-button": "0 0 24px var(--glow-soft)",
        "glow-mark": "0 0 16px var(--glow)",
        "glow-line": "0 0 10px var(--glow)",
        "glow-node": "0 0 0 5px var(--glow-soft), 0 0 22px var(--glow)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
