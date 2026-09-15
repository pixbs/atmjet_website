import type { Payload } from 'payload'

import { PAGE_SLUGS } from '../../src/collections/Pages'
import { DEFAULT_LOCALES, type Locale } from '../../src/i18n/locales'
import type { Page } from '../../src/payload-types'
import type { SeedOutcome } from './report'

/**
 * One published page per static route (issue #60, E2.5). The legacy yachts page crashed on
 * empty data, so every environment starts with something to render rather than nothing.
 *
 * Titles are placeholders an editor replaces; the English ones read as the legacy navigation
 * labels so the seeded site is recognisable. Sections land in the layout as each block's issue
 * ports them (E7); the copy is placeholder too, until the content migration (E10.3).
 */
const TITLES: Record<string, { en: string; ru: string }> = {
  '': { en: 'Home', ru: 'Главная' },
  aircraft: { en: 'Aircraft', ru: 'Самолёты' },
  atm_jet_group: { en: 'ATM JET Group', ru: 'Группа ATM JET' },
  business_agents: { en: 'Business agents', ru: 'Бизнес-агентам' },
  cargo_charter: { en: 'Cargo charter', ru: 'Грузовые перевозки' },
  citizens: { en: 'Citizens', ru: 'Гражданам' },
  empty_legs: { en: 'Empty legs', ru: 'Пустые перелёты' },
  group_charters: { en: 'Group charters', ru: 'Групповые перевозки' },
  medical_aviation: { en: 'Medical aviation', ru: 'Медицинская авиация' },
  partners: { en: 'Partners', ru: 'Партнёры' },
  sales_dept: { en: 'Sales department', ru: 'Отдел продаж' },
  sales_yachts: { en: 'Yachts for sale', ru: 'Яхты на продажу' },
  yachts: { en: 'Yacht charter', ru: 'Аренда яхт' },
}

/**
 * The languages a page answers in, where it is not every one (issue #149, section 4). The
 * legacy citizens page was Russian only and sent everybody else to the home page; nothing else
 * named a language at all.
 */
const AVAILABLE_LOCALES: Record<string, Locale[]> = { citizens: ['ru'] }

/**
 * The metadata the legacy site intended (issue #170). Only its home page ever exported any
 * (`docs/legacy-inventory.md` section 2.4); every other route falls back to its title and the
 * site description, which is what an editor then replaces in the admin.
 */
const META: Record<string, Record<string, { title: string; description: string }>> = {
  '': {
    en: {
      title: 'Private Jet Charter, Hire a Private Jet Worldwide',
      description:
        'Hire a private jet within a few hours.✈ Book a private jet London, and other cities and countries.',
    },
    ru: {
      title: 'Аренда частного самолета, заказать самолет в Москве и любой точке мира',
      description:
        'Арендовать частный самолет в течение нескольких часов.✈ заказать частный самолет в Москве, других городах и странах.',
    },
  },
}

/**
 * The pages the legacy ended with its contact section (issue #129, section 5). Ten of the
 * thirteen static routes: the home page, the group page and the business agents page closed
 * with something else.
 */
const CONTACT_US_PAGES = new Set([
  'aircraft',
  'cargo_charter',
  'citizens',
  'empty_legs',
  'group_charters',
  'medical_aviation',
  'partners',
  'sales_dept',
  'sales_yachts',
  'yachts',
])

/** What the two messenger cards said, hard-coded in the legacy section as a locale ternary. */
const MESSENGERS: Record<'telegram' | 'whatsapp', Record<'en' | 'ru', string>> = {
  telegram: {
    en: 'Manage your enquiries and bookings on go via private chat with our team',
    ru: 'Управляйте своими запросами и бронированиями на ходу через приватный чат с нашей командой',
  },
  whatsapp: {
    en: 'Get instant support and answers to your questions directly from our team',
    ru: 'Получайте мгновенную поддержку и ответы на ваши вопросы непосредственно от нашей команды',
  },
}

/**
 * What the two sections that carry the flight request are headed (issue #115, section 5). The
 * legacy read both from its catalogues, `form.title` and `transfer.title`; here they are an
 * editor's, so the seed writes what the legacy said.
 */
const MAKE_BOOKING: Record<'en' | 'ru', string> = {
  en: 'Book a flight',
  ru: 'Забронировать перелет',
}

const TRANSFER: Record<'en' | 'ru', string> = {
  en: 'Get VIP airport transfer as a gift from us',
  ru: 'Получите VIP-трансфер из аэропорта в подарок',
}

/**
 * The four pages the subpage hero opens (issue #112, `docs/legacy-inventory.md` section 5).
 * The citizens page passed no sentence at all, which is the shape the block has to keep.
 */
const HERO_PAGES: Record<string, Record<'en' | 'ru', string>> = {
  cargo_charter: {
    en: 'Freight where a scheduled service will not go.',
    ru: 'Грузы туда, куда не летают регулярные рейсы.',
  },
  citizens: { en: '', ru: '' },
  group_charters: {
    en: 'One aircraft for the whole party, at a price agreed once.',
    ru: 'Один самолёт на всю группу по цене, согласованной один раз.',
  },
  medical_aviation: {
    en: 'An intensive care unit at cruising altitude.',
    ru: 'Реанимация на высоте крейсерского полёта.',
  },
}

/**
 * The five reasons the home page stacked, which the business agents page stacked as well
 * (issue #147, section 4). The first two carry a figure and the other three do not, which is
 * the shape the legacy cards had; the words are placeholders until the content migration.
 */
const HOME_WHY_US: {
  figure?: string
  en: [string, string]
  ru: [string, string]
}[] = [
  {
    figure: '20',
    en: ['Years of experience', 'Charters out of the Gulf, Europe and the CIS since 2004.'],
    ru: ['Лет опыта', 'Чартеры из Залива, Европы и СНГ с 2004 года.'],
  },
  {
    figure: '16,000',
    en: ['Satisfied clients', 'Who came back, and sent the people they fly with.'],
    ru: ['Довольных клиентов', 'Которые вернулись и привели тех, с кем летают.'],
  },
  {
    en: ['Trusted by celebrities', 'Names that do not appear on a passenger list, and never have.'],
    ru: ['Нам доверяют знаменитости', 'Имена, которых нет в списке пассажиров и не было.'],
  },
  {
    en: [
      'Same-day departures',
      'Permits, slots and a crew, arranged between the call and the gate.',
    ],
    ru: [
      'Вылеты в тот же день',
      'Разрешения, слоты и экипаж — между звонком и выходом на посадку.',
    ],
  },
  {
    en: [
      'Commitment to excellence',
      'The cabin, the catering and the car, to the standard you set.',
    ],
    ru: ['Стремление к совершенству', 'Салон, кейтеринг и машина — по вашему стандарту.'],
  },
]

/**
 * What the group charters page stacked, straight into the container (issue #145, section 4).
 * Three of them, none with a figure, which is the shape the legacy cards had there.
 */
const GROUP_CHARTERS: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['One aircraft, one price', 'Agreed once for the whole party, however the seats fill.'],
    ru: [
      'Один борт, одна цена',
      'Согласована один раз на всю группу, как бы ни распределились места.',
    ],
  },
  {
    en: ['The schedule is yours', 'You say when it leaves; nothing else is being boarded.'],
    ru: ['Расписание — ваше', 'Вы называете время вылета; больше никого не сажают.'],
  },
  {
    en: ['Handled at both ends', 'Permits, catering and the cars, arranged before you arrive.'],
    ru: ['Оба конца на нас', 'Разрешения, кейтеринг и машины — до вашего приезда.'],
  },
]

/**
 * The reasons the cargo charter page stacks (issue #116, section 5). Three of them, because the
 * three shapes the card comes in are what a fixture is for: with a figure and a photograph, and
 * with neither.
 */
const WHY_US: {
  figure?: string
  withImage: boolean
  en: [string, string]
  ru: [string, string]
}[] = [
  {
    figure: '20+',
    withImage: true,
    en: ['Years in the air', 'Two decades of charters out of the Gulf, Europe and the CIS.'],
    ru: ['Лет в воздухе', 'Двадцать лет чартеров из Залива, Европы и СНГ.'],
  },
  {
    figure: '24/7',
    withImage: true,
    en: ['Answered at any hour', 'A manager who knows the flight, not a call centre.'],
    ru: ['Отвечаем в любой час', 'Менеджер, который знает рейс, а не колл-центр.'],
  },
  {
    withImage: false,
    en: ['A price agreed once', 'What is quoted is what is invoiced, fuel and handling in.'],
    ru: [
      'Цена, согласованная один раз',
      'Сколько названо, столько и в счёте, с топливом и наземкой.',
    ],
  },
]

/**
 * The features the medical aviation page shows (issue #118, section 5). Four of them, as the
 * legacy page passed.
 */
const KEY_FEATURES: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['An intensive care cabin', 'A stretcher, a ventilator and the monitoring beside it.'],
    ru: ['Реанимационная кабина', 'Носилки, аппарат ИВЛ и мониторинг рядом с ними.'],
  },
  {
    en: ['A doctor on board', 'The crew flies with the team the case needs, not the other way.'],
    ru: ['Врач на борту', 'Экипаж летит с той бригадой, которой требует случай.'],
  },
  {
    en: ['Wheels up in hours', 'Permits, slots and the ambulance at both ends, arranged here.'],
    ru: ['Вылет за часы', 'Разрешения, слоты и скорая с обеих сторон — на нас.'],
  },
  {
    en: ['Door to door', 'The flight is one leg of a journey that starts and ends at a bed.'],
    ru: ['От двери до двери', 'Перелёт — одно плечо пути, который начинается и кончается у койки.'],
  },
]

type Layout = NonNullable<Page['layout']>

/** What the seeded sections are built out of: the placeholder uploads and the pages they link to. */
interface Fixture {
  photo: number
  surface: number
  pages: ReadonlyMap<string, number>
}

/**
 * The privileges the group page stacks (issue #120, section 5), one per icon the legacy drew,
 * and the invitation under them.
 */
const PRIVILEGES: {
  icon: 'plane' | 'exchange' | 'diamond'
  en: [string, string]
  ru: [string, string]
}[] = [
  {
    icon: 'plane',
    en: [
      'A jet within three hours',
      'An aircraft ready at the nearest airport, whatever the hour.',
    ],
    ru: ['Самолёт за три часа', 'Борт готов в ближайшем аэропорту в любое время суток.'],
  },
  {
    icon: 'exchange',
    en: ['One price, agreed once', 'What is quoted is what is invoiced, with nothing added later.'],
    ru: [
      'Одна цена, согласованная один раз',
      'Сколько названо, столько и в счёте, без добавлений.',
    ],
  },
  {
    icon: 'diamond',
    en: ['The cabin as you left it', 'Crew, catering and cabin kept to the standard you set.'],
    ru: [
      'Салон таким, каким вы его оставили',
      'Экипаж, кейтеринг и салон — по заданному стандарту.',
    ],
  },
]

/** What the yachts promotion offers, in the three columns the legacy card carried. */
const YACHT_COLUMNS: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['The fleet', 'Motor yachts and sailing yachts from 20 to 100 metres.'],
    ru: ['Флот', 'Моторные и парусные яхты от 20 до 100 метров.'],
  },
  {
    en: ['The crew', 'Captain, chef and stewardesses chosen for the party aboard.'],
    ru: ['Экипаж', 'Капитан, шеф-повар и стюардессы под конкретную компанию.'],
  },
  {
    en: ['The week', 'Berths, permits and the transfer from the airport, arranged here.'],
    ru: ['Неделя', 'Стоянки, разрешения и трансфер из аэропорта — на нас.'],
  },
]

/**
 * The two tiles the legacy home page offered its trade visitors (issue #119, section 5). The
 * home page's own composition is E8.1's to settle (#134), so the fixture shows them on the
 * partners page, which has no sections of its own yet.
 */
const OPTIONS_TILES: { slug: string; dim: boolean; en: [string, string]; ru: [string, string] }[] =
  [
    {
      slug: 'business_agents',
      dim: false,
      en: ['For personal assistants', 'What we offer'],
      ru: ['Персональным ассистентам', 'Что мы предлагаем'],
    },
    {
      slug: 'partners',
      dim: true,
      en: ['For agencies', 'How we work together'],
      ru: ['Агентствам', 'Как мы работаем вместе'],
    },
  ]

/**
 * The five questions the legacy home page answered (issue #123, section 5). Placeholder copy an
 * editor replaces; the second answer carries a line break, which the block keeps.
 */
const FAQ: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['How soon can we fly?', 'Three hours from the call, once the crew and the slot are held.'],
    ru: ['Как скоро вылет?', 'Через три часа после звонка, когда экипаж и слот забронированы.'],
  },
  {
    en: [
      'What does the price include?',
      'The aircraft, the crew, fuel and handling.\nCatering and ground transfers are quoted beside it.',
    ],
    ru: [
      'Что входит в стоимость?',
      'Самолёт, экипаж, топливо и наземное обслуживание.\nКейтеринг и трансферы считаются отдельно.',
    ],
  },
  {
    en: ['Can we change the route?', 'Up to the moment the flight plan is filed, and often after.'],
    ru: ['Можно ли изменить маршрут?', 'До подачи плана полёта, а часто и после неё.'],
  },
  {
    en: ['Do you fly with pets?', 'In the cabin, on most of the fleet, with the papers arranged.'],
    ru: [
      'Летаете ли вы с животными?',
      'В салоне, на большей части флота, с оформленными документами.',
    ],
  },
  {
    en: ['How is payment made?', 'By transfer, by card, or by the arrangement the charter needs.'],
    ru: ['Как происходит оплата?', 'Переводом, картой или так, как требует конкретный чартер.'],
  },
]

/**
 * What the business agents page offers an agent, and the two documents under it (issue #131,
 * section 4). The legacy chose between two hard-coded PDF addresses by comparing the locale.
 */
const GUIDE_POINTS: { en: string; ru: string }[] = [
  {
    en: 'A desk that answers in minutes, at any hour, in the language your client writes in.',
    ru: 'Стол, который отвечает за минуты, в любой час, на языке вашего клиента.',
  },
  {
    en: 'Commission agreed before the quote goes out, and paid on the day the flight closes.',
    ru: 'Комиссия согласована до отправки предложения и выплачивается в день закрытия рейса.',
  },
]

const DOCUMENTS: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['Checklist for ordering a private jet', 'Download the checklist'],
    ru: ['Чек-лист для заказа частного самолёта', 'Скачать чек-лист'],
  },
  {
    en: ['ATM JET presentation', 'Download the presentation'],
    ru: ['Презентация ATM JET', 'Скачать презентацию'],
  },
]

/**
 * The two arms of the group the legacy `/atm_jet_group` page listed (issue #130, section 4),
 * each opening the part of the site it belongs to.
 */
const GROUP_CARDS: { slug: string; en: [string, string, string]; ru: [string, string, string] }[] =
  [
    {
      slug: 'aircraft',
      en: [
        'The fleet',
        'Owned and managed aircraft, from light jets to airliners.',
        'See the fleet',
      ],
      ru: [
        'Флот',
        'Собственные и управляемые борта, от лёгких джетов до лайнеров.',
        'Посмотреть флот',
      ],
    },
    {
      slug: 'sales_dept',
      en: [
        'Sales',
        'Buying, selling and managing an aircraft, with the paperwork.',
        'Talk to sales',
      ],
      ru: [
        'Продажи',
        'Покупка, продажа и управление бортом, вместе с документами.',
        'Связаться с отделом',
      ],
    },
  ]

/** The three advantages the legacy sales department page listed (issue #128, section 5). */
const ADVANTAGES: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['Valued honestly', 'What the aircraft is worth on the day, not what it cost to buy.'],
    ru: ['Честная оценка', 'Сколько борт стоит сегодня, а не сколько за него заплатили.'],
  },
  {
    en: ['Shown to buyers', 'A list of people who fly the type, not an advertisement.'],
    ru: ['Показ покупателям', 'Список тех, кто летает на этом типе, а не объявление.'],
  },
  {
    en: ['Closed properly', 'Escrow, export papers and the pre-buy inspection arranged here.'],
    ru: ['Корректное закрытие', 'Эскроу, экспортные документы и предпродажная инспекция — на нас.'],
  },
]

/** The price promise the legacy business agents page closed on (issue #125, section 5). */
const BEST_PRICE: Record<'en' | 'ru', [string, string, string]> = {
  en: [
    'The best price, or we say so',
    'We quote the aircraft an operator will actually fly, at the price they will actually fly it for.',
    'Ask for a quote',
  ],
  ru: [
    'Лучшая цена или прямой ответ',
    'Мы называем борт, который оператор действительно поднимет, и цену, по которой он это сделает.',
    'Запросить расчёт',
  ],
}

/** What the legacy yachts for sale page said it checks (issue #126, section 5). */
const INSPECTIONS: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['The hull', 'Out of the water, by a surveyor who works for you and not for the yard.'],
    ru: ['Корпус', 'На суше, сюрвейером, который работает на вас, а не на верфь.'],
  },
  {
    en: ['The engines', 'Hours read off the counters and compared with the log book.'],
    ru: ['Двигатели', 'Часы снимаются со счётчиков и сверяются с судовым журналом.'],
  },
  {
    en: ['The papers', 'Flag, registry and every lien against the boat, in writing.'],
    ru: ['Документы', 'Флаг, регистр и все обременения — в письменном виде.'],
  },
  {
    en: ['The interior', 'Every cabin photographed as it is, before anything is tidied away.'],
    ru: ['Интерьер', 'Каждая каюта снимается как есть, до того как что-то уберут.'],
  },
  {
    en: ['The sea trial', 'A day at sea with the systems under load, not at the dock.'],
    ru: ['Ходовые испытания', 'День в море с нагрузкой на системы, а не у причала.'],
  },
]

/**
 * What the citizens page says for itself beside the wordmark (issue #149, section 4). The legacy
 * read it from the hero's own translation key and drew it a section lower.
 */
const WORDMARK_NOTE: Record<'en' | 'ru', string> = {
  en: 'We are aware of the restrictions our clients from Russia face, and we can help you avoid any of them.',
  ru: 'Мы осведомлены о глобальных вызовах, включая санкции, и гарантируем, что они не станут преградой для ваших путешествий. Наша команда экспертов обеспечивает беспрепятственные чартерные перелеты из Москвы в любую точку мира.',
}

/**
 * How the company works with Russian citizens (issue #149, section 4): five reasons the legacy
 * passed with an empty figure and an empty heading, so that each card is its sentence alone.
 */
const CITIZENS_WHY_US: {
  title: Record<'en' | 'ru', string>
  cards: Record<'en' | 'ru', string>[]
} = {
  title: { en: 'How we work with citizens of Russia', ru: 'Как мы работаем с гражданами РФ?' },
  cards: [
    {
      en: 'We take charge of the correspondence around the sanctions lists and follow every change to the international rules.',
      ru: 'Мы прекрасно понимаем все тонкости взаимодействия с санкционными списками и тщательно следим за всеми изменениями в международных правилах.',
    },
    {
      en: 'We prepare every document a Russian passenger needs, and support you at each stage of the paperwork.',
      ru: 'Мы обеспечиваем оформление всех необходимых документов для русских пассажиров и предоставляем полную поддержку на каждом этапе.',
    },
    {
      en: 'We arrange the technical stops a route needs, planned around your preferences and the rules of each country.',
      ru: 'Мы организуем оптимальные технические остановки для ваших рейсов, планируя каждую с учётом ваших предпочтений и международных требований.',
    },
    {
      en: 'We find the lead passenger whose citizenship the flight calls for, so that every border is crossed in order.',
      ru: 'Мы подберём «основного» пассажира с необходимым гражданством, обеспечивая полное соответствие международным требованиям.',
    },
    {
      en: 'We accept payment in any form: bank transfer, a company account, or cryptocurrency.',
      ru: 'Мы принимаем любой вид оплаты, включая банковские переводы, корпоративные счета и криптовалюты.',
    },
  ],
}

/**
 * What the yachts for sale page settles before it shows a yacht (issue #141, section 4, item 2):
 * the four parameters the legacy `carousel` namespace named, in the block that carries them.
 */
const YACHT_PARAMETERS: {
  title: Record<'en' | 'ru', string>
  description: Record<'en' | 'ru', string>
  cards: { en: [string, string]; ru: [string, string] }[]
} = {
  title: {
    en: 'We will find you the right one',
    ru: 'Подберём для вас идеальный вариант',
  },
  description: {
    en: 'An introductory meeting first, to settle which parameters actually matter.',
    ru: 'Сначала встреча, чтобы понять, какие параметры действительно важны.',
  },
  cards: [
    {
      en: [
        'The architecture bureaux',
        'The designers whose drawings become the yacht you asked for.',
      ],
      ru: [
        'Работаем с лучшими бюро',
        'Дизайнеры, чьи чертежи становятся именно той яхтой, о которой вы просили.',
      ],
    },
    {
      en: [
        'The length it takes',
        'How many guests, how much crew, and how much comfort each of them needs.',
      ],
      ru: [
        'Подбираем длину под задачу',
        'Сколько гостей, сколько экипажа и сколько комфорта нужно каждому из них.',
      ],
    },
    {
      en: [
        'The price of the whole thing',
        'The transaction, the years of ownership, and what it is worth at the end of them.',
      ],
      ru: [
        'Считаем цену целиком',
        'Сделка, годы владения и то, сколько яхта будет стоить в конце.',
      ],
    },
    {
      en: ['What it earns back', 'A financial model, and the charter weeks that pay for a season.'],
      ru: [
        'Обеспечиваем доходность',
        'Финансовая модель и чартерные недели, которые окупают сезон.',
      ],
    },
  ],
}

/**
 * What the company does for a yacht it manages (issue #141, section 4, item 8): four reasons
 * under the heading the "twenty years" section above them already carries — the legacy passed
 * the same translation key to both, and the page reads with it twice.
 */
const YACHT_MANAGEMENT: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['A management calendar', 'A year of it, with the financial planning inside it.'],
    ru: ['Календарь управления', 'На год вперёд, вместе с финансовым планированием.'],
  },
  {
    en: ['A marketing plan for the year', 'Online and off, written before the season starts.'],
    ru: ['Годовой маркетинговый план', 'Онлайн и офлайн, составленный до начала сезона.'],
  },
  {
    en: [
      'The databases that matter',
      'Every yacht we manage, listed where the brokerages actually look.',
    ],
    ru: [
      'Лучшие места в базах',
      'Каждая яхта под управлением — там, где её действительно ищут брокеры.',
    ],
  },
  {
    en: [
      'The events, as partners',
      'The weeks our yachts are chartered are the weeks the events are running.',
    ],
    ru: [
      'Партнёрство с организаторами',
      'Недели, когда наши яхты в чартере, — это недели, когда идут мероприятия.',
    ],
  },
]

/**
 * The two quotations the legacy citizens page carried (issue #132, section 4): the press one
 * under the Forbes wordmark and the founder's under the company's own. His words were written
 * into the page in Russian only; here both languages have them.
 */
const QUOTES: { variant: 'press' | 'founder'; en: [string, string]; ru: [string, string] }[] = [
  {
    variant: 'press',
    en: [
      'The brokers who keep flying when the routes close are the ones who own the relationships, not the aircraft.',
      'Forbes on the private aviation market',
    ],
    ru: [
      'Летают дальше те брокеры, у кого есть связи, а не борта в собственности.',
      'Forbes о рынке деловой авиации',
    ],
  },
  {
    variant: 'founder',
    en: [
      'Since 2004 our mission at ATM JET has been to let clients fly without limits anywhere in the world, sanctions and restrictions notwithstanding. We cross any border so that our clients enjoy the best service on every flight.',
      'Artem Rumyantsev - founder of ATM JET',
    ],
    ru: [
      'С 2004 года наша миссия в ATM JET — обеспечивать клиентам возможность летать без ограничений по всему миру несмотря на санкции и ограничения. Мы преодолеваем любые границы, чтобы наши клиенты могли наслаждаться лучшим сервисом в каждом полете',
      'Артем Румянцев - основатель ATM JET',
    ],
  },
]

/**
 * The two full-screen heroes (issues #113 and #114, section 5). The sales one counts its
 * figures up; the charter page's shows no button at all, which is the shape the block keeps.
 */
const HERO_SALES: Record<
  'en' | 'ru',
  { overline: string; lines: [string, string][]; description: string; button: string }
> = {
  en: {
    overline: 'Aircraft sales',
    lines: [
      ['20+', 'years of deals'],
      ['500+', 'aircraft placed'],
    ],
    description: 'We sell the aircraft you fly.\nAnd we buy the one you fly next.',
    button: 'Talk to the desk',
  },
  ru: {
    overline: 'Продажа самолётов',
    lines: [
      ['20+', 'лет сделок'],
      ['500+', 'бортов продано'],
    ],
    description: 'Мы продаём борт, на котором вы летаете.\nИ покупаем тот, на котором полетите.',
    button: 'Связаться с отделом',
  },
}

/** The yachts hero, with the button on the sales page and without it on the charter one. */
const HERO_YACHTS: Record<
  'sales_yachts' | 'yachts',
  Record<
    'en' | 'ru',
    { overline: string; title: string; description: string; description2?: string; button?: string }
  >
> = {
  sales_yachts: {
    en: {
      overline: 'Yachts for sale',
      title: 'A yacht bought the way an aircraft is',
      description: 'Surveyed, valued and closed by the people who do it every week.',
      button: 'Ask about a yacht',
    },
    ru: {
      overline: 'Яхты на продажу',
      title: 'Яхта покупается так же, как борт',
      description: 'Осмотр, оценка и сделка — теми, кто делает это каждую неделю.',
      button: 'Спросить о яхте',
    },
  },
  yachts: {
    en: {
      overline: 'Yacht charter',
      title: 'The week that follows the flight',
      description: 'Motor and sailing yachts from 20 to 100 metres, crewed and provisioned.',
      description2: 'Berths, permits and the transfer from the airport are arranged here.',
    },
    ru: {
      overline: 'Аренда яхт',
      title: 'Неделя, которая следует за перелётом',
      description: 'Моторные и парусные яхты от 20 до 100 метров, с экипажем и снабжением.',
      description2: 'Стоянки, разрешения и трансфер из аэропорта — на нас.',
    },
  },
}

/**
 * The manager the partners and sales pages both introduce (issue #124, section 5), and the five
 * things they take off your hands. The legacy section read one string and split it on `;`.
 */
const PERSONAL_MANAGER: Record<
  'en' | 'ru',
  { title: string; description: string; chips: string[] }
> = {
  en: {
    title: 'A manager who knows the flight',
    description:
      'One person answers, whatever the hour and whatever the question: the aircraft, the permits, the car at the steps.',
    chips: ['Permits', 'Slots', 'Catering', 'Handling', 'Transfers'],
  },
  ru: {
    title: 'Менеджер, который знает рейс',
    description:
      'Отвечает один человек — в любой час и на любой вопрос: борт, разрешения, машина у трапа.',
    chips: ['Разрешения', 'Слоты', 'Кейтеринг', 'Наземка', 'Трансферы'],
  },
}

/** One card of the options selection: the words, without the photograph behind them. */
interface OptionCard {
  title: string
  description: string
  items: string[]
}

/**
 * What each department does for a buyer (issue #127, section 5), on the two pages the legacy
 * section appeared on. The legacy read one string per card and split it on ` \n`; these are rows.
 */
const OPTIONS: Record<
  'sales_dept' | 'sales_yachts',
  Record<'en' | 'ru', { title: string; cards: [OptionCard, OptionCard] }>
> = {
  sales_dept: {
    en: {
      title: 'Buying an aircraft, start to finish',
      cards: [
        {
          title: 'Legal department',
          description: 'Everything the transfer of an aircraft needs, prepared before you sign:',
          items: [
            'A letter of intent with its guarantees',
            'A lien check on the airframe',
            'The purchase agreement',
            'The change of ownership on the register',
            'Export and airworthiness certificates',
          ],
        },
        {
          title: 'Finance department',
          description: 'We negotiate on your side of the table and cost the years after it:',
          items: [
            'The tax jurisdiction the deal is best held in',
            'The insurance that covers how you fly',
            'What a year of ownership costs',
            'What the aircraft earns when you are not on it',
          ],
        },
      ],
    },
    ru: {
      title: 'Покупка самолёта — от первого письма до передачи',
      cards: [
        {
          title: 'Юридический отдел',
          description: 'Всё, что нужно для передачи борта, готово до вашей подписи:',
          items: [
            'Письмо о намерениях с гарантиями',
            'Проверка залога по борту',
            'Договор купли-продажи',
            'Смена собственника в реестре',
            'Экспортный сертификат и сертификат лётной годности',
          ],
        },
        {
          title: 'Финансовый отдел',
          description: 'Мы ведём переговоры на вашей стороне стола и считаем годы после сделки:',
          items: [
            'Налоговая юрисдикция, в которой сделку выгоднее держать',
            'Страхование под то, как вы летаете',
            'Стоимость года владения',
            'Доход от борта, когда вы не на нём',
          ],
        },
      ],
    },
  },
  sales_yachts: {
    en: {
      title: 'Buying a yacht, start to finish',
      cards: [
        {
          title: 'Legal department',
          description: 'The paperwork a hull changes hands on, ready before the survey ends:',
          items: [
            'A letter of intent with its guarantees',
            'A lien check on the hull',
            'The sale and purchase agreement',
            'The change of ownership on the register',
            'Registration under the flag that suits you',
          ],
        },
        {
          title: 'Finance department',
          description: 'What the yacht costs after the price is agreed:',
          items: [
            'The tax jurisdiction the deal is best held in',
            'The insurance that covers where you sail',
            'What a season of ownership costs',
            'The crew the yacht needs, and what they cost',
          ],
        },
      ],
    },
    ru: {
      title: 'Покупка яхты — от первого письма до передачи',
      cards: [
        {
          title: 'Юридический отдел',
          description: 'Документы, по которым яхта меняет владельца, готовы до конца осмотра:',
          items: [
            'Письмо о намерениях с гарантиями',
            'Проверка залога по корпусу',
            'Договор купли-продажи',
            'Смена собственника в реестре',
            'Регистрация под подходящим флагом',
          ],
        },
        {
          title: 'Финансовый отдел',
          description: 'Во что обходится яхта после того, как цена согласована:',
          items: [
            'Налоговая юрисдикция, в которой сделку выгоднее держать',
            'Страхование под то, где вы ходите',
            'Стоимость сезона владения',
            'Экипаж, который нужен яхте, и его стоимость',
          ],
        },
      ],
    },
  },
}

/** The sections a seeded page starts with; a page with no entry here starts with none. */
function layoutFor(slug: string, locale: 'en' | 'ru', fixture: Fixture): Layout {
  const sections: Layout = []
  const description = HERO_PAGES[slug]?.[locale]

  if (description !== undefined)
    sections.push({
      blockType: 'heroSubpage',
      title: TITLES[slug][locale],
      description,
      image: fixture.photo,
    })

  if (slug === '')
    sections.push({
      blockType: 'heroVideo',
      // The legacy overline, and the legacy headline, which its Russian and Ukrainian
      // catalogues left in English; the fixture carries the translation the site wanted.
      overline: 'ATM JET',
      title: locale === 'en' ? 'Flying private made simple' : 'Частные перелёты — это просто',
      // The path the legacy markup named; the file arrives with the assets of E5.12.
      video: '/video/background_full.mp4',
    })

  if (slug === 'aircraft')
    sections.push({
      blockType: 'heroAircraft',
      title: locale === 'en' ? 'We have access to over ' : 'Нам доступно более ',
      figure: '50,000',
      title2: locale === 'en' ? ' aircraft' : ' бортов',
      description:
        locale === 'en'
          ? 'Every type, in every region, with the operator vetted before the quote goes out.'
          : 'Любой тип в любом регионе, с проверкой оператора до того, как уйдёт расчёт.',
    })

  if (slug === 'aircraft')
    sections.push({
      blockType: 'contactCard',
      title: locale === 'en' ? 'Not sure which aircraft?' : 'Не знаете, какой борт нужен?',
      description:
        locale === 'en'
          ? 'Tell us the route, the party and the day, and a manager comes back with two or three that fit.'
          : 'Назовите маршрут, состав и день — менеджер вернётся с двумя-тремя подходящими бортами.',
      image: fixture.photo,
      cta: {
        label: locale === 'en' ? 'Ask a manager' : 'Спросить менеджера',
        source: 'Contact_us_aircraft',
      },
    })

  if (slug === 'empty_legs')
    sections.push({
      blockType: 'heroEmptyLegs',
      figure: '75%',
      title: locale === 'en' ? 'off the charter price' : 'от цены чартера',
      image: fixture.photo,
      subtitle: locale === 'en' ? 'The aircraft is going anyway' : 'Борт всё равно летит',
      description:
        locale === 'en'
          ? 'A repositioning flight sells its cabin at a fraction of what the same route costs chartered.'
          : 'Перегоночный рейс продаёт салон за долю того, во что обходится тот же маршрут в чартере.',
    })

  if (slug === 'partners')
    sections.push({
      blockType: 'heroPartners',
      title: locale === 'en' ? 'Clients who fly with us fly ' : 'Клиенты, летающие с нами, летают ',
      figure: '4x',
      title2: locale === 'en' ? ' more often' : ' чаще',
      description:
        locale === 'en'
          ? 'White label, insurance and payment handled by us, under your name.'
          : 'White label, страхование и платежи — на нас, под вашим именем.',
      image: fixture.photo,
    })

  if (slug === 'atm_jet_group')
    sections.push({
      blockType: 'heroGroup',
      chip: locale === 'en' ? 'Since 2004' : 'С 2004 года',
      title: locale === 'en' ? 'The group behind the flight' : 'Группа, которая стоит за рейсом',
      description:
        locale === 'en'
          ? 'Charter, sales, management and yachts, run by the people who answer your call.'
          : 'Чартер, продажи, управление и яхты — теми, кто отвечает на ваш звонок.',
    })

  if (slug === 'sales_dept') {
    const hero = HERO_SALES[locale]
    sections.push({
      blockType: 'heroSales',
      overline: hero.overline,
      lines: hero.lines.map(([figure, text]) => ({ figure, text })),
      description: hero.description,
      image: fixture.photo,
      cta: { label: hero.button, source: 'Hero_sales' },
    })
  }

  if (slug === 'empty_legs')
    sections.push({
      blockType: 'descriptor',
      title: locale === 'en' ? 'What an empty leg is' : 'Что такое пустой перелёт',
      description:
        locale === 'en'
          ? 'A flight that has to be made anyway, with the cabin going the same way you are.'
          : 'Рейс, который всё равно состоится, и салон летит в ту же сторону, что и вы.',
    })

  if (slug === 'empty_legs')
    sections.push({
      blockType: 'emptyLegs',
      title: locale === 'en' ? 'Flights leaving soon' : 'Ближайшие перелёты',
      description:
        locale === 'en'
          ? 'The cabin is going anyway, and the price says so. New ones appear as the schedule changes.'
          : 'Салон всё равно летит, и цена это отражает. Новые появляются по мере изменения расписания.',
      limit: 12,
      cta: {
        label: locale === 'en' ? 'Make a booking' : 'Забронировать',
        source: 'Empty-legs',
      },
      channel: {
        title: locale === 'en' ? 'Be the first to know' : 'Узнавайте первыми',
        description:
          locale === 'en'
            ? 'Every empty leg is posted to the Telegram channel the hour it is confirmed.'
            : 'Каждый пустой перелёт публикуется в Telegram-канале в час подтверждения.',
        label: locale === 'en' ? 'Open the channel' : 'Открыть канал',
      },
    })

  if (slug === 'sales_yachts' || slug === 'yachts') {
    const hero = HERO_YACHTS[slug][locale]
    sections.push({
      blockType: 'heroYachts',
      overline: hero.overline,
      title: hero.title,
      description: hero.description,
      description2: hero.description2,
      image: fixture.surface,
      cta: { label: hero.button, source: 'Hero_yachts' },
    })
  }

  if (slug === 'medical_aviation')
    sections.push({
      blockType: 'keyFeatures',
      title: locale === 'en' ? 'What is on board' : 'Что на борту',
      description:
        locale === 'en'
          ? 'The aircraft is fitted for the patient, not for the route.'
          : 'Самолёт оснащается под пациента, а не под маршрут.',
      cards: KEY_FEATURES.map((card) => ({
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })

  if (slug === 'cargo_charter')
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: locale === 'en' ? 'Why us' : 'Почему мы',
      description:
        locale === 'en'
          ? 'What a charter with us comes with, whatever is in the hold.'
          : 'Что входит в чартер с нами, что бы ни было в трюме.',
      cards: WHY_US.map((card) => ({
        figure: card.figure,
        title: card[locale][0],
        description: card[locale][1],
        image: card.withImage ? fixture.photo : undefined,
      })),
    })

  if (slug === 'sales_dept')
    sections.push({
      blockType: 'advantages',
      title: locale === 'en' ? 'Selling through us' : 'Продажа через нас',
      image: fixture.photo,
      cards: ADVANTAGES.map((card) => ({ title: card[locale][0], description: card[locale][1] })),
    })

  if (slug === 'partners')
    sections.push({
      blockType: 'optionsTiles',
      tiles: OPTIONS_TILES.flatMap((tile) => {
        const page = fixture.pages.get(tile.slug)

        return page === undefined
          ? []
          : [
              {
                image: fixture.photo,
                title: tile[locale][0],
                label: tile[locale][1],
                page,
                dim: tile.dim,
              },
            ]
      }),
    })

  if (slug === 'atm_jet_group')
    sections.push({
      blockType: 'groupCards',
      cards: GROUP_CARDS.flatMap((card) => {
        const page = fixture.pages.get(card.slug)

        return page === undefined
          ? []
          : [
              {
                title: card[locale][0],
                description: card[locale][1],
                label: card[locale][2],
                image: fixture.photo,
                page,
              },
            ]
      }),
    })

  if (slug === 'business_agents') {
    sections.push({
      blockType: 'guide',
      title: locale === 'en' ? 'For business agents' : 'Бизнес-агентам',
      heading: locale === 'en' ? 'What working with us gives you' : 'Что даёт работа с нами',
      points: GUIDE_POINTS.map((point) => ({ text: point[locale] })),
      image: fixture.photo,
    })
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: locale === 'en' ? 'Why select us?' : 'Почему выбирают нас?',
      cards: HOME_WHY_US.map((card) => ({
        figure: card.figure,
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
    sections.push({
      blockType: 'documents',
      documents: DOCUMENTS.map((document) => ({
        title: document[locale][0],
        label: document[locale][1],
        image: fixture.photo,
        // The real PDFs are mirrored into Media by E1.6; until then the placeholder stands in.
        file: fixture.photo,
      })),
    })
    sections.push({
      blockType: 'transfer',
      title: TRANSFER[locale],
      image: fixture.photo,
    })
    sections.push({
      blockType: 'bestPrice',
      title: BEST_PRICE[locale][0],
      description: BEST_PRICE[locale][1],
      image: fixture.photo,
      cta: { label: BEST_PRICE[locale][2], source: 'Best_price' },
    })
  }

  // Plain here and in a card on the citizens page below, which is the whole of the legacy
  // `isCard` (section 5).
  if (slug === 'group_charters') {
    sections.push({ blockType: 'makeBooking', title: MAKE_BOOKING[locale], variant: 'plain' })
    sections.push({
      blockType: 'whyUs',
      variant: 'bare',
      cards: GROUP_CHARTERS.map((card) => ({
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
  }

  // The yachts for sale page down to the services it offers, in the legacy order (issue #141,
  // section 4): the parameters, the line between them and the listings, the listings, and what
  // is looked at before one is listed.
  if (slug === 'sales_yachts') {
    sections.push({
      blockType: 'keyFeatures',
      title: YACHT_PARAMETERS.title[locale],
      description: YACHT_PARAMETERS.description[locale],
      cards: YACHT_PARAMETERS.cards.map((card) => ({
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
    sections.push({
      blockType: 'framedDescriptor',
      title:
        locale === 'en'
          ? 'Every yacht we list, we have stood on'
          : 'На каждой яхте из списка мы стояли сами',
    })
    sections.push({
      blockType: 'recentYachts',
      title: locale === 'en' ? 'Recently listed' : 'Недавно выставленные',
      limit: 8,
    })
    sections.push({
      blockType: 'weInspect',
      title: locale === 'en' ? 'What we inspect' : 'Что мы проверяем',
      slides: INSPECTIONS.map((slide) => ({
        title: slide[locale][0],
        description: slide[locale][1],
        image: fixture.photo,
      })),
    })
  }

  // The citizens page in the order the legacy file had it (issue #149, section 4): what the
  // company says for itself, the two quotations, the invitation in its card, and the reasons.
  if (slug === 'citizens') {
    sections.push({ blockType: 'wordmarkNote', note: WORDMARK_NOTE[locale] })

    for (const entry of QUOTES)
      sections.push({
        blockType: 'quote',
        variant: entry.variant,
        quote: entry[locale][0],
        attribution: entry[locale][1],
      })

    sections.push({ blockType: 'makeBooking', title: MAKE_BOOKING[locale], variant: 'card' })
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: CITIZENS_WHY_US.title[locale],
      cards: CITIZENS_WHY_US.cards.map((card, index) => ({
        description: card[locale],
        // The third card asked for a file that was never there; the decision of issue #149 is
        // that nothing replaces it (section 13, entry 76).
        image: index === 2 ? undefined : fixture.photo,
      })),
    })
  }

  // Eight, as the legacy grid sliced one picture into eight, on the one page that had it. Far
  // down it, as the legacy grid was: it is scrolled to, not landed on.
  if (slug === '')
    sections.push({
      blockType: 'tiles',
      // The two placeholders in turn, so the cells of the grid can be told apart; the legacy
      // eight were eight slices of one picture.
      tiles: Array.from({ length: 8 }, (_, index) => ({
        image: index % 2 === 0 ? fixture.photo : fixture.surface,
      })),
    })

  // Last on the home page, the one page the legacy drew it on (issue #123, section 5).
  if (slug === '')
    sections.push({
      blockType: 'faq',
      title: locale === 'en' ? 'Questions we are asked' : 'Что нас спрашивают',
      questions: FAQ.map((entry) => ({ question: entry[locale][0], answer: entry[locale][1] })),
    })

  const yachts = fixture.pages.get('yachts')
  if (slug === 'atm_jet_group' && yachts !== undefined)
    sections.push({
      blockType: 'yachtsPromo',
      title: locale === 'en' ? 'Yachts' : 'Яхты',
      description:
        locale === 'en'
          ? 'The same crew arranges the week that follows the flight.'
          : 'Та же команда организует неделю, которая следует за перелётом.',
      image: fixture.photo,
      columns: YACHT_COLUMNS.map((column) => ({
        title: column[locale][0],
        description: column[locale][1],
      })),
      invitation: {
        image: fixture.photo,
        title: locale === 'en' ? 'Tell us the week and the water' : 'Назовите неделю и место',
        label: locale === 'en' ? 'See the fleet' : 'Посмотреть флот',
        page: yachts,
      },
    })

  if (slug === 'partners' || slug === 'sales_dept') {
    const manager = PERSONAL_MANAGER[locale]
    sections.push({
      blockType: 'personalManager',
      title: manager.title,
      description: manager.description,
      image: fixture.photo,
      chips: manager.chips.map((label) => ({ label })),
    })
  }

  if (slug === 'sales_dept' || slug === 'sales_yachts') {
    const options = OPTIONS[slug][locale]
    sections.push({
      blockType: 'optionsSelection',
      title: options.title,
      cards: options.cards.map((card) => ({
        title: card.title,
        description: card.description,
        image: fixture.photo,
        items: card.items.map((text) => ({ text })),
      })),
    })
  }

  // The twenty years, and what they buy a yacht under management. The legacy gave both the same
  // heading, so the page says it twice (section 4, items 7 and 8).
  if (slug === 'sales_yachts') {
    const years = locale === 'en' ? 'Twenty years on the water' : 'Двадцать лет на воде'
    sections.push({
      blockType: 'photoDescriptor',
      title: years,
      description:
        locale === 'en'
          ? 'The same brokers, the same yards, and a list of buyers who answer the telephone.'
          : 'Те же брокеры, те же верфи и список покупателей, которые берут трубку.',
      image: fixture.photo,
    })
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: years,
      cards: YACHT_MANAGEMENT.map((card) => ({
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
  }

  if (slug === 'atm_jet_group')
    sections.push({
      blockType: 'privilege',
      title: locale === 'en' ? 'What flying with us' : 'Что даёт полёт',
      goldTitle: locale === 'en' ? 'comes with' : 'с нами',
      cards: PRIVILEGES.map((card) => ({
        icon: card.icon,
        title: card[locale][0],
        description: card[locale][1],
      })),
      contact: {
        title: locale === 'en' ? 'Tell us where you are going' : 'Расскажите, куда летите',
        description:
          locale === 'en'
            ? 'A manager answers within minutes, at any hour, in either language.'
            : 'Менеджер отвечает в течение нескольких минут, в любой час, на любом языке.',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        background: fixture.surface,
      },
    })

  // Last on every page that carried it, which is where the legacy put it (section 5).
  if (CONTACT_US_PAGES.has(slug))
    sections.push({
      blockType: 'contactUs',
      telegram: { title: 'Telegram', description: MESSENGERS.telegram[locale] },
      whatsapp: { title: 'Whatsapp', description: MESSENGERS.whatsapp[locale] },
      hours: locale === 'en' ? 'Telephone line is open 24/7' : 'Телефонная линия открыта 24/7',
      source: 'Contact_us',
    })

  return sections
}

/**
 * The same sections in another language, keeping every id the English write handed out. Payload
 * matches a block, and a row inside it, by id; a write without them replaces the rows instead of
 * translating them, and the English words go with the rows that held them.
 */
function translated(layout: Layout | null | undefined, slug: string, fixture: Fixture): Layout {
  return layoutFor(slug, 'ru', fixture).map((block, index) => {
    const written = layout?.[index]
    const id = written?.id
    const rows = written && 'cards' in written ? written.cards : undefined

    // One case per block type: a spread over the union widens every field back to optional.
    switch (block.blockType) {
      case 'advantages':
        return {
          ...block,
          id,
          cards: withRowIds(
            block.cards ?? [],
            written?.blockType === 'advantages' ? written.cards : undefined,
          ),
        }
      case 'bestPrice':
        return { ...block, id }
      case 'contactCard':
        return { ...block, id }
      case 'contactUs':
        return { ...block, id }
      case 'descriptor':
        return { ...block, id }
      case 'documents':
        return {
          ...block,
          id,
          documents: withRowIds(
            block.documents ?? [],
            written?.blockType === 'documents' ? written.documents : undefined,
          ),
        }
      case 'emptyLegs':
        return { ...block, id }
      case 'faq':
        return {
          ...block,
          id,
          questions: withRowIds(
            block.questions ?? [],
            written?.blockType === 'faq' ? written.questions : undefined,
          ),
        }
      case 'framedDescriptor':
        return { ...block, id }
      case 'groupCards':
        return {
          ...block,
          id,
          cards: withRowIds(
            block.cards ?? [],
            written?.blockType === 'groupCards' ? written.cards : undefined,
          ),
        }
      case 'guide':
        return {
          ...block,
          id,
          points: withRowIds(
            block.points ?? [],
            written?.blockType === 'guide' ? written.points : undefined,
          ),
        }
      case 'heroAircraft':
        return { ...block, id }
      case 'heroEmptyLegs':
        return { ...block, id }
      case 'heroGroup':
        return { ...block, id }
      case 'heroPartners':
        return { ...block, id }
      case 'heroSales':
        return {
          ...block,
          id,
          lines: withRowIds(
            block.lines ?? [],
            written?.blockType === 'heroSales' ? written.lines : undefined,
          ),
        }
      case 'heroSubpage':
        return { ...block, id }
      case 'heroVideo':
        return { ...block, id }
      case 'heroYachts':
        return { ...block, id }
      case 'keyFeatures':
        return { ...block, id, cards: withRowIds(block.cards ?? [], rows) }
      case 'makeBooking':
        return { ...block, id }
      case 'optionsSelection': {
        const cards = written?.blockType === 'optionsSelection' ? written.cards : undefined

        return {
          ...block,
          id,
          // Two levels: a card keeps its id, and so does every row inside it.
          cards: (block.cards ?? []).map((card, index) => ({
            ...card,
            id: cards?.[index]?.id,
            items: withRowIds(card.items ?? [], cards?.[index]?.items),
          })),
        }
      }
      case 'optionsTiles':
        return {
          ...block,
          id,
          tiles: withRowIds(
            block.tiles ?? [],
            written?.blockType === 'optionsTiles' ? written.tiles : undefined,
          ),
        }
      case 'personalManager':
        return {
          ...block,
          id,
          chips: withRowIds(
            block.chips ?? [],
            written?.blockType === 'personalManager' ? written.chips : undefined,
          ),
        }
      case 'photoDescriptor':
        return { ...block, id }
      case 'privilege':
        return { ...block, id, cards: withRowIds(block.cards ?? [], rows) }
      case 'quote':
        return { ...block, id }
      case 'recentYachts':
        return { ...block, id }
      case 'tiles':
        return {
          ...block,
          id,
          // Nothing in a tile is localized, so the rows only need their ids back.
          tiles: withRowIds(
            block.tiles ?? [],
            written?.blockType === 'tiles' ? written.tiles : undefined,
          ),
        }
      case 'transfer':
        return { ...block, id }
      case 'weInspect':
        return {
          ...block,
          id,
          slides: withRowIds(
            block.slides ?? [],
            written?.blockType === 'weInspect' ? written.slides : undefined,
          ),
        }
      case 'whyUs':
        return { ...block, id, cards: withRowIds(block.cards ?? [], rows) }
      case 'wordmarkNote':
        return { ...block, id }
      case 'yachtsPromo':
        return {
          ...block,
          id,
          columns: withRowIds(
            block.columns ?? [],
            written?.blockType === 'yachtsPromo' ? written.columns : undefined,
          ),
        }
    }
  })
}

/** The rows of a section, wearing the ids the English write gave the same rows. */
function withRowIds<Row>(rows: Row[], written: { id?: string | null }[] | null | undefined): Row[] {
  return rows.map((row, index) => ({ ...row, id: written?.[index]?.id }))
}

/**
 * Gives a page that predates a block the sections that block's issue seeds, appended after the
 * ones it already has and leaving those alone: a database seeded between two block issues would
 * otherwise never see the second one, and an editor's words are not the fixture's to overwrite.
 */
async function addSections(
  payload: Payload,
  page: Page,
  slug: string,
  fixture: Fixture,
): Promise<'updated' | 'unchanged'> {
  const current = page.layout ?? []
  const has = new Set(current.map((block) => block.blockType))
  const missing = layoutFor(slug, 'en', fixture).filter((block) => !has.has(block.blockType))
  if (missing.length === 0) return 'unchanged'

  const id = page.id
  const written = await payload.update({
    collection: 'pages',
    id,
    data: { layout: [...current, ...missing] },
    locale: 'en',
    overrideAccess: true,
    context: { skipRevalidation: true },
  })

  for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en'))
    await payload.update({
      collection: 'pages',
      id,
      data: { layout: translated(written.layout, slug, fixture) },
      locale,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

  return 'updated'
}

/** A placeholder upload the seeded sections draw, by the filename `seedMedia` gave it. */
async function upload(payload: Payload, filename: string): Promise<number> {
  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  return media.docs[0].id
}

export async function seedPages(payload: Payload): Promise<SeedOutcome[]> {
  // Every page first, then the sections: a section can point at another page (the yachts
  // promotion does), and the page it points at may come later in the list than it does.
  const created = await createPages(payload)
  const pages = await payload.find({
    collection: 'pages',
    limit: 0,
    depth: 0,
    select: { slug: true },
    overrideAccess: true,
  })
  const fixture: Fixture = {
    // The photograph every section shows, and the dark one the privileges panel is patterned with.
    photo: await upload(payload, 'seed-gold.png'),
    surface: await upload(payload, 'seed-surface.png'),
    pages: new Map(pages.docs.map((page) => [page.slug ?? '', page.id])),
  }

  const outcomes: SeedOutcome[] = []
  for (const slug of PAGE_SLUGS) {
    const page = await find(payload, slug)
    if (!page) continue

    // A page that predates a block takes the sections that block's issue adds, which is what
    // keeps the fixture reconciled rather than only idempotent (AGENTS.md §1.5).
    const action = await addSections(payload, page, slug, fixture)

    outcomes.push({
      collection: 'pages',
      key: slug === '' ? '(home)' : slug,
      action: created.has(slug) ? 'created' : action,
      id: page.id,
    })
  }

  return outcomes
}

/** One published page per static route, in every routed locale. Answers which ones it wrote. */
async function createPages(payload: Payload): Promise<Set<string>> {
  const created = new Set<string>()

  for (const slug of PAGE_SLUGS) {
    if (await find(payload, slug)) continue

    const page = await payload.create({
      collection: 'pages',
      data: {
        title: TITLES[slug].en,
        slug,
        layout: [],
        _status: 'published',
        availableLocales: AVAILABLE_LOCALES[slug],
        meta: META[slug]?.en,
      },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    // The other routed locales are translations of the same document, not new ones.
    for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en'))
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: TITLES[slug][locale as 'ru'], meta: META[slug]?.[locale] },
        locale,
        overrideAccess: true,
        context: { skipRevalidation: true },
      })

    created.add(slug)
  }

  return created
}

/** The page a route is served from, or nothing when the seed has not written it yet. */
async function find(payload: Payload, slug: string): Promise<Page | undefined> {
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  return result.docs[0]
}
