/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          500: '#4f7df3',
          600: '#3a64db',
          700: '#2b4db8',
          900: '#1a2f7a',
        },
        neutral: {
          50: '#f8f9fb',
          100: '#f0f2f5',
          200: '#e0e3ea',
          400: '#9da4b0',
          600: '#5b6273',
          800: '#2c3141',
          900: '#1a1e2c',
        },
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      }
    },
  },
  plugins: [],
}
