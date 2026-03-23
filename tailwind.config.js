/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "#E91E63",
          50: "#FDF2F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F472B6",
          500: "#E91E63",
          600: "#DB2777",
          700: "#BE185D",
          800: "#9D174D",
          900: "#831843",
        },
        // Neutral grays
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        // Semantic colors
        success: {
          light: "#ECFDF5",
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        warning: {
          light: "#FFFBEB",
          DEFAULT: "#F59E0B",
          dark: "#D97706",
        },
        error: {
          light: "#FEF2F2",
          DEFAULT: "#EF4444",
          dark: "#DC2626",
        },
        info: {
          light: "#EFF6FF",
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
        },
      },
      fontSize: {
        // Display - for hero text
        "display-lg": [
          "36px",
          { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        display: [
          "30px",
          { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        // Headings
        "heading-lg": [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        heading: [
          "20px",
          { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "heading-sm": [
          "18px",
          { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        // Body text
        "body-lg": ["17px", { lineHeight: "26px", letterSpacing: "0" }],
        body: ["15px", { lineHeight: "24px", letterSpacing: "0" }],
        "body-sm": ["14px", { lineHeight: "20px", letterSpacing: "0.01em" }],
        // Labels and captions
        label: [
          "13px",
          { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "500" },
        ],
        caption: ["12px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        overline: [
          "11px",
          { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "600" },
        ],
      },
      spacing: {
        4.5: "18px",
        5.5: "22px",
        18: "72px",
      },
      borderRadius: {
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
