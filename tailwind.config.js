/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandPrimary: "#DD127B",
      },
      fontFamily: {
        sans: ["Tahoma", "Verdana", "Geneva", "sans-serif"],
      },
      boxShadow: {
        custom: "0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 15px rgba(0, 0, 0, 0.2)",
      },
      spacing: {
        fineLine: "0.0275rem",
      }
    },
  },
  plugins: [],
}

