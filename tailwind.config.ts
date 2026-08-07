import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./content/**/*.mdx",
    "./config/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        primaryDark: "var(--color-primary-dark)",
        border: "var(--color-border)",
        subtle: "var(--color-subtle)",
        accent: "var(--color-accent)"
      },
      fontFamily: {
        serif: ["var(--font-editorial)"],
        sans: ["var(--font-sans)"]
      },
      maxWidth: {
        shell: "1280px",
        reading: "760px"
      },
      borderRadius: {
        ds: "8px",
        smds: "6px"
      },
      boxShadow: {
        editorial: "0 18px 60px rgba(60, 38, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
