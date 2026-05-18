/** @type {import('tailwindcss').Config} */
module.exports = {
  /** @type {import('tailwindcss').Config['theme']['extend']} */
  // added custom animations for blobs
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a',
        surface: '#111111',
        elevated: '#1a1a1a',
        border: '#2a2a2a',
        text: '#f0f0f0',
        secondary: '#888888',
        muted: '#444444',
        accentGreen: '#00ff88',
        accentBlue: '#4488ff',
        accentAmber: '#ffaa00',
        accentRed: '#ff4444',
      },
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        body: ['Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}