module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        peripheral: 'var(--color-peripheral)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
      },
    },
  },
  plugins: [],
}
