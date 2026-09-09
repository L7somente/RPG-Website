import type { Config } from "tailwindcss";

// Design tokens — "campaign ledger" direction:
// dark ink background, parchment cards, brass primary, crimson HP, verdant XP.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1018", // page background
          panel: "#151D29",   // raised dark panel (nav, footers)
        },
        parchment: {
          DEFAULT: "#E4E9F1", // sheet/card background
          dim: "#121A25",     // secondary card / input background
          line: "#303B4C",    // hairline rules on parchment
        },
        brass: {
          DEFAULT: "#C7A974",
          bright: "#DFC38E",
        },
        crimson: {
          DEFAULT: "#8C2F39",
          bright: "#EF8D98",
        },
        verdant: {
          DEFAULT: "#69B49B",
          bright: "#95D9BC",
        },
        ink900: "#0D0F14",
        parchmentText: "#E4E9F1",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        seal: "0 0 0 2px #B08D57, 0 2px 6px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
