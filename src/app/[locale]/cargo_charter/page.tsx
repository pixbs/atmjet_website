import { FooterSection, HeaderSection } from '@/components/sections'
import fs from 'fs'
import path from 'path'

export default async function CargoCharter() {
	// const filePath = path.join(process.cwd(), 'static', 'cargo_charter.html');
	// const __html = await fs.readFileSync(filePath, 'utf-8').toString();
	// console.log(__html)
	return (
		<main>
			<HeaderSection />
			<iframe src='./cargo_charter.html' />
			<FooterSection />
		</main>
	)
}
