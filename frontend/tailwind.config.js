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
        background: '#000000',
        surface: '#09090b', // Zinc 950
        primary: '#22d3ee', // Cyan 400 (Neon High-Tech)
        secondary: '#0f172a', // Slate 900
        accent: '#3b82f6', // Bright Blue
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        border: '#27272a', // Zinc 800
        'cyan-glow': 'rgba(34, 211, 238, 0.3)',
      }
    },
  },
  plugins: [],
}
