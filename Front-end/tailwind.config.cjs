/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx,html}"
	],
	theme: {
		extend: {
			fontFamily:{
				Oi: ['"Bruno Ace SC"']
			},
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
			keyframes: {
				animateSlow: {
					'0%': { transform: 'translateX(100%)', opacity: '0'},
					'100%': { transform: 'translateX(50%)', opacity: '1' },
				},
				pulse: {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
				},
			},
			animation: {
				animateSlow: 'animateSlow 1.2s ease-out forwards',
				'pulse': 'pulse 2s ease-in-out infinite',
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
