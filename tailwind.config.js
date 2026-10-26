/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d9fe',
          300: '#a3c0fd',
          400: '#799efb',
          500: '#4d75f6',
          600: '#3454eb',
          700: '#283fd3',
          800: '#2434ab',
          900: '#223086',
        },
        studio: {
          bg: '#0a0d14',
          surface: '#111726',
          card: '#161e33',
          border: '#23304e',
          accent: '#6366f1',
          highlight: '#38bdf8',
          sarvam: '#ff6c37',
          gemini: '#4285f4',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'soundwave': 'soundwave 1.2s ease-in-out infinite',
      },
      keyframes: {
        soundwave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        }
      }
    },
  },
  plugins: [],
}
