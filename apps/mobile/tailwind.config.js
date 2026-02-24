/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF8F0',
          100: '#F5E6D3',
          200: '#E8CBA7',
          300: '#D4A574',
          400: '#C48B52',
          500: '#6B4226',
          600: '#5A3720',
          700: '#492C1A',
          800: '#382114',
          900: '#27160E',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
