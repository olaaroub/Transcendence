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
				color4 : 'rgb(0 0 0 / 50%)',
				bgColor: '#0f1114',
				borderColor: '#87878766',
				errorColor: 'red'
			},
			backgroundImage: theme => ({
				'backgroundGradient': `linear-gradient(to bottom right, black 0%, black 40%, ${theme('colors.color1')} 100%)`,
				'backgroundGradientWelcome': `linear-gradient(to bottom right, ${theme('colors.color3')} 0%, ${theme('colors.color4')} 50%, ${theme('colors.color9')} 100%)`,
			}),
			keyframes: {
				slideCard: {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'5%': { opacity: '1', transform: 'scale(1)' },
					'20%': { opacity: '1', transform: 'scale(1)' },
					'30%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '0', transform: 'scale(0.95)' },
				},
				dots: {
					'0%, 20%': { content: '"."' },
					'40%': { content: '".."'},
					'60%': { content: '"..."'},
					'80%, 100%': { content: '""' },
				},
				animateSlow: {
					'0%': { transform: 'translateX(100%)', opacity: '0'},
					'100%': { transform: 'translateX(50%)', opacity: '1' },
				},
			},
			animation: {
				animateSlow: 'animateSlow 1.2s ease-out forwards',
				slideCard: 'slideCard 25s linear infinite both',
				dots: 'dots 3s steps(4, end) infinite',
			},
		},
	},
	plugins: [
		function ({ addUtilities }) {
			const newUtils = {
				'.anim-delay-0': { 'animationDelay': '0s' },
				'.anim-delay-5s': { 'animationDelay': '5s' },
				'.anim-delay-10s': { 'animationDelay': '10s' },
				'.anim-delay-15s': { 'animationDelay': '15s' },
				'.anim-delay-20s': { 'animationDelay': '20s' },
			};
			addUtilities(newUtils, ['responsive']);
		},
		require('tailwind-scrollbar'),
	],
}
