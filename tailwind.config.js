/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        redfemPink: "#DD127B",
        redfemDarkPink: '#BC0764',
        redfemActionPink: '#FF2194',
        redfemVariantPink: '#DA4E8B',
        redfemHoverPink: '#FFE7F2',
        redfemGray: '#A3A3A3',
        redfemLightGray: '#C3C3C3',
        redfemLighterGray: '#E7E7E7',
        redfemDarkWhite: '#F7F7F7',
        redfemOffWhite: '#FDFDFD'
      },
      fontFamily: {
        sans: ["Tahoma", "Geneva", "Verdana", "sans-serif"],
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

