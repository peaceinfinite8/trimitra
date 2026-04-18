/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      lineClamp: {
        2: '2',
        3: '3',
      },
      boxShadow: {
        editorial: '0 20px 50px rgba(15, 23, 42, 0.08)',
        glass: '0 12px 32px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        glass: '16px',
      },
      backdropBlur: {
        glass: '14px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.glass-dark': {
          background: 'rgba(255, 255, 255, 0.07)',
          'backdrop-filter': 'blur(14px)',
          '-webkit-backdrop-filter': 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          'border-radius': '16px',
        },
        '.glass-light': {
          background: 'rgba(255, 255, 255, 0.55)',
          'backdrop-filter': 'blur(14px)',
          '-webkit-backdrop-filter': 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          'border-radius': '16px',
        },
      })
    },
  ],
}
