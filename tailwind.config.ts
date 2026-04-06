import type { Config } from "tailwindcss";

const config: Config = {
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  extend: {
  colors: {
  brand: {
  navy: "#1B2B5E",
  gold: "#C9A84C",
  blue: "#2563EB",
  light: "#EFF6FF",
  }
  }
  }
  },
  plugins: [],
};
export default config;
