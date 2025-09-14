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
        redfemOffWhite: '#FDFDFD',
        // Status colors
        status: {
          success: {
            DEFAULT: '#10B981',
            light: '#D1FAE5',
            dark: '#047857'
          },
          warning: {
            DEFAULT: '#F59E0B',
            light: '#FEF3C7',
            dark: '#D97706'
          },
          error: {
            DEFAULT: '#EF4444',
            light: '#FEE2E2',
            dark: '#DC2626'
          },
          info: {
            DEFAULT: '#3B82F6',
            light: '#DBEAFE',
            dark: '#1D4ED8'
          },
          pending: {
            DEFAULT: '#6B7280',
            light: '#F3F4F6',
            dark: '#374151'
          }
        },
        // Neutral grays for better hierarchy
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ["Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      boxShadow: {
        custom: "0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 15px rgba(0, 0, 0, 0.2)",
        soft: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        table: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        hover: '0 4px 12px 0 rgba(0, 0, 0, 0.15)'
      },
      spacing: {
        fineLine: "0.0275rem",
        18: '4.5rem',
        22: '5.5rem'
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }]
      }
    },
  },
  plugins: [],
}

