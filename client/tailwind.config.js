/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        background: '#0a0a0a',
        card: '#111111',
        border: '#1f1f1f',
        text: '#e5e5e5',
        success: '#22c55e',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
