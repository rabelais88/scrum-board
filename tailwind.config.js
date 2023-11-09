/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'base-white': '#FAF8FB',
        'base-black': '#000911',
        'base-yellow': '#F5DF92',
        'base-gray': '#E2E7F4',
      },
    },
  },
  plugins: [],
};
