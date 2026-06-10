import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "Sameva-accent": "#6C63FF",
        "Sameva-ink": "#1A1A2E",
        "Sameva-muted": "#6B7280",
        "Sameva-surface": "#FFFFFF",
        "Sameva-soft": "#F3F4F6",
        "Sameva-border": "#E5E7EB",
        // Dark mode variants
        "Sameva-dark-bg": "#0F0F1A",
        "Sameva-dark-surface": "#1A1A2E",
        "Sameva-dark-soft": "#242438",
        "Sameva-dark-border": "#2E2E4A",
        "Sameva-dark-ink": "#F0F0FF",
        "Sameva-dark-muted": "#9CA3AF",
      },
    },
  },
  plugins: [],
};

export default config;