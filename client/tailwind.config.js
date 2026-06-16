/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          DEFAULT: '#0A7C72',
          600: '#0A7C72',
          700: '#065F55',
          800: '#065F55',
          900: '#134E4A',
          dark: '#065F55',
          light: '#0D9488',
        },
        accent: {
          DEFAULT: '#F97316',
          500: '#F97316',
          600: '#EA6C0A',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
