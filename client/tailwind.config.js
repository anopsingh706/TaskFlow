/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F0EEFF',
          100: '#E4E0FF',
          200: '#CCC5FF',
          300: '#A99EFF',
          400: '#8B83F5',
          500: '#5B4FE9',
          600: '#4A3FD4',
          700: '#3B30B5',
          800: '#2D2490',
          900: '#1E1870',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right':'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':      'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'float':         'float 6s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { from: { transform: 'translateX(24px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:      { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'brand':    '0 4px 24px rgba(91,79,233,0.25)',
        'brand-sm': '0 2px 12px rgba(91,79,233,0.18)',
        'card':     '0 0 0 1px rgba(91,79,233,0.05), 0 2px 8px rgba(91,79,233,0.06)',
        'card-lg':  '0 0 0 1px rgba(91,79,233,0.06), 0 8px 32px rgba(91,79,233,0.10)',
        'input':    '0 1px 2px rgba(0,0,0,0.04)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #5B4FE9, #8B83F5)',
        'gradient-warm':  'linear-gradient(135deg, #F97316, #FBBF24)',
        'gradient-mesh':  'radial-gradient(ellipse 700px 500px at 10% 50%, rgba(91,79,233,0.05) 0%, transparent 70%), radial-gradient(ellipse 500px 400px at 90% 10%, rgba(249,115,22,0.04) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}