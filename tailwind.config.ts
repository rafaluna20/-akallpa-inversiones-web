import type { Config } from 'tailwindcss';

// Sistema visual heredado de Inversiones Pro (tema oscuro azul/violeta).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' },
        secondary: { DEFAULT: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' },
        danger: { DEFAULT: '#dc2626', light: '#ef4444', dark: '#991b1b' },
        success: { DEFAULT: '#16a34a', light: '#22c55e', dark: '#15803d' },
        warning: { DEFAULT: '#ea580c', light: '#f97316', dark: '#c2410c' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-slab)', 'Georgia', 'serif'],
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
};
export default config;
