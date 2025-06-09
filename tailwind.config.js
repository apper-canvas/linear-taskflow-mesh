/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0effe',
          100: '#e3dffd',
          200: '#c9c1fb',
          300: '#a498f7',
          400: '#8B85F0',
          500: '#5B4FE9',
          600: '#4f42d6',
          700: '#3f35b3',
          800: '#312a8f',
          900: '#252073'
        },
        accent: {
          50: '#fff5f0',
          100: '#ffe8db',
          200: '#ffcdb2',
          300: '#ffa882',
          400: '#FF6B35',
          500: '#e85d2f',
          600: '#d24c1e',
          700: '#b03b18',
          800: '#8f3118',
          900: '#742a17'
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    },
  },
  plugins: [],
}