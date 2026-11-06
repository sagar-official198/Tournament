/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        chalk: '#EEF1F4',
        ink: { DEFAULT: '#101B2D', soft: '#1B2A44', line: '#2B3C5C' },
        mat: '#2457D6',      // Team A
        saffron: '#E8590C',  // Team B
        gold: '#F5B700',
        alert: '#D7263D',
        field: '#1E8A5A',
      },
      fontFamily: {
        display: ['Oswald', 'Mukta', 'sans-serif'],
        body: ['Mukta', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
