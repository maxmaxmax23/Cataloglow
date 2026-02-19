/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      primary: "#d4af35", // AURUM Gold
      "primary-dark": "#aa8c2c", // Darker, less green
      "primary-light": "#faeeb6",
      "background-dark": "#020202", // Pure Deep Black (Rich)
      "background-light": "#fcfcfc",
      "neutral-dark": "#080808", // Pure Dark Gray, no warmth
      "background-card": "#050505", // Card background
      "gold-muted": "#594d2e", // Reduced green, more brown/gold
      fontFamily: {
        sans: ['Manrope', 'sans-serif'], // AURUM Typography
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px', // Anti-rounded / Sharp
        lg: '4px',
        xl: '8px',
        '2xl': '12px',
        full: '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
