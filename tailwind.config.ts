import type { Config } from 'tailwindcss'

const config: Config = {
	darkMode: ['class'],
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
					'100': '#1A1A1A',
					'150': '#171614',
					'200': '#1E1E1E',
					'300': '#2C2C2C',
					'400': '#474444',
					'500': '#707070',
					'600': '#A2ABAD',
					'700': '#C0C9CB',
					'800': '#F0F1F6',
					'900': '#FFFFFF',
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
			},
			backgroundImage: {
				gold: 'linear-gradient(22deg, #DFAB53 -24.85%, #E6BE6B -7.56%, #EFD487 12.04%, #EBCA7A 33.04%, #DFAB53 98.1%), linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.01) 6.67%, rgba(21, 21, 21, 0.04) 13.33%, rgba(21, 21, 21, 0.08) 20%, rgba(21, 21, 21, 0.15) 26.67%, rgba(21, 21, 21, 0.23) 33.33%, rgba(21, 21, 21, 0.33) 40%, rgba(21, 21, 21, 0.44) 46.67%, rgba(21, 21, 21, 0.56) 53.33%, rgba(21, 21, 21, 0.67) 60%, rgba(21, 21, 21, 0.77) 66.67%, rgba(21, 21, 21, 0.85) 73.33%, rgba(21, 21, 21, 0.92) 80%, rgba(21, 21, 21, 0.96) 86.67%, rgba(21, 21, 21, 0.99) 93.33%, #151515 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
export default config
