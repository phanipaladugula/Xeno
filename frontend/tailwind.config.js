/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode palette
        background: {
          DEFAULT: '#f8fafc',
          secondary: '#ffffff',
          tertiary: '#f1f5f9',
        },
        text: {
          DEFAULT: '#1a1a2e',
          secondary: '#6b7a99',
          tertiary: '#94a3b8',
        },
        border: {
          DEFAULT: '#e0e8f8',
          hover: '#cbd5e1',
        },

        // Xeno Brand colors
        xeno: {
          50: '#f3eeff',
          100: '#e0d4fe',
          200: '#cbb6fc',
          300: '#b494fa',
          400: '#9b6ef7',
          500: '#6633cc', // Primary getxeno purple
          600: '#5428a8',
          700: '#431f87',
          800: '#321666',
          900: '#220e47',
        },

        // Semantic colors
        success: {
          50: '#e6f7ee',
          100: '#a0dbb8',
          500: '#1a7a44',
        },
        warning: {
          50: '#fff7e6',
          100: '#f0c870',
          500: '#a05a00',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
        },
        info: {
          50: '#eef2ff',
          100: '#b0c0f0',
          500: '#2255cc',
        },
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      },

      boxShadow: {
        'soft': '0 2px 12px rgba(102, 51, 204, 0.04)',
        'medium': '0 4px 16px rgba(102, 51, 204, 0.08)',
        'large': '0 12px 40px rgba(102, 51, 204, 0.12)',
      },

      backgroundImage: {
        'xeno-gradient': 'linear-gradient(135deg, #F5F9FF 0%, #F5F8FF 50%, #FAF0FF 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}