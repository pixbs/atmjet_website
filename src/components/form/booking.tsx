'use client'

import { sendMessage } from '@/app/telegramBot'
import Checkmark from '@/assets/svg/checkmark.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import React, {
	ChangeEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
	useId, 
} from 'react'
import flags from 'react-phone-number-input/flags'
import { AsYouType } from 'libphonenumber-js'
import { COUNTRIES, type Country } from '@/countries'

const schema = z.object({
	name: z.string().min(1, 'Required').max(32),
	email: z.string().email('Invalid email'),
	phone_number: z
		.string()
		.min(1)
		.refine(
			(v) => {
				const d = v.replace(/\D/g, '')
				return d.length >= 8 && d.length <= 15
			},
			{ message: 'Invalid phone number' },
		),
	tags: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof schema>

const Flag = ({ iso, className }: { iso: keyof typeof flags; className?: string }) => {
	const C = flags[iso]
	return C ? (
		/* @ts-ignore */
		<C className={className ?? 'h-4 w-4 rounded-sm'} />
	) : (
		<span className={`inline-block ${className ?? 'h-4 w-4 rounded-sm'} bg-neutral-900`} />
	)
}

const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f\s]/g, '')

const highlight = (text: string, term: string) => {
	if (!term) return text
	const t = normalize(term)
	const n = normalize(text)
	const i = n.indexOf(t)
	if (i === -1) return text
	const e = i + t.length
	return (
		<>
			{text.slice(0, i)}
			<span className='font-semibold'>{text.slice(i, e)}</span>
			{text.slice(e)}
		</>
	)
}

const mdEscape = (t: string) => t.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, '\\$&')

export const BookingForm = ({ host, close }: { host: string; close: () => void }) => {
	const t = useTranslations('contact-form')
	const locale = useLocale()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const bookingType = searchParams.get('showBooking') || ''

	const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[1])
	const [open, setOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [activeIdx, setActiveIdx] = useState(0)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const methods = useForm<FormData>({
		resolver: zodResolver(schema),
		mode: 'onBlur',
		defaultValues: { name: '', phone_number: '', email: '', tags: [] },
	})

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, touchedFields },
	} = methods

	const phoneFieldValue = watch('phone_number')
	const directions = JSON.parse(searchParams.get('direction') || '[]') as {
		from?: string
		to?: string
		date?: string
		returnDate?: string
		passengers?: number
		guests?: number
		hours?: number
	}[]
	const showConfirm = searchParams.get('confirm') === 'true'
	const phonePlaceholder = `${selectedCountry.code} 123 456 789`

	const regionNames = useMemo(() => {
		try {
			return new Intl.DisplayNames([locale], { type: 'region' })
		} catch {
			return new Intl.DisplayNames(['en'], { type: 'region' }) // fallback
		}
	}, [locale])

	useEffect(() => {
		const h = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', h)
		return () => document.removeEventListener('mousedown', h)
	}, [])

	const filteredCountries = useMemo(() => {
		const raw = searchTerm.trim()
		if (!raw) return COUNTRIES
		const term = normalize(raw)
		const digits = raw.replace(/\D/g, '')
		return COUNTRIES.filter((c) => {
			const localized = regionNames.of(c.iso) || c.name
			const name = normalize(localized)
			const code = c.code.replace('+', '')
			return name.includes(term) || (digits && code.includes(digits))
		})
	}, [searchTerm, regionNames])

	useEffect(() => setActiveIdx(0), [filteredCountries])

	const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
		let raw = e.target.value
		if (!raw.startsWith('+')) raw = '+' + raw.replace(/^\+?/, '')
		const formatted = new AsYouType().input(raw)
		setValue('phone_number', formatted, { shouldDirty: true })
		const m = /^\+(\d{1,3})/.exec(formatted.replace(/\s/g, ''))
		if (m) {
			const hit = COUNTRIES.find((c) => c.code === `+${m[1]}`)
			if (hit && hit.code !== selectedCountry.code) setSelectedCountry(hit)
		}
	}

	const preventPlusDeletion = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			(e.key === 'Backspace' || e.key === 'Delete') &&
			(e.currentTarget.selectionStart ?? 0) === 1 &&
			phoneFieldValue.startsWith('+')
		)
			e.preventDefault()
	}

	const formatDirectionsMd = (
		list: {
			from?: string | null
			to?: string | null
			date?: string | null
			returnDate?: string | null
			passengers?: number | string | null
			guests?: number | string | null
			hours?: number | string | null
		}[],
	) =>
		list.length
			? list
					.map((d, i) => {
						const rows: string[] = []
						const add = (label: string, value: unknown) => {
							if (value !== null && value !== undefined && value !== '')
								rows.push(`*${label}:* ${mdEscape(String(value))}`)
						}
						add('From', d.from)
						add('To', d.to)
						add('Date', d.date)
						add('Return', d.returnDate)
						add('Passengers', d.passengers)
						add('Guests', d.guests)
						add('Hours', d.hours)
						return `*${i + 1}\\. Direction*` + '\n' + rows.join('\n')
					})
					.join('\n\n')
			: '*No directions*'

	const onSubmit = async (data: FormData) => {
		const url = `https://${host}${pathname}`
		const msg = [
			'*🚀  New Booking Request*',
			'──────────────',
			`👤 *Name:* ${mdEscape(data.name)}`,
			`🌐 *Locale:* ${mdEscape(locale)}`,
			`💼 *Component:* ${mdEscape(bookingType)}`,
			'',
			`📞 *Phone:* \`${mdEscape(data.phone_number.replaceAll(' ', ''))}\``,
			`✉️ *Email:* ${mdEscape(data.email)}`,
			'',
			data.tags?.length ? `🏷️ *Tags:* ${mdEscape(data.tags.join(', '))}` : '🏷️ *Tags:* None',
			'',
			formatDirectionsMd(directions),
			'',
			`🔗 From ${mdEscape(url)}`,
		].join('\n')

		try {
			await sendMessage(msg, 'MarkdownV2')
		} finally {
			close()
		}
	}

	const selectCountry = (c: Country) => {
		setSelectedCountry(c)
		setOpen(false)
		setSearchTerm('')
		if (!phoneFieldValue.startsWith(c.code))
			setValue('phone_number', `${c.code} `, { shouldDirty: true })
	}

	if (showConfirm)
		return (
			<>
				<h2 className='text-center text-gray-900'>{t('confirm')}</h2>
				<Checkmark className='mx-auto my-10 h-20 text-orange-200' />
			</>
		)

	const chips =
		locale === 'ru'
			? ['Запрос на партнерство', 'пресс', 'другое']
			: ['Partnership request', 'press', 'other']

	return (
		<>
			<h2 className='text-center text-gray-900'>{t('title')}</h2>

			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6' noValidate>
					<div className='flex flex-col gap-1'>
						<label className='text-sm text-gray-900'>{t('name')}</label>
						<input
							{...register('name')}
							placeholder={t('name-placeholder')}
							type='text'
							className={`w-full border-b bg-transparent px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none ${
								errors.name
									? 'border-red-500 focus:border-red-500'
									: 'focus:border-gold border-gray-600'
							}`}
						/>
						{touchedFields.name && errors.name && (
							<p className='mt-1 text-xs text-red-500'>{errors.name.message}</p>
						)}
					</div>

					<div className='flex flex-col gap-1'>
						<label className='text-sm text-gray-900'>{t('phone-number')}</label>
						<div className='relative' ref={dropdownRef}>
							<input
								{...register('phone_number')}
								type='tel'
								value={phoneFieldValue === '+' ? '' : phoneFieldValue}
								onChange={handlePhoneChange}
								onKeyDown={preventPlusDeletion}
								onFocus={() => {
									if (phoneFieldValue === '') setValue('phone_number', '+')
								}}
								placeholder={phonePlaceholder}
								className={`w-full border-b bg-transparent py-2 pl-20 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none ${
									errors.phone_number
										? 'border-red-500 focus:border-red-500'
										: 'focus:border-gold border-gray-600'
								}`}
							/>

							<button
								type='button'
								tabIndex={-1}
								onClick={() => {
									setOpen((o) => !o)
									setTimeout(
										() =>
											dropdownRef.current
												?.querySelector<HTMLInputElement>('input[data-search]')
												?.focus(),
										0,
									)
								}}
								className='absolute inset-y-0 left-0 flex items-center gap-2 bg-transparent pl-4'
							>
								<Flag iso={selectedCountry.iso} className='h-4 w-4' />
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='h-3 w-3 text-gray-400'
								>
									<path
										fillRule='evenodd'
										d='M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z'
										clipRule='evenodd'
									/>
								</svg>
							</button>

							{open && (
								<div className='absolute left-0 top-full z-10 mt-[2px] w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-[0_6px_20px_rgba(0,0,0,0.08)]'>
									<div className='relative border-b border-gray-700'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
										>
											<circle cx='11' cy='11' r='8' />
											<line x1='21' y1='21' x2='16.65' y2='16.65' />
										</svg>
										<input
											data-search
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder='Search'
											autoFocus
											onKeyDown={(e) => {
												if (e.key === 'ArrowDown') {
													setActiveIdx((i) => Math.min(i + 1, filteredCountries.length - 1))
													e.preventDefault()
												} else if (e.key === 'ArrowUp') {
													setActiveIdx((i) => Math.max(i - 1, 0))
													e.preventDefault()
												} else if (e.key === 'Enter' && filteredCountries[activeIdx]) {
													selectCountry(filteredCountries[activeIdx])
												}
											}}
											className='w-full bg-transparent py-3 pl-12 pr-4 text-sm text-gray-300 placeholder-gray-400 focus:outline-none'
										/>
									</div>

									<ul className='max-h-60 overflow-y-auto'>
										{filteredCountries.map((c, i) => (
											<li
												key={c.iso}
												onMouseDown={() => selectCountry(c)}
												className={`flex cursor-pointer items-center gap-4 px-4 py-3 text-gray-300 first:rounded-t-xl last:rounded-b-xl last:border-b-0 ${
													i === activeIdx ? 'bg-gray-700' : 'hover:bg-gray-800'
												}`}
											>
												<Flag iso={c.iso} className='h-4 w-4 rounded-sm' />
												<span className='flex-1 text-sm'>
													{highlight(regionNames.of(c.iso) || c.name, searchTerm)}
												</span>
												<span className='text-sm font-semibold'>{c.code}</span>
											</li>
										))}

										{!filteredCountries.length && (
											<li className='px-4 py-3 text-sm text-gray-500'>{t('no-results')}</li>
										)}
									</ul>
								</div>
							)}
						</div>
						{touchedFields.phone_number && errors.phone_number && (
							<p className='mt-1 text-xs text-red-500'>{errors.phone_number.message}</p>
						)}
					</div>

					<div className='flex flex-col gap-1'>
						<label className='text-sm text-gray-900'>{t('email')}</label>
						<input
							{...register('email')}
							placeholder={t('email-placeholder')}
							type='email'
							className={`w-full border-b bg-transparent px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none ${
								errors.email
									? 'border-red-500 focus:border-red-500'
									: 'focus:border-gold border-gray-600'
							}`}
						/>
						{touchedFields.email && errors.email && (
							<p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>
						)}
					</div>

					<div className='flex flex-row flex-wrap gap-2 py-6'>
						{chips.map((tag) => (
							<Chip key={tag} value={tag} register={register('tags')}>
								{tag}
							</Chip>
						))}
					</div>

					<button type='submit' className='big self-center !px-24 text-black'>
						{t('send')}
					</button>
				</form>
			</FormProvider>
		</>
	)
}

interface ChipProps {
	value: string
	register: ReturnType<ReturnType<typeof useForm>['register']>
	children: React.ReactNode
}

const Chip = ({ register, value, children }: ChipProps) => {
	const uid = useId()

	return (
		<div>
			<input id={uid} type='checkbox' className='peer sr-only' value={value} {...register} />
			<label
				htmlFor={uid}
				className='rounded-full border border-gray-400 bg-background px-5 py-2 font-semibold uppercase transition-colors hover:border-gray-800 peer-checked:border-transparent peer-checked:bg-gold peer-checked:text-gray-100'
			>
				{children}
			</label>
		</div>
	)
}

export default BookingForm
