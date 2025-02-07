/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transform: {
        'rotate-y-180': 'rotateY(180deg)',
      },
      backfaceVisibility: {
        hidden: 'hidden',
      },
      perspective: {
        '1000': '1000px',
      },
      gridTemplateColumns:{
        'auto':'repeat(auto-fill,minmax(200px,1fr))'
      }
    },
  },
  variants: {
    extend: {
      transform: ['hover'],
    },
  },
  plugins: [],
}