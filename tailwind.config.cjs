/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        peripheral: 'rgb(var(--color-peripheral) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        background: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--bg-card) / <alpha-value>)',
        'theme-text': 'rgb(var(--text) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}