/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#f4f8f4',
          100: '#e4efe4',
          200: '#ccdfcc',
          300: '#a7c6a7',
          400: '#7ba77c',
          500: '#588a59',
          600: '#436f44',
          700: '#375938',
          800: '#2e472e',
          900: '#273c28',
          950: '#142115',
        },
        emeraldCustom: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        darkBg: '#0b130e',
        cardBg: '#121f17',
        borderMuted: '#1d3326',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
