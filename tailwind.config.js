/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom green palette
        'primary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Secondary colors
        'secondary': {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0d9e4',
          300: '#a9b9cc',
          400: '#7994b0',
          500: '#5b7895',
          600: '#465f7b',
          700: '#394d64',
          800: '#304155',
          900: '#2a3847',
          950: '#1c2732',
        },
        // Success, warning, danger colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
        'info': '#3b82f6',
        // Dark theme specific colors
        'dark': {
          'bg-primary': '#111827',
          'bg-secondary': '#1f2937',
          'text-primary': '#f9fafb',
          'text-secondary': '#d1d5db',
          'border': '#374151',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
