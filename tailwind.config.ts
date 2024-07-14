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
				gold: 'EBC034',
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
	],
}
export default config
