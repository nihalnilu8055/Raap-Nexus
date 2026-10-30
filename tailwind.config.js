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
        // Light Theme Design Tokens
        'brand': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        'slate-ink': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        'electric': {
          blue: '#2563EB',
          bright: '#3B82F6',
          light: '#60A5FA',
          cyan: '#0891B2',
          'cyan-light': '#06B6D4',
        },
        'accent': {
          violet: '#7C3AED',
          'violet-light': '#8B5CF6',
          emerald: '#059669',
          amber: '#D97706',
        },
        'surface': {
          page: '#FFFFFF',
          subtle: '#F8FAFC',
          muted: '#F1F5F9',
          card: '#FFFFFF',
          'card-hover': '#F8FAFC',
          border: '#E2E8F0',
          'border-subtle': '#EEF2F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
        'elevation': '0 20px 40px -12px rgba(15, 23, 42, 0.12)',
        'blue-glow': '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
        'cyan-glow': '0 10px 25px -5px rgba(8, 145, 178, 0.25)',
      },
      backgroundImage: {
        'hero-light': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(219, 234, 254, 0.7) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'grid-light': 'linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
        'cta-light': 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(219, 234, 254, 0.5) 0%, transparent 80%), linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
    },
  },
  plugins: [],
}
