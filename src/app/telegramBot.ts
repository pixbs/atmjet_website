'use server'
import { config } from 'dotenv'

config({ path: '.env.local' })

const allowedUsers = process.env.ALLOWED_USERS?.split(', ') ?? []

export async function sendMessage(text: string) {
	if (!allowedUsers.length) {
		throw new Error('No allowed users specified in the environment variable ALLOWED_USERS')
	}
	allowedUsers.forEach(async (chat_id) => {
		const response = await fetch(
			`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chat_id,
					parse_mode: 'HTML',
					text,
				}),
			},
		)
		if (!response.ok) {
			console.error('Failed to send message:', response.statusText)
			return false
		}
	})
	return true
}
