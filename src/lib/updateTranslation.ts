//use it to translate text using DeepL API
'use server'

import { eq, isNull, or } from 'drizzle-orm/expressions'
import { db, newAirports } from './drizzle'

// Function to translate text using LibreTranslate API
// Function to translate text using DeepL API
async function translateText(text: string): Promise<string> {
	const apiKey = process.env.DEEPL_API_KEY

	if (!apiKey) {
		throw new Error('DeepL API key not set in DEEPL_API_KEY environment variable.')
	}

	const url = 'https://api-free.deepl.com/v2/translate'

	const params = new URLSearchParams()
	params.append('auth_key', apiKey)
	params.append('text', text)
	params.append('target_lang', 'RU')
	params.append('source_lang', 'EN')

	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params.toString(),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`DeepL API error: ${response.status} ${response.statusText}\n${errorText}`)
	}

	const data = await response.json()

	if (data.message) {
		throw new Error(`DeepL API error: ${data.message}`)
	}

	if (!data.translations || data.translations.length === 0) {
		throw new Error('DeepL API returned no translations.')
	}

	return data.translations[0].text
}

// Main function to update missing Russian translations
export async function updateMissingRussianTranslations() {
	// Fetch airports where cityRu, countryRu, or labelRu is null or empty
	const airportsToUpdate = await db
		.select()
		.from(newAirports)
		.where(
			or(
				or(isNull(newAirports.cityRu), eq(newAirports.cityRu, '')),
				or(isNull(newAirports.countryRu), eq(newAirports.countryRu, '')),
				or(isNull(newAirports.labelRu), eq(newAirports.labelRu, '')),
			),
		)
		.execute()

	for (const airport of airportsToUpdate) {
		const updates: Partial<{
			cityRu: string
			countryRu: string
			labelRu: string
		}> = {}

		try {
			// Translate cityRu if missing
			if (!airport.cityRu || airport.cityRu.trim() === '') {
				if (airport.cityEn) {
					console.log(`Translating cityEn: ${airport.cityEn}`)
					updates.cityRu = await translateText(airport.cityEn)
				}
			}

			// Translate countryRu if missing
			if (!airport.countryRu || airport.countryRu.trim() === '') {
				if (airport.countryEn) {
					console.log(`Translating countryEn: ${airport.countryEn}`)
					updates.countryRu = await translateText(airport.countryEn)
				}
			}

			// Translate labelRu if missing
			if (!airport.labelRu || airport.labelRu.trim() === '') {
				if (airport.labelEn) {
					console.log(`Translating labelEn: ${airport.labelEn}`)
					updates.labelRu = await translateText(airport.labelEn)
				}
			}

			// Update the database if there are any changes
			if (Object.keys(updates).length > 0) {
				await db.update(newAirports).set(updates).where(eq(newAirports.id, airport.id)).execute()

				console.log(`Updated airport ID ${airport.id} with new translations.`)
			}
		} catch (error) {
			console.error(`Error processing airport ID ${airport.id}:`, error)
			// Optionally, you can decide to continue or rethrow the error
			// continue;
		}
	}
}
