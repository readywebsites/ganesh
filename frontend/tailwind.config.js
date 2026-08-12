/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bgDarkest: '#F7F3EA',
        bgDark: '#EEE7D8',
        bgCard: 'rgba(255, 253, 247, 0.85)',
        goldLight: '#D8BD72',
        goldBase: '#B89A4A',
        goldDark: '#8F7430',
        orangeLight: '#C99B45',
        orangeBase: '#C99B45',
        orangeDark: '#B88635',
        textLight: '#3F3528',
        textMuted: '#776B5B',
        ivory: '#FAF7EF',
        champagneGold: '#D8BD72',
        antiqueGold: '#8F7430',
        warmSaffron: '#C99B45',
        deepSaffron: '#B88635',
        primaryText: '#3F3528',
        secondaryText: '#776B5B',
        mutedText: '#9A8D78',
      },
      fontFamily: {
        heading: ['Cinzel Decorative', 'Georgia', 'serif'],
        subheading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #8F7430 0%, #B89A4A 50%, #D8BD72 100%)',
        'gradient-luxury': 'linear-gradient(185deg, #FAF7EF 0%, #EEE7D8 100%)',
        'gradient-saffron': 'linear-gradient(135deg, #C99B45 0%, #B89A4A 100%)',
      },
      boxShadow: {
        gold: '0 4px 20px rgba(184, 154, 74, 0.2)',
        goldIntense: '0 6px 30px rgba(184, 154, 74, 0.35)',
        orange: '0 4px 25px rgba(201, 155, 69, 0.25)',
        glass: '0 8px 32px 0 rgba(63, 53, 40, 0.08)',
      },
    },
  },
  plugins: [],
}
