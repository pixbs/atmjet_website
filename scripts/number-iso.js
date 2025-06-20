import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd')
const rows = await res.json()

/* build → [{ name, code, iso }] */
const list = rows
	.filter((r) => r.idd?.root) // only those with a dial code
	.map((r) => ({
		name: r.name.common.replace(/'/g, "\\'"),
		iso: r.cca2,
		code: `${r.idd.root}${r.idd.suffixes?.[0] ?? ''}`, // root + first suffix
	}))
	.sort((a, b) => a.name.localeCompare(b.name))

const body = list
	.map((c) => `  { name: '${c.name}', code: '${c.code}', iso: '${c.iso}' },`)
	.join('\n')

const output = `export const COUNTRIES: Country[] = [
${body}
];
`

const dest = path.resolve('src', 'countries.ts')
mkdirSync(path.dirname(dest), { recursive: true })
writeFileSync(dest, output)

console.log(`✓ src/countries.ts generated with ${list.length} entries`)
