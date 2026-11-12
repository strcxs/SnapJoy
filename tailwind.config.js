/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sj: {
          brand: "#0f172a",
          "brand-light": "#1e293b",
          accent: "#f59e0b",
          "accent-hover": "#d97706",
          success: "#10b981",
          danger: "#ef4444",
          muted: "#64748b",
          "bg-soft": "#f8fafc",
          border: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
