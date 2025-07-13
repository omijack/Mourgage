/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
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
