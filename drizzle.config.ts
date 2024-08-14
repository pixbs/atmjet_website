import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/drizzle.ts',
	dbCredentials: {
		url: process.env.POSTGRES_URL || '',
	},
})
