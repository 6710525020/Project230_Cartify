/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brown: {
          50:  '#fdf8f5',
          100: '#f5ede4',
          200: '#ede0d0',
          300: '#d4b89a',
          400: '#b8906a',
          500: '#8b5e3c',
          600: '#6b3d28',
          700: '#4e2918',
          800: '#3b1f14',
          900: '#2d1610',
          950: '#1a0c08',
        },
        cream: {
          50:  '#fdfcf9',
          100: '#f9f5ee',
          200: '#f5f0e8',
          300: '#ede8df',
          400: '#dfd9ce',
          500: '#cec6b8',
        },
        gold: {
          300: '#f9de7a',
          400: '#f5c842',
          500: '#e8b800',
          600: '#c99e00',
        }
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        body:    ['"Nunito Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card':       '0 2px 20px rgba(59,31,20,0.08)',
        'card-hover': '0 8px 32px rgba(59,31,20,0.15)',
        'btn':        '0 2px 8px rgba(59,31,20,0.25)',
      }
    }
  },
  plugins: []
}
