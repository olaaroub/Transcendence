/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],

theme: {
  extend: {
    screens: {
      '3xl': '1920px',
      '4xl': '2560px',
    },
    colors: {
      main : '#00FFC6',         
      txtColor : '#EDEFFF',     
      borderColor : '#5A5F7A66',

      color1 : '#ed6f30',
      color2 : '#d18a10',
      color3 : '#878787',
      color4 : '#1B1A1DD6',  
      color5 : '#C9CCEC',  
      color6 : '#A3A7D1',  
      color7 : '#8E9AE6', 
      color8 : '#00E5FF',
      color9 : '#6C63FF', 
      color10 : '#4F46E5',  
      color11 : '#374151',  
      color12 : '#FF5F5F', 
      color13 : '#FFB347',
      color14 : '#FFD166',
      color15 : '#06D6A0',
      color16 : '#B980FF'
    },
    backgroundImage: theme => ({
      'backgroundGradient': `linear-gradient(to bottom right, black 0%, 
        black 40%, 
        ${theme('colors.color1')} 100%)`,

      'backgroundGradientWelcome': `linear-gradient(to bottom right, ${theme('colors.color3')} 0%, 
        ${theme('colors.color4')} 50%, 
        ${theme('colors.color9')} 100%)`,
    }),
  },
  keyframes: {
        dots: {
          '0%, 20%': { content: '"."' },
          '40%': { content: '".."'},
          '60%': { content: '"..."'},
          '80%, 100%': { content: '""' },
        },
      },
      animation: {
        dots: 'dots 1.5s steps(4, end) infinite',
      },
},

  plugins: [],
}
