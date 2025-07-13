/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}', // si tens components
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00B894',
        secondary: '#005AA7',
        neutral: {
          100: '#f5f5f5',
        },
      },
    },
  },
  plugins: [],
};
