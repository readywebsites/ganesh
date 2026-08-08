/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bgDarkest: '#050505',
        bgDark: '#0a0a0a',
        bgCard: 'rgba(18, 18, 18, 0.6)',
        goldLight: '#f6e0a4',
        goldBase: '#d4af37',
        goldDark: '#aa7c11',
        orangeLight: '#ff9933',
        orangeBase: '#e65c00',
        orangeDark: '#993d00',
        textLight: '#f5f5f7',
        textMuted: '#a1a1a6',
      },
      fontFamily: {
        heading: ['Cinzel Decorative', 'Georgia', 'serif'],
        subheading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #aa7c11 0%, #d4af37 50%, #f6e0a4 100%)',
        'gradient-luxury': 'linear-gradient(185deg, #0a0a0a 0%, #050505 100%)',
        'gradient-saffron': 'linear-gradient(135deg, #e65c00 0%, #d4af37 100%)',
      },
      boxShadow: {
        gold: '0 0 20px rgba(212, 175, 55, 0.25)',
        goldIntense: '0 0 35px rgba(212, 175, 55, 0.45)',
        orange: '0 0 25px rgba(230, 92, 0, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
