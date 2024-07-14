import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		fontFamily: {
			sans: ['Inter', 'sans-serif'],
			serif: ['TARegressoPROEasyRegular', 'serif'],
		},
		extend: {
			colors: {
				gray: {
					100: '#1A1A1A',
					150: '#171614',
					200: '#1E1E1E',
					300: '#2C2C2C',
					400: '#474444',
					500: '#707070',
					600: '#A2ABAD',
					700: '#C0C9CB',
					800: '#F0F1F6',
					900: '#FFFFFF',
				},
			},
			backgroundImage: {
				gold: 'linear-gradient(22deg, #DFAB53 -24.85%, #E6BE6B -7.56%, #EFD487 12.04%, #EBCA7A 33.04%, #DFAB53 98.1%), linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.01) 6.67%, rgba(21, 21, 21, 0.04) 13.33%, rgba(21, 21, 21, 0.08) 20%, rgba(21, 21, 21, 0.15) 26.67%, rgba(21, 21, 21, 0.23) 33.33%, rgba(21, 21, 21, 0.33) 40%, rgba(21, 21, 21, 0.44) 46.67%, rgba(21, 21, 21, 0.56) 53.33%, rgba(21, 21, 21, 0.67) 60%, rgba(21, 21, 21, 0.77) 66.67%, rgba(21, 21, 21, 0.85) 73.33%, rgba(21, 21, 21, 0.92) 80%, rgba(21, 21, 21, 0.96) 86.67%, rgba(21, 21, 21, 0.99) 93.33%, #151515 100%)',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
export default config
