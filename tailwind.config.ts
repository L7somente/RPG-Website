import type { Config } from "tailwindcss";

// Design tokens — "campaign ledger" direction:
// dark ink background, parchment cards, brass primary, crimson HP, verdant XP.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14171F", // page background
          panel: "#1B2029",   // raised dark panel (nav, footers)
        },
        parchment: {
          DEFAULT: "#EDE4D3", // sheet/card background
          dim: "#DCCFB0",     // secondary card / input background
          line: "#C9B78E",    // hairline rules on parchment
        },
        brass: {
          DEFAULT: "#B08D57",
          bright: "#D1AE79",
        },
        crimson: {
          DEFAULT: "#8C2F39",
          bright: "#B23A46",
        },
        verdant: {
          DEFAULT: "#4C6B4F",
          bright: "#6C9470",
        },
        ink900: "#0D0F14",
        parchmentText: "#241F1A",
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
