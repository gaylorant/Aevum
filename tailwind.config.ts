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
        sameva: {
          accent: "#6C63FF",
          ink: "#1A1A2E",
          muted: "#6B7280",
          surface: "#FFFFFF",
          soft: "#F3F4F6",
          border: "#E5E7EB",
          "dark-bg": "#0F0F1A",
          "dark-surface": "#1A1A2E",
          "dark-soft": "#242438",
          "dark-border": "#2E2E4A",
          "dark-ink": "#F0F0FF",
          "dark-muted": "#9CA3AF",
        },
      },
    },
  },
  plugins: [],
};

export default config;