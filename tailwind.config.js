/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lightSquare': 'rgb(240, 217, 181)',
        'darkSquare': 'rgb(181, 136, 99)',
      },
    },
  },
  plugins: [],
}