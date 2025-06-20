'use server'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const RAW_USERS = process.env.ALLOWED_USERS

if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is missing from environment')
if (!RAW_USERS) throw new Error('ALLOWED_USERS is missing from environment')

const ALLOWED_USERS = RAW_USERS.split(',')
	.map((id) => id.trim())
	.filter(Boolean)

type ParseMode = 'MarkdownV2' | 'HTML' | 'Markdown' | undefined

interface TelegramPayload {
	chat_id: string
	text: string
	parse_mode: ParseMode
	disable_web_page_preview?: boolean
}

export async function sendMessage(
	text: string,
	parseMode: ParseMode = 'MarkdownV2',
): Promise<boolean> {
	const payloadBase: Omit<TelegramPayload, 'chat_id'> = {
		text,
		parse_mode: parseMode,
	}

	for (const chat_id of ALLOWED_USERS) {
		const payload: TelegramPayload = { chat_id, ...payloadBase }

		const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		if (!res.ok) {
			const msg = await res.text()
			console.error(`Telegram error for ${chat_id}:`, res.status, msg)
			throw new Error(`Failed to send to ${chat_id}: ${res.status}`)
		}
	}

	return true
}
