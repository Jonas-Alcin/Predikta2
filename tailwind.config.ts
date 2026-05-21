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
        background: "#0a0a0a", // Darker background
        surface: "#1a1a1a",    // Card background
        primary: "#d9f95d",    // Neon Lime
        secondary: "#8b5cf6",  // Neon Purple
        accent: "#10b981",     // Neon Green (success/win)
        danger: "#ef4444",     // Neon Red (loss/risk)
        textMain: "#f3f4f6",   // Light gray text
        textMuted: "#9ca3af",  // Muted gray text
        border: "#2d2d2d",     // Subtle border
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
