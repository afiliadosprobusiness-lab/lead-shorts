import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sand: "#fffaf0",
        ember: "#ef5b2a",
        teal: "#0f766e",
        mist: "#e2e8f0"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;

