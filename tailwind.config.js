/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#d4af35", // AURUM Gold
        "primary-dark": "#bf953f",
        "primary-light": "#fcf6ba",
        "background-dark": "#0a0a0a", // AURUM Deep Black
        "background-light": "#f8f7f6",
        "neutral-dark": "#1a1a1a",
        "gold-muted": "#433d28",
      },
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
