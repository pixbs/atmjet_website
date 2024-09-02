'use server'
// import { config } from 'dotenv'

// // config({ path: '.env.local' })

const allowedUsers = process.env.ALLOWED_USERS?.split(', ') ?? []

if (!process.env.TELEGRAM_BOT_TOKEN) {
	throw new Error('No Telegram bot token specified in the environment variable TELEGRAM_BOT_TOKEN')
}
if (!process.env.ALLOWED_USERS) {
	throw new Error('No allowed users specified in the environment variable ALLOWED_USERS')
}

export async function sendMessage(text: string) {
	console.log('Sending message:', text)
	if (!allowedUsers.length) {
		throw new Error('No allowed users specified in the environment variable ALLOWED_USERS')
	}
	allowedUsers.forEach(async (chat_id) => {
		try {
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
			console.log('Message sent:', response.ok)
			if (!response.ok) {
				console.error('Failed to send message:', response.statusText)
				return false
			}
		} catch (error) {
			console.error('Failed to send message:', error)
			throw new Error(error as string)
		}
	})
	return true
}
