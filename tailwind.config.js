/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Hind Siliguri', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Mukta', 'Inter', 'system-ui', 'sans-serif'],
        bangla: ['Hind Siliguri', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f5f7fa',
          100: '#e9edf3',
          200: '#cfd8e3',
          300: '#a7b6c8',
          400: '#7790ad',
          500: '#527193',
          600: '#3e5a7a',
          700: '#324a64',
          800: '#2a3d53',
          900: '#1f2d3d',
          950: '#141d29',
        },
        gold: {
          50: '#fbf8ef',
          100: '#f5ecd0',
          200: '#ebd79c',
          300: '#e0c068',
          400: '#d4a73b',
          500: '#c1912a',
          600: '#a3741f',
          700: '#83591b',
          800: '#6c481c',
          900: '#5b3d1c',
        },
        emerald2: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 29, 41, 0.06), 0 8px 24px rgba(15, 29, 41, 0.06)',
        soft: '0 2px 10px rgba(15, 29, 41, 0.05)',
        ring: '0 0 0 4px rgba(193, 145, 42, 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
