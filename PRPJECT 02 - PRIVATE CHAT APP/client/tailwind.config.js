/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'Quicksand', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        sans: ['Quicksand', 'Inter', 'sans-serif'],
      },
      colors: {
        cream: '#FFF8F0',
        softpink: {
          light: '#FFF0F5',
          DEFAULT: '#FFE4EC',
          dark: '#FFCCD9',
        },
        pastelpurple: '#E9DDFB',
        sky: '#DDF2FF',
        skyblue: '#DDF2FF',
        mint: '#DDF5E8',
        mintgreen: '#DDF5E8',
        coral: {
          light: '#FFA6B5',
          DEFAULT: '#FF8C9E',
          dark: '#E06D80',
        },
        deeppurple: {
          light: '#7A64BD',
          DEFAULT: '#6551A3',
          dark: '#524089',
        },
        darktext: '#353047',
        brand: {
          50: '#FFF8F0',
          100: '#FFE4EC',
          200: '#E9DDFB',
          300: '#DDF2FF',
          400: '#FFB3C1',
          500: '#FF8C9E',
          600: '#6551A3',
          700: '#524089',
          800: '#41326E',
          900: '#353047',
          950: '#1a1726',
        }
      },
      boxShadow: {
        'cute': '0 8px 24px -4px rgba(101, 81, 163, 0.12), 0 4px 12px -2px rgba(255, 140, 158, 0.12)',
        'cute-lg': '0 16px 36px -6px rgba(101, 81, 163, 0.18), 0 8px 16px -4px rgba(255, 140, 158, 0.16)',
        'cute-sm': '0 4px 14px 0 rgba(101, 81, 163, 0.08)',
        'xs': '0 2px 8px 0 rgba(101, 81, 163, 0.10)',
        'inner-cute': 'inset 0 2px 4px 0 rgba(101, 81, 163, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'blink': 'blink 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
      },
    },
  },
  plugins: [],
}
