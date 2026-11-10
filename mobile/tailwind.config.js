/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Keep in sync with src/theme.ts (used where className can't be).
      colors: {
        brand: {
          50: "#F1F5FC",
          100: "#E3EBF8",
          200: "#CBDAF2",
          300: "#A6BFE8",
          400: "#7F9FDA",
          500: "#5C82C9",
          600: "#4A6CB0",
          700: "#3B5791",
          800: "#304774",
          900: "#27395C",
        },
        canvas: "#F4F7FB",
        ink: "#1F2A44",
        muted: "#6B7A99",
        free: "#3E9C8F",
        paid: "#C98A2B",
        danger: "#C75B5B",
      },
    },
  },
  plugins: [],
};
