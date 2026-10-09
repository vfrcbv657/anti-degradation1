/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        card: '#141416',
        'card-hover': '#1a1a1e',
        border: '#27272a',
        primary: '#22c55e',
        'primary-dim': '#16a34a',
        warning: '#eab308',
        danger: '#ef4444',
        accent: '#8b5cf6',
        muted: '#71717a',
        foreground: '#fafafa',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
