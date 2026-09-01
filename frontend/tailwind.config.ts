import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#FCFBF7",
          100: "#F7F4EA",
          200: "#EFE8D5",
          300: "#E2D6B5",
          400: "#D2BF91",
          500: "#C1A66E",
          800: "#4D3E21",
          900: "#2B210F",
        },
        terracotta: {
          50: "#FDF6F3",
          100: "#F9ECE5",
          500: "#C85A32",
          600: "#B24520",
          700: "#8C3214",
          900: "#4A1807",
        },
        turmeric: {
          400: "#F2B824",
          500: "#E59E10",
          600: "#C68007",
        },
        emerald: {
          700: "#1A5D3A",
          800: "#12452B",
          900: "#0A2D1C",
        },
        charcoal: "#1F2421",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        warm: "0 8px 30px rgba(193, 166, 110, 0.12)",
        glow: "0 0 25px rgba(229, 158, 16, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
