import type { Payload } from 'payload'

import { PAGE_LOCALES, PAGE_SLUGS } from '../../src/collections/Pages'
import { ALL_LOCALES, type Locale } from '../../src/i18n/locales'
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
const TITLES: Record<string, { en: string; ru: string; uk: string }> = {
  '': { en: 'Home', ru: 'Главная', uk: 'Головна' },
  aircraft: { en: 'Aircraft', ru: 'Самолёты', uk: 'Літаки' },
  atm_jet_group: { en: 'ATM JET Group', ru: 'Группа ATM JET', uk: 'ATM JET Group' },
  business_agents: { en: 'Business agents', ru: 'Бизнес-агентам', uk: 'Business agents' },
  cargo_charter: { en: 'Cargo charter', ru: 'Грузовые перевозки', uk: 'Вантажні перевезення' },
  citizens: { en: 'Citizens', ru: 'Гражданам', uk: 'Citizens' },
  empty_legs: { en: 'Empty legs', ru: 'Пустые перелёты', uk: 'Empty legs' },
  group_charters: { en: 'Group charters', ru: 'Групповые перевозки', uk: 'Group charters' },
  medical_aviation: { en: 'Medical aviation', ru: 'Медицинская авиация', uk: 'Медична авіація' },
  partners: { en: 'Partners', ru: 'Партнёры', uk: 'Партнери' },
  sales_dept: { en: 'Sales department', ru: 'Отдел продаж', uk: 'Sales department' },
  sales_yachts: { en: 'Yachts for sale', ru: 'Яхты на продажу', uk: 'Yachts for sale' },
  yachts: { en: 'Yacht charter', ru: 'Аренда яхт', uk: 'Оренда яхт' },
}

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
    uk: {
      title: 'Private Jet Charter, Hire a Private Jet Worldwide',
      description:
        'Hire a private jet within a few hours.✈ Book a private jet London, and other cities and countries.',
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
const MESSENGERS: Record<'telegram' | 'whatsapp', Record<Locale, string>> = {
  telegram: {
    en: 'Manage your enquiries and bookings on go via private chat with our team',
    ru: 'Управляйте своими запросами и бронированиями на ходу через приватный чат с нашей командой',
    uk: 'Manage your enquiries and bookings on go via private chat with our team',
  },
  whatsapp: {
    en: 'Get instant support and answers to your questions directly from our team',
    ru: 'Получайте мгновенную поддержку и ответы на ваши вопросы непосредственно от нашей команды',
    uk: 'Get instant support and answers to your questions directly from our team',
  },
}

/**
 * What the two sections that carry the flight request are headed (issue #115, section 5). The
 * legacy read both from its catalogues, `form.title` and `transfer.title`; here they are an
 * editor's, so the seed writes what the legacy said.
 */
const MAKE_BOOKING: Record<Locale, string> = {
  en: 'Book a flight',
  ru: 'Забронировать перелет',
  uk: 'Забронювати переліт',
}

const TRANSFER: Record<Locale, string> = {
  en: 'Get VIP airport transfer as a gift from us',
  ru: 'Получите VIP-трансфер из аэропорта в подарок',
  uk: 'Отримайте VIP-трансфер з аеропорту в подарунок',
}

/**
 * The four pages the subpage hero opens (issue #112, `docs/legacy-inventory.md` section 5).
 * The citizens page passed no sentence at all, which is the shape the block has to keep.
 */
const HERO_PAGES: Record<string, Record<Locale, { title: string; description: string }>> = {
  cargo_charter: {
    en: {
      title: 'Cargo charter',
      description:
        'Recognizing the critical need for speed in logistics, place your trust in the seasoned professionals of the airfreight industry. We ensure your cargo is transported safely and securely, maintaining the highest standards of service.',
    },
    ru: {
      title: 'Грузовой чартер',
      description:
        'Понимая критическую важность скорости в логистике, доверьтесь опыту профессионалов индустрии воздушных грузоперевозок для безопасной и надежной доставки вашего груза. Мы соблюдаем высочайшие стандарты качества обслуживания, обеспечивая эффективность и безопасность каждой отправки.',
    },
    uk: {
      title: 'Вантажний чартер',
      description:
        'Ми знаємо, як важлива швидкість. Довірте свій вантаж професіоналам у галузі авіаперевезень.',
    },
  },
  // The legacy passed this one an empty description and drew its words a section lower, in the
  // card beside the wordmark (section 4).
  citizens: {
    en: { title: 'For citizens of the Russian Federation', description: '' },
    ru: { title: 'Для граждан Российской Федерации', description: '' },
    uk: { title: 'Для громадян Російської Федерації', description: '' },
  },
  group_charters: {
    en: {
      title: 'Organizing group charters',
      description:
        'We know the intricacies of organizing group flights for business companies, music bands and sports teams.',
    },
    ru: {
      title: 'Организация групповых чартерных перевозок',
      description:
        'Мы знаем все тонкости организации групповых полетов для бизнес-групп, музыкальных групп и спортивных команд.',
    },
    uk: {
      title: 'Організація групових чартерних перевезень',
      description:
        'Ми знаємо всі тонкощі організації групових польотів для бізнес-компаній, музичних груп і спортивних команд.',
    },
  },
  medical_aviation: {
    en: {
      title: 'Medical aviation',
      description:
        'We will take care of everything while you take care of the people important to you',
    },
    ru: {
      title: 'Медицинский перелет',
      description: 'Мы позаботимся обо всем, пока вы заботитесь о важных для вас людях.',
    },
    uk: {
      title: 'Медичний переліт',
      description: 'Ми подбаємо про все, поки ви дбаєте про важливих для вас людей.',
    },
  },
}

/**
 * The five reasons the home page stacked, which the business agents page stacked as well
 * (issue #147, section 4), in the words the legacy `home-why-us` namespace held (issue #162).
 * The first two carry a figure and the other three do not, which is the shape the legacy cards
 * had.
 */
const HOME_WHY_US: {
  figure?: string
  en: [string, string]
  ru: [string, string]
  uk: [string, string]
}[] = [
  {
    figure: '20',
    en: [
      'Years of experience',
      'Since 2004, ATM JET has been a trusted provider of private aviation services, offering a wide array of tailored solutions, including VIP charters, cargo transportation, and specialized medical flights. With years of expertise, we ensure seamless and secure flights for all needs.',
    ],
    ru: [
      'Лет опыта',
      'С 2004г. компания ATM JET является лидером в обеспечении комфорта частных перелетов с 2004 года, предлагая расширить представление о путешествиях премиум-класса. Мы создаем уникальные решения для самых взыскательных клиентов.',
    ],
    uk: [
      'Років досвіду',
      'Компанія ATM JET є лідером у забезпеченні комфорту приватних перельотів з 2004 року, пропонуючи широкий спектр рішень, включно з груповими, вантажними та медичними рейсами.',
    ],
  },
  {
    figure: '16,000',
    en: [
      'Satisfied clients',
      'Over 16,000 clients trust ATM JET as their preferred partner for reliable business aviation services. Our commitment to excellence ensures seamless and personalized private jet solutions for corporate and individual needs.',
    ],
    ru: [
      'Довольных клиентов',
      'Мы гордимся тем, что заслужили доверие более 16 тыс клиентов, выбравших нас в качестве партнера обеспечивающего новый уровень сервиса в деловой авиации.',
    ],
    uk: [
      'Задоволених клієнтів',
      'Ми пишаємося тим, що заслужили довіру понад 16 000 клієнтів, які обрали нас як партнера в частині вирішення завдань у діловій авіації.',
    ],
  },
  {
    en: [
      'Trusted by celebrities',
      'ATM JET proudly serves a diverse clientele, including high-profile celebrities, business executives, football clubs, public corporations, and government officials. Our clients trust us to deliver unparalleled comfort and privacy, ensuring their business aviation needs are met with the highest standards.',
    ],
    ru: [
      'Нам доверяют знаменитости',
      'Мы гордимся работать с лидерами, включая знаменитостей, бизнесменов, спортивных звезд, лидеров корпораций и членов правительства. Ценим, как они доверяют нам свой комфорт.',
    ],
    uk: [
      'Нам довіряють знаменитості',
      'Для нас честь працювати з найрізноманітнішими клієнтами, включно зі знаменитостями, бізнесменами, спортивними зірками, лідерами корпорацій і членами уряду. Цінуємо як вони довіряють нам свій комфорт.',
    ],
  },
  {
    en: [
      'Same-day departures',
      "With 24/7 access to a global database of over 25,000 aircraft, ATM JET guarantees private jet availability within just 5 hours of booking. Whether for business or leisure, our extensive fleet ensures flexible and fast travel options to meet any client's needs.",
    ],
    ru: [
      'Вылеты в тот же день',
      'ATM JET предоставляет доступ к более чем 25 000 воздушных судов по всему миру. Наши клиенты могут выбрать дальнемагистральные лайнеры, джеты среднего класса или турбовинтовые самолеты и вылететь в течение 5 часов после бронирования, благодаря круглосуточной поддержке.',
    ],
    uk: [
      'Вильоти того ж дня',
      'Наш флот, що налічує понад 25 000 літаків, працює цілодобово, даючи змогу нашим клієнтам вилітати протягом 2 годин після бронювання.',
    ],
  },
  {
    en: [
      'Commitment to Excellence',
      'At ATM JET, we meticulously manage every detail of your private flight, ensuring exceptional service and seamless experiences. Our expertise in luxury aviation allows us to consistently exceed expectations and provide personalized solutions tailored to your needs.',
    ],
    ru: [
      'Стремление к совершенству',
      'Мы уделяем фанатичное внимание каждой детали, чтобы обеспечить высший уровень сервиса. Наш многолетний опыт в частной авиации позволяет нам не только удовлетворить, но и превзойти ваши ожидания при каждом полете.',
    ],
    uk: [
      'Робота до досконалості',
      'Ми з фанатичною увагою ставимося до кожної деталі, і наш досвід дає нам змогу щоразу перевершити ваші очікування.',
    ],
  },
]

/**
 * What the partners page offers, under a heading of its own (issue #148, section 4), in the
 * words the legacy `we-offer` namespace held (issue #162). Four of them, none with a figure,
 * which is the shape the legacy cards had there.
 */
const WE_OFFER: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: [
      'White label partnership',
      "Strengthen your brand by operating as a private air carrier under your own name, while leveraging ATM JET's expertise and resources. You gain access to over 25,000 aircraft worldwide, full operational support, and the flexibility to maintain your branding.",
    ],
    ru: [
      'White Label партнёрство',
      'Укрепите свой бренд, работая под собственным именем и используя ресурсы и профессионализм ATM JET. Ваш бренд получит все преимущества опытной чартерной компании без необходимости дополнительного управления.',
    ],
    uk: [
      'White Label партнерство',
      'Ми готові працювати повністю під вашим брендом, включно з усіма документами та комунікацією з пасажирами.',
    ],
  },
  {
    en: [
      'Pricing confidentiality',
      'ATM JET guarantees the highest level of discretion, ensuring your pricing policies remain fully confidential. We protect your business strategies and allow you to maintain full control over your pricing structure, offering secure and transparent operations.',
    ],
    ru: [
      'Гарантируем конфиденциальность цен',
      'Наша ценовая политика сохраняется в тайне. Готовы оформлять документы по согласованной вами цене и отправлять комиссионное вознаграждение',
    ],
    uk: [
      'Гарантуємо конфіденційність цін',
      'Наша цінова політика зберігається в таємниці. Готові оформляти документи за узгодженою вами ціною і відправляти комісійну винагороду',
    ],
  },
  {
    en: [
      'Affiliate program',
      'Maximize your earnings with ATM JET’s affiliate program. The more bookings you complete, the greater your discounts and commissions. We reward successful partnerships by offering increasing incentives that align with your business growth, ensuring mutual benefit.',
    ],
    ru: [
      'Партнёрские условия',
      'Увеличивайте свои доходы с каждым выполненным заказом благодаря нашей партнёрской программе. Мы предлагаем выгодные условия и повышаем комиссионные, поощряя успешное сотрудничество.',
    ],
    uk: [
      'Партнерські знижки',
      'Нашим партнерам ми пропонуємо гнучку систему знижок, що зростає від кількості залучених замовлень.',
    ],
  },
  {
    en: [
      'Payment flexibility',
      'ATM JET provides flexible payment solutions tailored to your needs. We accept various forms of payment, including bank transfers, corporate accounts, and cryptocurrency. This flexibility extends to commission payments, simplifying financial management for our partners.',
    ],
    ru: [
      'Принимаем любые формы платежей',
      'Принимаем любые формы оплаты как и готовы отправлять любые формы комиссионных вознаграждений.',
    ],
    uk: [
      'Приймаємо будь-які форми платежів',
      'Приймаємо будь-які форми оплати як і готові відправляти будь-які форми комісійних винагород.',
    ],
  },
]

/**
 * What the group charters page stacked, straight into the container (issue #145, section 4).
 * Three of them, none with a figure, which is the shape the legacy cards had there.
 */
const GROUP_CHARTERS: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: [
      'For business companies',
      'Interaction with each participant or organiser and office manager. Planes of any size. Organisation of departures from different cities, countries. Organising comfortable working areas to ensure productivity and convenience on the road.',
    ],
    ru: [
      'Для деловых перелетов',
      'Берем всю организацию на себя. Организуем коммуникацию с каждым участником, организатором и офис-менеджером. Подберем оптимальный самолет любого размера. Поможем построить план вылетов из разных городов и стран. На борту подготовим комфортные рабочие зоны для обеспечения продуктивности и удобства в перелете.',
    ],
    uk: [
      'Для ділових перельотів',
      'Беремо всю організацію на себе. Організуємо комунікацію з кожним учасником, організатором і офіс-менеджером. Підберемо оптимальний літак будь-якого розміру. Допоможемо побудувати план вильотів з різних міст, країн. На борту підготуємо комфортні робочі зони для забезпечення продуктивності та зручності в перельоті.',
    ],
  },
  {
    en: [
      'For music bands',
      'Trepidatiously treating the riders of the artists, taking into account their wishes throughout the tour. We strictly follow the tour schedule and guarantee you on-time flights. We guarantee confidentiality in flight',
    ],
    ru: [
      'Для музыкальных групп',
      'Трепетно относимся к райдерам артистов, учитываем их пожелания на протяжении всего тура. Мы строго соблюдаем график гастролей и проконтролируем своевременный вылет. Гарантируем конфиденциальность в полете',
    ],
    uk: [
      'Для музичних гуртів',
      'Трепетно ставимося до райдерів артистів, враховуємо їхні побажання протягом усього туру. Ми суворо дотримуємося графіка гастролей і проконтролюємо своєчасний виліт. Ми гарантуємо конфіденційність у польоті',
    ],
  },
  {
    en: [
      'For sports team',
      'We select spacious aircraft for comfortable team flights and necessary sports equipment. Menus on board according to all requirements of sports team nutritionists. Comfortable aircraft will keep you toned even after long flights.',
    ],
    ru: [
      'Для спортивных команд',
      'Мы предлагаем вместительные самолеты для комфортных командных перелетов и необходимого спортивного оборудования. Меню на борту соответствует всем требованиям диетологов спортивных команд. Уровень комфорта в наших самолетах позволит вам оставаться в тонусе, даже после многочасовых перелетов.',
    ],
    uk: [
      'Для спортивних команд',
      'Ми пропонуємо місткі літаки для комфортних командних перельотів і необхідного спортивного обладнання. Меню на борту відповідає всім вимогам дієтологів спортивних команд. Рівень комфорту в наших літаках дасть вам змогу залишатися в тонусі, навіть після багатогодинних перельотів.',
    ],
  },
]

const WHY_US: {
  figure?: string
  withImage: boolean
  en: [string, string]
  ru: [string, string]
  uk: [string, string]
}[] = [
  {
    withImage: true,
    en: [
      'Global coverage',
      "Our extensive access to cargo aircraft and a global network of trusted partners enables us to offer a wide variety of delivery options to any destination worldwide. Whether it's urgent air freight or specialized cargo, we provide flexible and efficient solutions tailored to meet your specific shipping needs.",
    ],
    ru: [
      'Глобальный охват',
      'Наш доступ к широкому парку грузовых самолетов и обширная сеть надежных партнеров позволяют предлагать разнообразные варианты доставки в любую точку мира. Независимо от срочности или сложности перевозки, мы обеспечиваем гибкие и эффективные решения, адаптированные под конкретные нужды клиента.',
    ],
    uk: [
      'Глобальне охоплення',
      'Наш доступ до вантажних літаків і велика мережа партнерів пропонують широкий вибір варіантів доставки в будь-який пункт призначення.',
    ],
  },
  {
    withImage: true,
    en: [
      'Personalized approach',
      'Our expert logistics team specializes in finding the most efficient solutions for any cargo type or route, no matter how complex. With years of experience and industry knowledge, we ensure that every shipment is handled with precision and care, optimizing both speed and cost-effectiveness.',
    ],
    ru: [
      'Индивидуальный подход',
      'Команда логистов ATM JET подбирает оптимальные решения для доставки любого груза, обеспечивая баланс между скоростью и стоимостью. Независимо от сложности маршрута, мы гарантируем эффективное выполнение задач благодаря нашему опыту и знаниям в логистике.',
    ],
    uk: [
      'Індивідуальний підхід',
      'Команда логістів ATM JET підбере найбільш ефективне за швидкістю і ціною рішення для доставки будь-якого вантажу незалежно від маршруту або складності.',
    ],
  },
  {
    withImage: false,
    en: [
      'Security',
      'We strictly adhere to the highest standards of security and confidentiality throughout the entire cargo transport process. From pickup to final delivery, we ensure that every shipment is protected with comprehensive safety protocols, ensuring both discretion and secure handling.',
    ],
    ru: [
      'Безопасность',
      'Мы обеспечиваем самые высокие стандарты безопасности и конфиденциальности на всех этапах транспортировки. Контроль каждого этапа доставки гарантирует полную защиту груза и соблюдение всех процедур. Благодаря строгим протоколам безопасности, каждый этап транспортировки находится под постоянным мониторингом, что гарантирует безопасность и конфиденциальность перевозок.',
    ],
    uk: [
      'Безпека',
      'Ми забезпечуємо найвищі стандарти безпеки та конфіденційності протягом усього процесу транспортування. Контроль кожного етапу.',
    ],
  },
  {
    withImage: false,
    en: [
      'Guarantees',
      'We guarantee strict adherence to all deadlines and terms of cargo transportation, ensuring that every shipment is delivered on time and according to specified conditions. Our commitment to a high level of service means we prioritize reliability and customer satisfaction in every aspect of our operations.',
    ],
    ru: [
      'Гарантии',
      'Мы гарантируем точное соблюдение всех сроков и условий перевозки, которые закреплены в договоре. Наша команда обеспечивает полное соответствие оговоренным обязательствам, чтобы каждая доставка была выполнена вовремя и в соответствии с договорными требованиями.',
    ],
    uk: ['Гарантії', 'Ми гарантуємо точне дотримання всіх термінів і умов перевезення. У договорі'],
  },
]

const KEY_FEATURES: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: [
      'Find a medical aircraft',
      'We will provide an aircraft equipped with the necessary medical equipment. Please forward the requirements from the clinic and doctor to us, and we will find an aircraft that meets your specifications.',
    ],
    ru: [
      'Подберем медицинский самолет',
      'Мы предоставим самолет с необходимым медицинским оборудованием. Пришлите нам требования от клиники и врача и мы подберем самолет укомплектованный под ваш запрос',
    ],
    uk: [
      'Підберемо медичний літак',
      'Ми надамо літак з необхідним медичним обладнанням. Надішліть нам вимоги від клініки та лікаря і ми підберемо літак укомплектований під ваш запит',
    ],
  },
  {
    en: [
      'Provide doctors on board',
      'We will organise documents for the accompanying doctor or find doctors with experience in accompanying medical flights.',
    ],
    ru: [
      'Обеспечим врачей на борту',
      'Оформим документы на сопровождающего врача или подберем врачей с опытом сопровождения медицинских перелетов.',
    ],
    uk: [
      'Забезпечимо лікарів на борту',
      'Оформимо документи на супроводжуючого лікаря або підберемо лікарів із досвідом супроводу медичних перельотів.',
    ],
  },
  {
    en: [
      'Emergency flight service',
      'We know that sometimes time is of the essence. We have access to air ambulances around the world. Fast.',
    ],
    ru: [
      'Организация срочных перелетов',
      'Мы знаем, что иногда время играет решающую роль. У нас есть доступ к воздушным судам скорой помощи по всему миру. Быстро.',
    ],
    uk: [
      'Організація термінових перельотів',
      'Ми знаємо, що іноді час відіграє вирішальну роль. У нас є доступ до повітряних суден швидкої допомоги по всьому світу. Швидко.',
    ],
  },
  {
    en: [
      'Transplant delivery',
      'We are able to deliver organs from any country. Our access to a network of medical aircraft allows us to safely deliver the transplant to the patient in a suitable environment, accompanied by a doctor.',
    ],
    ru: [
      'Доставка трансплантатов',
      'Мы можем доставить органы из любой страны. Наш доступ к сети медицинских самолетов позволяет безопасно доставить трансплантат пациенту в подходящих условиях, в сопровождении врача.',
    ],
    uk: [
      'Доставка трансплантатів',
      'Ми можемо доставити органи з будь-якої країни. Наш доступ до мережі медичних літаків дає змогу безпечно доставити трансплантат пацієнту у відповідних умовах, у супроводі лікаря.',
    ],
  },
]

/**
 * What the home page said a flight comes with (issue #134, section 4): the five cards the legacy
 * `key-features` namespace held, in its own order (issue #162). The legacy paired them with
 * pictures named after other cards; the pictures arrive with E5.12 and the pairing is theirs.
 */
const HOME_KEY_FEATURES: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: [
      'Pay any way you want, including crypto',
      'ATM JET offers flexible payment options, accepting transfers from individual and corporate bank accounts, as well as cryptocurrency. Our diverse payment methods make booking a private jet simple and convenient for all clients.',
    ],
    ru: [
      'Платите любым способом, включая криптовалюту',
      'ATM JET принимает все доступные формы оплаты, включая платежи с индивидуальных и корпоративных счетов в любой стране. Мы также поддерживаем оплату криптовалютами, такими как USDT, BTC и ETH, обеспечивая максимальную гибкость и удобство для наших клиентов.',
    ],
    uk: [
      'Платіть будь-яким способом, включно з криптовалютою',
      'Ми приймаємо будь-які доступні форми оплати: приймаємо платежі з індивідуальних рахунків, а так само з рахунків юридичних осіб у будь-якій країні. Так само приймаємо криптовалюти USDT, BTC, ETH.',
    ],
  },
  {
    en: [
      'ATM JET CRM',
      "With ATM JET's personalized CRM system, simply share your preferences once, and we'll ensure every detail is tailored to your liking for all future flights. Experience seamless, custom service every time you board your private jet.",
    ],
    ru: [
      'ATM JET CRM',
      'С системой ATM JET CRM достаточно один раз сообщить ваши предпочтения, и мы позаботимся о том, чтобы каждый полет был организован в соответствии с вашими пожеланиями. Мы гарантируем индивидуальный подход и максимальный комфорт при каждом бронировании.',
    ],
    uk: [
      'ATM JET CRM',
      'З нашою системою ATM JET CRM буде достатньо один раз розповісти нам про свої вподобання, і ми потурбуємося про те, щоб кожного разу, коли ви сідаєте на борт, - все було підготовлено так, як вам подобається.',
    ],
  },
  {
    en: [
      'Customized aircraft and crew',
      'ATM JET carefully selects the ideal aircraft and experienced crew for each airport, ensuring maximum comfort and safety for every flight. Our commitment to high standards guarantees a seamless, luxurious experience tailored to your travel needs.',
    ],
    ru: [
      'Безопасность полета',
      'ATM JET предлагает воздушные суда с экипажами, которые прошли все технические проверки и имеют необходимые сертификаты для безопасных полетов. Мы строго соблюдаем стандарты безопасности, чтобы гарантировать вам надежный и комфортный полет. Ваша безопасность — наш главный приоритет.',
    ],
    uk: [
      'Підбір літака та екіпажу',
      'Для кожної подорожі ми підбираємо найбільш підходящий літак і екіпаж, з урахуванням особливостей аеропортів і вашого запиту, щоб гарантувати найвищі стандарти безпеки та комфорту.',
    ],
  },
  {
    en: [
      'Payment after the flight',
      'ATM JET offers flexible post-flight payment options to reward our loyal clients, providing convenience and ease in settling payments.',
    ],
    ru: [
      'Оплата после полета',
      'Постоянные клиенты ATM JET получают доступ к гибким условиям оплаты, включая возможность оплаты после полета. Мы создаем удобные финансовые решения, чтобы сделать ваш опыт частных авиаперелетов максимально комфортным.',
    ],
    uk: [
      'Оплата після польоту',
      'Нашим постійним клієнтам доступні гнучкі системи оплати, зокрема: оплата після польоту.',
    ],
  },
  {
    en: [
      'Best flight prices on popular destinations',
      "ATM JET offers the best prices on charter flights to the most popular resorts in Europe and Dubai. Travel to prestigious summer destinations like Saint-Tropez, Ibiza, and Monaco, or opt for elite winter resorts such as Courchevel, St. Moritz, and Zermatt. Whether it's a summer getaway or a winter retreat, ATM JET guarantees seamless, stylish travel to the world's top destinations.",
    ],
    ru: [
      'Лучшие цены по перелетам на популярных направлениях',
      'ATM JET предлагает лучшие цены на чартерные рейсы к популярным курортам Европы и Дубая. Летайте на престижные летние направления, такие как Сен-Тропе, Ибица и Монако, или выберите элитные зимние курорты — Куршевель, Санкт-Мориц и Церматт. Наслаждайтесь комфортом путешествий круглый год.',
    ],
    uk: [
      'Best flight prices on popular destinations',
      "ATM JET offers the best prices on charter flights to the most popular resorts in Europe and Dubai. Travel to prestigious summer destinations like Saint-Tropez, Ibiza, and Monaco, or opt for elite winter resorts such as Courchevel, St. Moritz, and Zermatt. Whether it's a summer getaway or a winter retreat, ATM JET guarantees seamless, stylish travel to the world's top destinations.",
    ],
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
 * The privileges the home page and the group page stack (issue #120, section 5), one per icon
 * the legacy drew, in the words its `privilege` namespace held (issue #162).
 */
const PRIVILEGES: {
  icon: 'plane' | 'exchange' | 'diamond'
  en: [string, string]
  ru: [string, string]
  uk: [string, string]
}[] = [
  {
    icon: 'plane',
    en: [
      'Fly at cost',
      'ATM JET eliminates the standard brokerage commission, which typically ranges from 3-9%, allowing you to fly at the direct cost of hiring an aircraft. We offer the lowest prices in the industry, ensuring cost-effective private jet travel without hidden fees.',
    ],
    ru: [
      'Летайте по себестоимости',
      'Исключите стандартную брокерскую комиссию в 3-9% и летайте по прямым ценам от авиаперевозчиков. ATM JET предлагает лучшие цены в индустрии, обеспечивая экономию без ущерба для качества и комфорта.',
    ],
    uk: [
      'Літайте за собівартість',
      'Виключіть стандартну брокерську комісію 3-9% та літайте за цінами безпосередньо від перевізників. Найкращі ціни.',
    ],
  },
  {
    icon: 'exchange',
    en: [
      'We provide assistance with payments and transfers.',
      'We offer a range of multi-currency accounts in various countries, including cryptocurrency accounts, and serve a diverse customer base with varying payment methods. We provide our international customers with assistance with currency exchange and transit.',
    ],
    ru: [
      'Помощь в оплате и переводе.',
      'ATM JET предлагает мультивалютные счета в разных странах, включая криптовалютные счета, чтобы удовлетворить любые предпочтения клиентов по оплате. Мы также предоставляем помощь в транзите и обмене валют, обеспечивая максимальное удобство и гибкость в финансовых операциях.',
    ],
    uk: [
      'Допомога в оплаті та переказі.',
      'У нас є безліч мультивалютних рахунків у різних країнах (включно з криптовалютними рахунками) і клієнтів, які платять різними способами. Ми пропонуємо нашим користувачам допомогу в транзиті та обміні валют.',
    ],
  },
  {
    icon: 'diamond',
    en: [
      'VIP Flight Management',
      'ATM JET Privilege members enjoy the most flexible rescheduling and cancellation policies in the private aviation industry. Our exclusive terms offer peace of mind and unmatched convenience, ensuring your travel plans can adapt to any changes effortlessly.',
    ],
    ru: [
      'VIP Flight Management',
      'Участники программы ATM JET Privilege получают самые гибкие условия переноса и отмены рейсов в индустрии частной авиации. Наши эксклюзивные правила обеспечивают максимальное удобство и душевное спокойствие, позволяя легко адаптировать ваши планы к любым изменениям.',
    ],
    uk: [
      'VIP Flight Management',
      'Засновник ATM JET особисто проконтролює ваш VIP-рейс від початку до кінця, заощаджуючи ваш час і ресурси.',
    ],
  },
]

/** The heading over the privileges, which the legacy split so the second half carries the gold. */
const PRIVILEGE_HEADING: Record<Locale, { title: string; gold: string }> = {
  en: { title: 'Join the ', gold: 'ATM JET Privilege' },
  ru: { title: 'Присоединяйтесь к ', gold: 'ATM JET Privilege' },
  uk: { title: 'Приєднуйтесь до ', gold: 'ATM JET Privilege' },
}

/** The invitation under them, which the legacy drew over a photograph. */
const PRIVILEGE_CONTACT: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Contact Key Account Manager',
    description:
      'Leave your contact details and we will get in touch to tell you all the benefits of ATM JET Privilege',
  },
  ru: {
    title: 'Свяжитесь с менеджером по ключевым клиентам',
    description:
      'Оставьте свои контактные данные и мы свяжемся подробно рассказать Вам обо всех преимуществах ATM JET Privilege',
  },
  uk: {
    title: "Зв'яжіться з менеджером з ключових клієнтів",
    description:
      "Залиште свої контактні дані і ми зв'яжемося розповісти Вам про всі переваги ATM JET Privilege",
  },
}

/**
 * The yachts promotion the home page and the group page both carry (issue #121, section 5), in
 * the words the legacy `yachts` namespace held (issue #162) — a namespace that lives in
 * `atm_jet_group.json` although both pages read it.
 */
const YACHTS_PROMO: Record<
  Locale,
  { title: string; description: string; invitation: string; label: string }
> = {
  en: {
    title: 'ATM JET | Yachts',
    description: 'Yacht sales and charter, welcome to our yachts in Dubai and Europe.',
    invitation: 'Personalised yacht selection at Dubai office or online',
    label: 'Request now',
  },
  ru: {
    title: 'ATM JET | Yachts',
    description: 'Продажа и аренда яхт.',
    invitation: 'Индивидуальный подбор яхты в офисе в Дубае или онлайн',
    label: 'Оставить заявку',
  },
  uk: {
    title: 'ATM JET | Yachts',
    description: 'Продаж та оренда яхт.',
    invitation: 'Індивідуальний підбір яхти в офісі в Дубаї або онлайн',
    label: 'Записатися',
  },
}

/** What it offers, in the three columns the legacy card carried. */
const YACHT_COLUMNS: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: ['Yachts for sale', 'We have access to over 3000 luxury yachts worldwide.'],
    ru: ['Самый большой выбор яхт', 'У нас есть доступ к более чем 3000 роскошных по всему миру.'],
    uk: ['Найбільший вибір яхт', 'У нас є доступ до більш ніж 3000 розкішних по всьому світу.'],
  },
  {
    en: [
      'Expert knowledge',
      'We will assist you in the selection, valuation, and negotiation of a yacht. Our specialists and mechanics will take care of everything for you.',
    ],
    ru: [
      'Знаем все детали',
      'Мы поможем вам в выборе, оценке и переговорах по приобретению яхты. Наши специалисты и механики с опытом подбора свыше 15ти лет позаботятся обо всем за вас.',
    ],
    uk: [
      'Експертні знання',
      'Ми допоможемо вам у виборі, оцінці та переговорах з придбання яхти. Наші фахівці і механіки з досвідом підбору понад 15 років подбають про все за вас.',
    ],
  },
  {
    en: [
      'Charter yachts',
      'Enjoy your holiday on the water on our yachts in Europe and Dubai. Also on our partner yachts around the world.',
    ],
    ru: [
      'Аренда яхт',
      'Наслаждайтесь отдыхом на воде на наших яхтах в Европе и Дубае. А также на яхтах наших партнеров по всему миру.',
    ],
    uk: [
      'Оренда яхт',
      'Насолоджуйтесь відпочинком на воді на наших яхтах у Європі та Дубаї. А також на яхтах наших партнерів по всьому світу.',
    ],
  },
]

/**
 * The two tiles the legacy home page offered its trade visitors (issue #119, section 5), in the
 * words its `options` namespace held (issue #162): the heading, and the one label both carried.
 */
const OPTIONS_TILES: {
  slug: string
  dim: boolean
  en: [string, string]
  ru: [string, string]
  uk: [string, string]
}[] = [
  {
    slug: 'business_agents',
    dim: false,
    en: ['For personal assistants', 'Learn more'],
    ru: ['Для персональных ассистентов', 'Узнать больше'],
    uk: ['Для персонального ассистента', 'Дізнатися більше'],
  },
  {
    slug: 'partners',
    dim: true,
    en: ['For agencies & concierges', 'Learn more'],
    ru: ['Для агентств и консьерж-сервисов', 'Узнать больше'],
    uk: ['Для агентств і консьєрж-сервісів', 'Дізнатися більше'],
  },
]

/**
 * The five questions the legacy home page answered (issue #123, section 5), in its own words
 * (issue #162). Each answer keeps the line breaks the legacy split it on, which is what the
 * block draws and what the structured data of #173 carries; the stray zero-width joiners two of
 * them held are not reproduced, having never drawn anything.
 */
const FAQ: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: [
      'How do I order a plane and what documents are needed for this?',
      'Fill out the booking form and then the personal manager will call you to negotiate the cost of the flight.\nThe package of documents corresponds to the standard one for air travel, the only supplement will be a contract for the provision of a private flight.\nWe will send you a commercial offer with available aircraft on the chosen route. Next, you choose the option that takes into account all your wishes and we sign the lease of the aircraft.\nPayment is made in the way that suits you: bank transfer, cash, credit card.',
    ],
    ru: [
      'Как заказать самолет и какие документы для этого необходимы?',
      'Заполните форму бронирования, после чего вам позвонит персональный менеджер для согласования стоимости перелета.\nПакет документов соответствует стандартному для авиаперелетов, единственным дополнением будет договор на предоставление частного рейса.\nМы вышлем вам коммерческое предложение с доступными опциями по выбранному маршруту. Далее вы выбираете вариант, учитывающий все ваши пожелания, и мы подписываем договор аренды самолета.\nОплата производится удобным для вас способом: банковский перевод, наличные, кредитная карта, криптовалюты',
    ],
    uk: [
      'Як замовити літак і які документи для цього необхідні?',
      'Заповніть форму бронювання, після чого вам зателефонує персональний менеджер для узгодження вартості перельоту. Пакет документів відповідає стандартному для авіаперельотів, єдиним доповненням буде договір на надання приватного рейсу. Ми надішлемо вам комерційну пропозицію з доступними опціями за обраним маршрутом. Далі ви обираєте варіант, що враховує всі ваші побажання, і ми підписуємо договір оренди літака. Оплата здійснюється зручним для вас способом: банківський переказ, готівка, кредитна картка, криптовалюта',
    ],
  },
  {
    en: [
      'How much does it cost to rent a plane, the price?',
      'The cost of a private jet is calculated taking into account such factors as:\n- Class, type of aircraft\n- Jet basing\n- Preferable route\n- Features of the airports hosting the flight\n- Other individual wishes of the client, etc.',
    ],
    ru: [
      'Сколько стоит аренда самолета, цена?',
      'Стоимость частного самолета рассчитывается с учетом таких факторов, как:\n- Класс, тип самолета\n- Базирование самолета\n- Предпочтительный маршрут\n- Особенности аэропортов, принимающих рейс\n- Другие индивидуальные пожелания клиента и т.д.',
    ],
    uk: [
      'Скільки коштує оренда літака, ціна?',
      'Вартість приватного літака розраховується з урахуванням таких чинників, як:‍- клас, тип літака- базування літака- бажаний маршрут- особливості аеропортів, що приймають рейс - інші індивідуальні побажання клієнта і т.д.',
    ],
  },
  {
    en: [
      'Can I change the conditions of the booked flight?',
      'YES, AND YOU CAN RELY ON:\n- Individual approach\n- Provision of an airplane of any class\n- Worthy service on board\n- Operational route adjustment and making changes according to your wishes, full confidentiality.\nOne of the main tasks of business aviation is to provide high-quality services and provide several related services. We focus exclusively on customer requests.\nThe ATM JET business aviation center is ready to fulfill a whole range of tasks to create optimal conditions for the flight.',
    ],
    ru: [
      'Могу ли я изменить условия забронированного рейса?',
      "Для наших клиентов ответ чаще всего 'да':\n- Индивидуальный подход\n- Предоставление самолета любого класса\n- Достойное обслуживание на борту\n- Оперативная корректировка маршрута и внесение изменений в соответствии с вашими пожеланиями, полная конфиденциальность. Одна из главных задач бизнес-авиации\n- Предоставление качественного сервиса и оказание нескольких сопутствующих услуг. Мы ориентируемся исключительно на запросы клиентов.\nЦентр деловой авиации ATM JET готов выполнить весь спектр задач по созданию оптимальных условий для полета.",
    ],
    uk: [
      'Чи можу я змінити умови заброньованого рейсу?',
      'Для наших клієнтів відповідь найчастіше «так»:‍- Індивідуальний підхід- Надання літака будь-якого класу- Гідне обслуговування на борту- Оперативне коригування маршруту і внесення змін відповідно до ваших побажань, повна конфіденційність. Одне з головних завдань бізнес-авіації - надання якісного сервісу і надання декількох супутніх послуг. Ми орієнтуємося виключно на запити клієнтів. Центр ділової авіації ATM JET готовий виконати весь спектр завдань зі створення оптимальних умов для польоту.',
    ],
  },
  {
    en: [
      'How safe are individual private flights?',
      'A private plane and its lease should have personal security and confidentiality. ATM JET fully guarantees their compliance.\nInformation about the flight is available only to the client and a limited circle of our employees who are responsible for not disclosing the data known to them. In addition, renting an airplane excludes the possibility of the presence on board of undesirable people for you.\nYour "neighbors" during the flight will be only passengers invited by you, flight attendants, and the crew of the aircraft.\nThis is especially essential for representatives of show business and dignitaries. For transportation of passengers within the limits of rent of a private airplane our company uses modern and reliable transport. Absolutely all air assets are undergoing technical and service maintenance in a timely manner.',
    ],
    ru: [
      'Насколько безопасны частные полеты?',
      'Частный самолет и его аренда должны обеспечивать личную безопасность и конфиденциальность. ATM JET полностью гарантирует их соблюдение.\nИнформация о полете доступна только клиенту и ограниченному кругу наших сотрудников, которые несут ответственность за неразглашение известных им данных.\nКроме того, аренда самолета исключает возможность присутствия на борту нежелательных для вас людей. Вашими «соседями» во время полета будут только приглашенные вами пассажиры, стюардессы и экипаж самолета. Это особенно важно для представителей шоу-бизнеса и высокопоставленных лиц.\nДля перевозки пассажиров в рамках аренды частного самолета наша компания использует современный и надежный транспорт. Абсолютно все воздушные средства своевременно проходят техническое и сервисное обслуживание.',
    ],
    uk: [
      'Наскільки безпечні приватні польоти?',
      'Приватний літак і його оренда повинні забезпечувати особисту безпеку та конфіденційність. ATM JET повністю гарантує їх дотримання. Інформація про політ доступна тільки клієнту й обмеженому колу наших співробітників, які несуть відповідальність за нерозголошення відомих їм даних. Крім того, оренда літака виключає можливість присутності на борту небажаних для вас людей. Вашими «сусідами» під час польоту будуть тільки запрошені вами пасажири, стюардеси та екіпаж літака. Це особливо важливо для представників шоу-бізнесу та високопоставлених осіб. Для перевезення пасажирів у рамках оренди приватного літака наша компанія використовує сучасний і надійний транспорт. Абсолютно всі повітряні засоби своєчасно проходять технічне та сервісне обслуговування.',
    ],
  },
  {
    en: [
      'What are the rules for transporting pets on private planes?',
      'Please let us know when placing an order and our company will prepare everything you need beforehand.\nAlso for the transportation of pets in a private airplane, a veterinary certificate of Form No. 1 is required.',
    ],
    ru: [
      'Каковы правила перевозки домашних животных на частных самолетах?',
      'Пожалуйста, сообщите нам об этом при оформлении заказа, и наша компания заранее подготовит все необходимое.\nТакже для перевозки домашних животных в частном самолете необходимо ветеринарное свидетельство формы №1.',
    ],
    uk: [
      'Які правила перевезення домашніх тварин на приватних літаках?',
      'Будь ласка, повідомте нам про це під час оформлення замовлення, і наша компанія заздалегідь підготує все необхідне. Також для перевезення домашніх тварин у приватному літаку необхідне ветеринарне свідоцтво форми №1.',
    ],
  },
]

/**
 * What the business agents page offers an agent, and the two documents under it (issue #131,
 * section 4), in the words its `guide` and `documents` namespaces held (issue #162). The legacy
 * chose between two hard-coded PDF addresses by comparing the locale.
 */
const GUIDE_POINTS: { en: string; ru: string; uk: string }[] = [
  {
    en: 'At ATM JET, we understand the challenges personal assistants face when managing executive travel. Our goal is to support clients from the start of every task.',
    ru: 'Мы в ATM JET знаем, как много задач приходится решать бизнес-ассистенту. Мы поможем сделать организацию перелета простой и при этом не упустить ни малейшей детали.',
    uk: 'Ми в ATM JET знаємо, як багато завдань доводиться вирішувати бізнес-асистенту. Ми допоможемо зробити організацію перельоту простою і при цьому не упустити жодної найменшої деталі.',
  },
  {
    en: 'To make flight planning seamless, we’ve created a comprehensive flight preparation checklist. This guide helps you organize private jet flights easily, ensuring all executive preferences are met with precision.',
    ru: 'Мы составили для вас чек-лист подготовки к полету, он поможет вам легче организовать перелет, учитывая все пожелания вашего руководителя. Так же, мы за вас подготовим презентацию для вашего руководителя для комфорта принятия решения.',
    uk: 'Ми склали для вас контрольний список підготовки до польоту, він допоможе вам легше організувати переліт, враховуючи всі побажання вашого керівника. Так само ми складемо презентацію за вас для вашого керівника.',
  },
]

const DOCUMENTS: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: ['Checklist', 'Open guide'],
    ru: ['Чек-лист', 'Скачать чек-лист'],
    uk: ['Чекліст', 'Завантажити чек-ліст'],
  },
  {
    en: ['Presentation', 'Open guide'],
    ru: ['Презентация', 'Скачать пример'],
    uk: ['Презентація', 'Завантажити приклад'],
  },
]

/**
 * The two arms of the group the legacy `/atm_jet_group` page listed (issue #130, section 4),
 * in the words its `group1` and `group2` namespaces held (issue #162). Each opens the part of
 * the site it belongs to; the legacy hrefs were the ones that resolved to a double slash.
 */
const GROUP_CARDS: {
  slug: string
  en: [string, string, string]
  ru: [string, string, string]
  uk: [string, string, string]
}[] = [
  {
    slug: 'aircraft',
    en: ['ATM JET', 'Jet hire - from 10 flights every day.', 'Request now'],
    ru: ['ATM JET', 'Организуем аренду самолетов свыше 10 рейсов ежедневно.', 'Запросить сейчас'],
    uk: ['ATM JET', 'Організуємо оренду літаків понад 10 рейсів щодня.', 'Запросити зараз'],
  },
  {
    slug: 'sales_dept',
    en: [
      'ATM JET Market',
      'Sale of jets for companies and for private individuals.',
      'Request now',
    ],
    ru: ['ATM JET Sales Dept.', 'Продаем самолеты для компаний и частных лиц.', 'Узнать больше'],
    uk: [
      'ATM JET Sales Dept.',
      'Продаємо літаки для компаній і приватних осіб.',
      'Дізнатися більше',
    ],
  },
]

/**
 * What a team of mechanics does before a buyer signs (issue #128, section 5), in the words the
 * legacy `aircraft-descriptor` namespace held (issue #162).
 */
const ADVANTAGES: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: [
      'ABC check verification',
      'Mechanics review the reports for each ABC inspection and verify that the observations have been resolved.',
    ],
    ru: [
      'Проверка АВС',
      'Механики просматривают отчеты по каждой ABC проверке и проверяем устранение замечаний.',
    ],
    uk: [
      'Перевірка АВС',
      'Механіки переглядають звіти по кожній ABC перевірці та перевіряємо усунення зауважень.',
    ],
  },
  {
    en: [
      'Test flight evaluation',
      "Our certified technician will conduct a comprehensive test flight to assess the aircraft's performance and ensure it meets the highest standards of safety and efficiency.",
    ],
    ru: [
      'Проводят испытательный полет',
      'Специалист проводит испытательный полет и выдает комплексную оценку характеристик и состояния самолета.',
    ],
    uk: [
      'Проводимо випробувальний політ',
      'Спеціаліст проводить випробувальний політ і видає комплексну оцінку характеристик і стану літака.',
    ],
  },
  {
    en: [
      'Detailed inspection report',
      'After the inspection, we will provide a comprehensive report detailing any discrepancies found and the estimated cost of repairs.',
    ],
    ru: [
      'Подробный отчет о проверке',
      'По окончании проверки мы предоставим подробный отчет о найденных несоответствиях и стоимости их устранения.',
    ],
    uk: [
      'Докладний звіт про перевірку',
      'Після закінчення перевірки ми надамо детальний звіт про знайдені невідповідності та вартість їх усунення.',
    ],
  },
]

/** The price promise the legacy business agents page closed on (issue #125, section 5). */
const BEST_PRICE: Record<Locale, [string, string, string]> = {
  en: [
    'Best price assurance',
    'At ATM JET, we value your time and are dedicated to offering the most competitive prices in the private aviation market. Contact us today to receive the best price and personalized offers for your private jet charter needs.',
    'Contact us',
  ],
  ru: [
    'Гарантия лучшей цены',
    'Мы ценим ваше время и знаем, как обеспечить вам превосходный перелет по лучшей цене. Гарантируем самые конкурентные условия на рынке. Свяжитесь с нами, чтобы получить персонализированное предложение и лучшую цену среди конкурентов.',
    'Оставить заявку',
  ],
  uk: [
    'Гарантія найкращої ціни',
    'Ми цінуємо ваш час і знаємо як отримати чудовий переліт за найкращою ціною. Гарантуємо ціну серед конкурентів.',
    'Записатися',
  ],
}

/**
 * What the legacy yachts for sale page said it checks (issue #126, section 5), in the words its
 * `we-incpect` namespace held (issue #162). The namespace name is the legacy's own misspelling.
 */
const INSPECTIONS: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: [
      'Hull',
      'Inspection of the hull, deck, set, cabins and bulkheads, assessing for geometric changes and internal moisture.',
    ],
    ru: [
      'Корпус',
      'Осмотр корпуса, палубы, каюты, оценка геометрических изменений и оценка влажности корпуса.',
    ],
    uk: [
      'Корпус',
      'Огляд корпусу, палуби, каюти, оцінка геометричних змін і оцінка вологості корпусу.',
    ],
  },
  {
    en: ['Engine', 'Engine, engine compartment inspection, Computer diagnostics'],
    ru: ['Двигатель', 'Оценка работы двигателя, осмотр моторного отсека, компьютерная диагностика'],
    uk: ['Двигун', "Оцінка роботи двигуна, огляд моторного відсіку, комп'ютерна діагностика"],
  },
  {
    en: ['Electronics', 'Electrical systems, drains, taps, computers and navigation systems.'],
    ru: [
      'Электроника',
      'Оценка электрические системы, системы водостоков, состояния систем управления и навигационных систем.',
    ],
    uk: [
      'Електроніка',
      'Оцінка електричні системи, системи водостоків, стану систем управління та навігаційних систем.',
    ],
  },
  {
    en: ['Steering', 'Rudder, steering gear, Gearbox, shafting'],
    ru: ['Рулевое управление', 'Руль, рулевое управление, редуктор, валы'],
    uk: ['Рульове управління', 'Кермо, рульове управління, редуктор, вали'],
  },
  {
    en: [
      'Thermal imaging inspection',
      'Hull structure integrity, engine thermal inspection, electric',
    ],
    ru: [
      'Тепловизионная диагностика',
      'Целостность конструкции корпуса, тепловой контроль двигателя',
    ],
    uk: ['Тепловізійна діагностика', 'Цілісність конструкції корпусу, тепловий контроль двигуна'],
  },
]

/**
 * What managing an aircraft bought through the company comes with (issue #142, section 4,
 * item 6). The legacy stack was headed by the company's own name with the sentence under it,
 * and only its first card counted a figure up.
 */
const SALES_WHY_US: {
  description: Record<Locale, string>
  cards: { figure?: string; en: [string, string]; ru: [string, string]; uk: [string, string] }[]
} = {
  description: {
    en: 'Special management conditions apply to rental from ATM JET',
    ru: 'При приобретении воздушного судна в ATM JET действуют особые условия по управлению самолетом',
    uk: 'При придбанні повітряного судна в ATM JET діють особливі умови з управління літаком',
  },
  cards: [
    {
      figure: '5',
      en: ['Flights per month', 'We handle over 10 flights per month as a broker.'],
      ru: ['Рейсов в месяц', 'В качестве брокера мы обслуживаем более 10 рейсов в месяц.'],
      uk: ['Рейсів на місяць', 'Як брокер ми обслуговуємо понад 10 рейсів на місяць.'],
    },
    {
      en: [
        'Experienced fleet management',
        'Customised terms and conditions for the management of the purchased aircraft from ATM JET.',
      ],
      ru: [
        'Опытное управление авиапарком',
        'Индивидуальные условия по управлению приобретенным самолетом от ATM JET',
      ],
      uk: [
        'Дослідне управління авіапарком',
        'Індивідуальні умови з управління придбаним літаком від ATM JET',
      ],
    },
    {
      en: ['Market-leading yields', 'We offer the best yields in the market'],
      ru: ['Лучшие на рынке показатели доходности', 'Мы предлагаем лучшую доходность на рынке'],
      uk: [
        'Найкращі на ринку показники прибутковості',
        'Ми пропонуємо найкращу дохідність на ринку',
      ],
    },
  ],
}

/**
 * What the citizens page says for itself beside the wordmark (issue #149, section 4). The legacy
 * read it from the hero's own translation key and drew it a section lower.
 */
const WORDMARK_NOTE: Record<Locale, string> = {
  en: 'We are aware of the restrictions faced by our clients from Russia. And we can help you avoid any limitations.',
  ru: 'Мы осведомлены о глобальных вызовах, включая санкции, и гарантируем, что они не станут преградой для ваших путешествий. Наша команда экспертов обеспечивает беспрепятственные чартерные перелеты из Москвы в любую точку мира, гарантируя высочайший уровень сервиса и комфорта на всех этапах вашего путешествия.',
  uk: 'Ми знаємо про всі обмеження, з якими стикаються наші клієнти з Росії, і ми можемо допомогти вам отримати найкращий сервіс крізь будь-які кордони.',
}

/**
 * How the company works with Russian citizens (issue #149, section 4): five reasons the legacy
 * passed with an empty figure and an empty heading, so that each card is its sentence alone.
 */
const CITIZENS_WHY_US: {
  title: Record<Locale, string>
  cards: Record<Locale, string>[]
} = {
  title: {
    en: 'Why select us?',
    ru: 'Как мы работаем с гражданами РФ?',
    uk: 'Чому варто вибрати саме нас?',
  },
  // The two catalogues do not line up: the Russian carries a card about the paperwork that the
  // English has not got, and the English one about foreign-registered aircraft that the Russian
  // has not. Each is what its own catalogue held, card for card.
  cards: [
    {
      en: 'We are in charge of communication on sanctions lists',
      ru: 'Мы прекрасно понимаем все тонкости взаимодействия с санкционными списками. В ATM JET мы тщательно следим за всеми изменениями в международных правилах и обеспечиваем комфорт ваших перелетов даже в условиях сложных ограничений.',
      uk: 'Знаємо всі тонкощі комунікації за санкційними списками',
    },
    {
      en: 'Organizing technical stops',
      ru: 'Мы обеспечиваем оформление всех необходимых документов для русских пассажиров, даже в условиях действующих санкций. ATM JET внимательно отслеживает изменения в международных правилах и санкционных списках. Мы знаем, как важно быстро и корректно подготовить документы для бесперебойного пересечения границ, и предоставляем полную поддержку на каждом этапе оформления',
      uk: 'Гарантуємо оформлення необхідної документації',
    },
    {
      en: 'Selection of foreign-registered aircraft',
      ru: 'Мы организуем оптимальные технические остановки для ваших рейсов, гарантируя минимальные задержки и максимальную эффективность маршрута. ATM JET тщательно планирует каждую остановку с учетом ваших предпочтений и международных требований, чтобы обеспечить бесперебойные перелеты даже на самых сложных маршрутах',
      uk: 'Організуємо оптимальні необхідні технічні зупинки',
    },
    {
      en: 'Coordination of the main passenger',
      ru: 'Мы подберем ‘основного’ пассажира с необходимым гражданством для вашего рейса, обеспечивая полное соответствие международным требованиям и гарантируя беспрепятственное пересечение границ. ATM JET знает все тонкости организации перелетов в условиях санкций и поможет вам осуществить полет с соблюдением всех необходимых формальностей.',
      uk: 'Підберемо під ваш рейс «основного» пасажира з необхідним громадянством',
    },
    {
      en: 'Any form of payment',
      ru: 'Мы принимаем любой вид оплаты, включая банковские переводы, корпоративные счета и криптовалюты. ATM JET предоставляет гибкие финансовые решения, чтобы сделать процесс бронирования максимально удобным для наших клиентов.',
      uk: 'Приймаємо будь-який вид оплати.',
    },
  ],
}

/**
 * What the yachts for sale page settles before it shows a yacht (issue #141, section 4, item 2):
 * the four parameters the legacy `carousel` namespace named, in its words (issue #162).
 */
const YACHT_PARAMETERS: {
  title: Record<Locale, string>
  description: Record<Locale, string>
  cards: { en: [string, string]; ru: [string, string]; uk: [string, string] }[]
} = {
  title: {
    en: 'We\u2019ll find you the perfect one',
    ru: 'Мы подберем для вас идеальный вариант',
    uk: 'Ми підберемо для вас ідеальний варіант',
  },
  description: {
    en: 'We will conduct an introductory meeting to assist you in defining the most crucial parameters.',
    ru: 'Проведем ознакомительную встречу, чтобы помочь вам определить наиболее важные параметры будущей яхты.',
    uk: 'Проведемо ознайомчу зустріч, щоб допомогти вам визначити найважливіші параметри майбутньої яхти.',
  },
  cards: [
    {
      en: [
        'Top yacht architecture bureaus',
        'Know talented designers and architects who can create yachts that are works of art.',
      ],
      ru: [
        'Работаем с лучшими архитектурными бюро',
        'Познакомим вас с работами талантливых дизайнеров и архитекторов, которые могут создавать яхты, являющиеся произведениями искусства.',
      ],
      uk: [
        'Працюємо з найкращими архітектурними бюро',
        'Познайомимо вас із роботами талановитих дизайнерів і архітекторів, які можуть створювати яхти, що є витворами мистецтва.',
      ],
    },
    {
      en: [
        'Length required',
        'Will assess your expectations of comfort, planned number of guests, and required crew.',
      ],
      ru: [
        'Подберем оптимальную яхту под задачи',
        'Поможем определить необходимые параметры под ваши привычки к путешествиям, ожидания от комфорта, планируемое количество гостей и необходимый экипаж.',
      ],
      uk: [
        'Підберемо оптимальну яхту під завдання',
        'Допоможемо визначити необхідні параметри під ваші звички до подорожей, очікування від комфорту, плановану кількість гостей і необхідний екіпаж.',
      ],
    },
    {
      en: ['Price', 'Includes transaction cost, cost of ownership, and amortisation'],
      ru: [
        'Получим желаемую цену',
        'Поможем провести переговоры о цене, так же оценить стоимость сделки, владения и амортизацию',
      ],
      uk: [
        'Отримаємо бажану ціну',
        'Допоможемо провести переговори про ціну, так само оцінити вартість угоди, володіння та амортизацію',
      ],
    },
    {
      en: [
        'Yield',
        'Yachts offer excellent returns when managed by experienced professionals. We will create a financial model for you.',
      ],
      ru: [
        'Обеспечим доходность',
        'Умеем зарабатывать прибыль на яхтах. Мы разработаем для вас финансовую модель и предложим варианты по управлению.',
      ],
      uk: [
        'Забезпечимо дохідність',
        'Вміємо заробляти прибуток на яхтах. Ми розробимо для вас фінансову модель і запропонуємо варіанти з управління.',
      ],
    },
  ],
}

/**
 * What the company does for a yacht it manages (issue #141, section 4, item 8), in the words its
 * `yachts-why-us` namespace held (issue #162): four reasons under the heading the "twenty years"
 * section above them already carries — the legacy passed the same key to both.
 */
const YACHT_MANAGEMENT: { en: [string, string]; ru: [string, string]; uk: [string, string] }[] = [
  {
    en: ['Management calendar', 'Management calendar including financial planning.'],
    ru: [
      'Календарь управления',
      'Управленческий календарь, включая финансовое планирование на год.',
    ],
    uk: ['Календар управління', 'Управлінський календар, включно з фінансовим плануванням на рік.'],
  },
  {
    en: ['Yearly marketing plan', 'Online/offline marketing strategy for the year.'],
    ru: ['Годовой маркетинговый план', 'Стратегия онлайн/оффлайн маркетинга на год.'],
    uk: ['Річний маркетинговий план', 'Стратегія онлайн/оффлайн маркетингу на рік.'],
  },
  {
    en: [
      'Top database listings',
      'All of our managed yachts in key databases, portals and MLS systems with only the top brokerage firms as members such as; Yachtfolio, Boat International, Superyachts.com, Charter Index, etc.',
    ],
    ru: [
      'Лучшие места в базах данных',
      'Все наши яхты находятся в ключевых базах данных, порталах и системах MLS, членами которых являются только лучшие брокерские компании, такие как Yachtfolio, Boat International, Superyachts.com, Charter Index и др.',
    ],
    uk: [
      'Найкращі місця в базах даних',
      'Усі наші яхти перебувають у ключових базах даних, порталах і системах MLS, членами яких є тільки найкращі брокерські компанії, як-от Yachtfolio, Boat International, Superyachts.com, Charter Index та ін.',
    ],
  },
  {
    en: ['Luxury event partnerships', 'We partner with luxury and charity events.'],
    ru: [
      'Регулярное партнерство с организаторами элитных мероприятий',
      'Наши яхты регулярно участвуют в мероприятиях, что обеспечивает им высокую арендную загрузку круглый год.',
    ],
    uk: [
      'Регулярне партнерство з організаторами елітних заходів',
      'Наші яхти регулярно беруть участь у заходах, що забезпечує їм високе орендне завантаження цілий рік.',
    ],
  },
]

/**
 * The two quotations the legacy citizens page carried (issue #132, section 4): the press one
 * under the Forbes wordmark and the founder's under the company's own. His words were written
 * into the page in Russian only; here both languages have them.
 */
const QUOTES: {
  variant: 'press' | 'founder'
  en: [string, string]
  ru: [string, string]
  uk: [string, string]
}[] = [
  {
    variant: 'press',
    en: [
      'The 14th package of EU sanctions will include a ban on any private and charter flights carried out in the interests of citizens or companies of the Russian Federation.',
      'We know what restrictions our clients from Russia face. We have been helping to overcome any borders since 2004.',
    ],
    ru: [
      '14-й пакет санкций ЕС включает в себя запрет на любые частные и чартерные рейсы, осуществляемые в интересах граждан или компаний Российской Федерации.',
      'Наши клиенты - летают. Помогаем преодолевать любые границы с 2004 года.',
    ],
    uk: [
      '14-й пакет санкцій ЄС охоплює заборону на будь-які приватні та чартерні рейси, що здійснюються в інтересах громадян або компаній Російської Федерації.',
      'Наші клієнти - літають. Допомагаємо долати будь-які кордони з 2004 року.',
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
    uk: [
      'Since 2004 our mission at ATM JET has been to let clients fly without limits anywhere in the world, sanctions and restrictions notwithstanding. We cross any border so that our clients enjoy the best service on every flight.',
      'Artem Rumyantsev - founder of ATM JET',
    ],
  },
]

/**
 * The two full-screen heroes (issues #113 and #114, section 5). The sales one counts its
 * figures up; the charter page's shows no button at all, which is the shape the block keeps.
 */
const HERO_SALES: Record<
  Locale,
  { overline: string; lines: [string, string][]; description: string; button: string }
> = {
  en: {
    overline: 'Sales dept.',
    lines: [
      ['20+', 'Years'],
      ['500+', 'Aircraft'],
    ],
    description:
      'We offer access to over 500 aircraft for sale, ensuring a wide range of options for private and business aviation needs.\nWith more than 20 years of expertise in the industry, ATM JET provides comprehensive support to make your aircraft purchase both secure and profitable.',
    button: 'Contact us',
  },
  ru: {
    overline: 'Продажи самолетов',
    lines: [
      ['20+', 'Лет опыта'],
      ['500+', 'Воздушных судов'],
    ],
    description:
      'Мы имеем доступ к более чем 500 самолетам, выставленным на продажу прямо сейчас.\nНаш более чем 20-летний опыт позволит вам выгодно и безопасно провести сделку.',
    button: 'Свяжитесь с нами',
  },
  uk: {
    overline: 'Продажі літаків',
    lines: [
      ['20+', 'Років досвіду'],
      ['500+', 'Повітряних суден'],
    ],
    description:
      'Ми маємо доступ до більш ніж 500 літаків, виставлених на продаж просто зараз. Наш більш ніж 20-річний досвід дасть вам змогу вигідно і безпечно провести операцію.',
    button: "Зв'яжіться з нами",
  },
}

/** The yachts hero, with the button on the sales page and without it on the charter one. */
const HERO_YACHTS: Record<
  'sales_yachts' | 'yachts',
  Record<
    Locale,
    { overline: string; title: string; description: string; description2?: string; button?: string }
  >
> = {
  sales_yachts: {
    en: {
      overline: 'ATM JET',
      title: 'Yacht Sales',
      description:
        'ATM JET Yachts is proud to offer the largest fleet of superyachts for sale over 20 metres worldwide.',
      description2:
        'Our extensive network of owners and shipyards allows us to access thousands of additional yachts, including those not publicly listed for sale.',
      button: 'Get a quote',
    },
    ru: {
      overline: 'ATM JET',
      title: 'Продажа яхт',
      description:
        'ATM JET Yachts предлагает на продажу самый большой флот яхт длиной более 20 метров по всему миру.',
      description2:
        'Наша обширная сеть владельцев и верфей позволяет нам получить доступ к тысячам яхт, включая те, которые не выставлены на продажу в открытом доступе.',
      button: 'Получить предложение',
    },
    uk: {
      overline: 'ATM JET',
      title: 'Yachts',
      description:
        'ATM JET Yachts пропонує на продаж найбільший флот яхт завдовжки понад 20 метрів по всьому світу.',
      description2:
        'Наша велика мережа власників і верфей дає нам змогу отримати доступ до тисяч яхт, включно з тими, які не виставлені на продаж у відкритому доступі.',
      button: 'Отримати пропозицію',
    },
  },
  // The charter page drew the same hero with its own words and its button hidden (section 4).
  yachts: {
    en: {
      overline: 'ATM JET',
      title: 'Yacht Charter',
      description:
        'ATM JET Yachts is proud to offer the largest fleet of superyachts for charter over 20 metres worldwide.',
      description2:
        'Our extensive network of owners and operators gives us access to a vast selection of additional yachts, including those not publicly available for charter.',
    },
    ru: {
      overline: 'ATM JET',
      title: 'Аренда яхт',
      description:
        'ATM JET Yachts предлагает в аренду самый большой флот яхт длиной более 20 метров по всему миру.',
      description2:
        'Наша обширная сеть владельцев и верфей позволяет нам получить доступ к тысячам яхт, включая те, которые не выставлены в аренду в открытом доступе.',
    },
    uk: {
      overline: 'ATM JET',
      title: 'Оренда яхт',
      description:
        'ATM JET Yachts is proud to offer the largest fleet of superyachts for charter over 20 metres worldwide.',
      description2:
        'Our extensive network of owners and operators gives us access to a vast selection of additional yachts, including those not publicly available for charter.',
    },
  },
}

/**
 * The manager the partners and sales pages both introduce (issue #124, section 5), and the five
 * things they take off your hands. The legacy section read one string and split it on `;`.
 */
const PERSONAL_MANAGER: Record<Locale, { title: string; description: string; chips: string[] }> = {
  en: {
    title: 'Personal aviation manager',
    description:
      'We provide a dedicated aviation manager with over 20 years of industry experience. Your personal advisor will help you choose the ideal aircraft tailored to your specific needs, ensuring a seamless and informed buying process. With expert knowledge and personalized guidance, we ensure you receive the best solution based on your unique aviation requirements.',
    chips: [
      'Your plans for using the aircraft',
      'Price expectations',
      'High residual value',
      'Required parameters (range, passengers quantity, based airport)',
      'Best profitability',
    ],
  },
  ru: {
    title: 'Персональный менеджер по авиации',
    description:
      'Мы предоставим вам персонального авиационного менеджера с большим опытом работы более 20 лет. Он поможет вам определить наиболее подходящий самолет, исходя из ваших требований:',
    chips: [
      'Ваши планы по использованию самолета',
      'Ожидаемая цена',
      'Высокая остаточная стоимость',
      'Необходимые параметры (дальность полета, количество пассажиров, аэропорт базирования)',
      'Наилучшая рентабельность при сдаче в аренду',
    ],
  },
  uk: {
    title: 'Персональний менеджер з авіації',
    description:
      'Ми надамо вам персонального авіаційного менеджера з великим досвідом роботи понад 20 років. Він допоможе вам визначити найбільш підходящий літак, виходячи з ваших вимог:',
    chips: [
      'Ваші плани щодо використання літака',
      'Очікувана ціна',
      'Висока залишкова вартість',
      'Необхідні параметри (дальність польоту, кількість пасажирів, аеропорт базування)',
      'Найкраща рентабельність при здачі в оренду',
    ],
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
  Record<Locale, { title: string; cards: [OptionCard, OptionCard] }>
> = {
  sales_dept: {
    en: {
      title: 'Comprehensive aircraft services',
      cards: [
        {
          title: 'Legal department',
          description:
            'The legal department is committed to ensuring the complete security of the transaction from start to finish. We will prepare the following:',
          items: [
            'Proposal of intent with guarantees and commitments',
            'Bank lien verification of the aircraft',
            'Purchase agreement',
            'Change of ownership structure in the aircraft registration decision',
            'Export certificates, airworthiness certificate',
            'Other necessary documents',
          ],
        },
        {
          title: 'Finance department',
          description:
            'We will negotiate on your behalf to secure the most favourable terms. The finance department will select the most appropriate option from the following:',
          items: [
            'Select the most advantageous tax jurisdiction for the transaction',
            'Select the most suitable insurance',
            'Project the cost of ownership',
            'Calculate the projected rental income',
          ],
        },
      ],
    },
    ru: {
      title: 'Комплексное оформление сделки по самолетам',
      cards: [
        {
          title: 'Юридический отдел',
          description:
            'Юридический отдел стремится обеспечить полную безопасность сделки от начала и до конца. Мы подготовим:',
          items: [
            'Предложение о намерениях с гарантиями и обязательствами',
            'Банковская проверка о нахождении самолета в залоге',
            'Подготовка договора купли-продажи',
            'Изменение структуры собственности в решении о регистрации самолета',
            'Подготовка экспортных сертификатов, сертификатов летной годности',
            'Все необходимые документы',
          ],
        },
        {
          title: 'Финансовый отдел',
          description:
            'Мы будем вести переговоры от вашего имени, чтобы получить наиболее выгодные условия. Финансовый отдел подготовит подробный отчет включающий в себя:',
          items: [
            'Наиболее выгодную налоговую юрисдикцию для сделки',
            'Выгодные условия страхования',
            'Прогноз по стоимости владения',
            'Рассчет потенциального дохода от аренды',
          ],
        },
      ],
    },
    uk: {
      title: 'Комплексне оформлення угоди щодо літаків',
      cards: [
        {
          title: 'Юридичний відділ',
          description:
            'Юридичний відділ прагне забезпечити повну безпеку угоди від початку і до кінця. Ми підготуємо:',
          items: [
            "Пропозиція про наміри з гарантіями та зобов'язаннями",
            'Банківська перевірка щодо знаходження літака в заставі',
            'Підготовка договору купівлі-продажу',
            'Зміна структури власності в рішенні про реєстрацію літака',
            'Підготовка експортних сертифікатів, сертифікатів льотної придатності',
            'Вісі необхідні документи',
          ],
        },
        {
          title: 'Фінансовий відділ',
          description:
            'Ми вестимемо переговори від вашого імені, щоб отримати найвигідніші умови. Фінансовий відділ підготує детальний звіт, що містить у собі:',
          items: [
            'Найвигіднішу податкову юрисдикцію для угоди',
            'Вигідні умови страхування',
            'Прогноз за вартістю володіння',
            'Розрахунок потенційного доходу від оренди',
          ],
        },
      ],
    },
  },
  sales_yachts: {
    en: {
      title: 'Comprehensive yacht services',
      cards: [
        {
          title: 'Legal department',
          description:
            'The legal department is committed to ensuring that the transaction is completely secure from start to finish. We will prepare the following:',
          items: [
            'Letter of intent with guarantees and undertakings',
            "Verification of the yacht's bank lien",
            'Sale and Purchase Agreement',
            'Change of ownership in the decision to register the yacht',
            'Registration of the yacht under a flag of convenience',
            'Other documents required',
          ],
        },
        {
          title: 'Finance department',
          description:
            'The finance department will select the most appropriate option from the following:',
          items: [
            'Select the most advantageous tax jurisdiction for the transaction.',
            'Select the most suitable insurance.',
            'Project the cost of ownership.',
            'Calculate the projected rental income.',
            'Number and cost of crew required',
          ],
        },
      ],
    },
    ru: {
      title: 'Комплексное сопровождение в покупке',
      cards: [
        {
          title: 'Юридический отдел',
          description:
            'Юридический отдел обеспечит полную безопасность сделки от начала и до конца. Мы подготовим:',
          items: [
            'Письмо о намерениях с гарантиями и обязательствами',
            'Проверку наличия яхты в банковском залоге',
            'Соглашение о купле-продаже',
            'Смена владельца в решении о регистрации яхты',
            'Регистрация яхты под удобным флагом',
            'Другие необходимые документы',
          ],
        },
        {
          title: 'Финансовый отдел',
          description: 'Финансовый отдел поможет с организацией:',
          items: [
            'Наиболее выгодной налоговой юрисдикции для сделки.',
            'Подходящая страховая компания.',
            'Прогноз стоимости владения.',
            'Плановый доход от сдачи в аренду.',
            'Количество и стоимость необходимого экипажа',
          ],
        },
      ],
    },
    uk: {
      title: 'Комплексний супровід у купівлі',
      cards: [
        {
          title: 'Юридичний відділ',
          description:
            'Юридичний відділ забезпечить повну безпеку угоди від початку і до кінця. Ми підготуємо:',
          items: [
            "Лист про наміри з гарантіями і зобов'язаннями",
            'Перевірку наявності яхти в банківській заставі',
            'Угода про купівлю-продаж',
            'Зміна власника в рішенні про реєстрацію яхти',
            'Реєстрація яхти під зручним прапором',
            'ПІнші необхідні документи',
          ],
        },
        {
          title: 'Фінансовий відділ',
          description: 'Фінансовий відділ допоможе з організацією:',
          items: [
            'Найбільш вигідної податкової юрисдикції для угоди.',
            'Підходяща страхова компанія.',
            'Прогноз вартості володіння.',
            'Плановий дохід від здачі в оренду.',
            'Кількість і вартість необхідного екіпажу',
          ],
        },
      ],
    },
  },
}

/**
 * The empty legs section the home page and the empty legs page both carry (issue #117,
 * section 5), in the words the legacy `empty-leg` namespace held (issue #162), and the card
 * beside it that sends a visitor to the Telegram channel.
 */
const EMPTY_LEGS: Record<
  Locale,
  {
    title: string
    description: string
    button: string
    channel: { title: string; description: string; button: string }
  }
> = {
  en: {
    title: 'Upcoming Empty Leg flights',
    description: 'Charter a private jet with a discount of up to 75%',
    button: 'Inquire',
    channel: {
      title: 'Subscribe to our Telegram channel with all published empty legs.',
      description:
        'Our team monitors incoming Empty Leg deals to popular destinations daily and posts them in our channel.',
      button: 'Subscribe',
    },
  },
  ru: {
    title: 'Предстоящие «Empty Leg»',
    description: 'Арендуйте частный самолет со скидкой до 75%',
    button: 'Запросить',
    channel: {
      title: 'Подписывайтесь на наш Telegram-канал и отслеживайте актуальные перелеты «Empty Leg».',
      description:
        'Наша команда ежедневно отслеживает поступающие предложения «Empty Leg» по популярным направлениям и публикует их в нашем канале.',
      button: 'Подписаться',
    },
  },
  uk: {
    title: 'Майбутні «Empty Leg»',
    description: 'Орендуйте приватний літак зі знижкою до 75%',
    button: 'Запросити',
    channel: {
      title: 'Підписуйтесь на наш Telegram-канал і відстежуйте актуальні перельоти «Empty Leg».',
      description:
        'Наша команда щодня відстежує пропозиції «Empty Leg», що надходять, за популярними напрямками та публікує їх у нашому каналі.',
      button: 'Підписатися',
    },
  },
}

/** The sections a seeded page starts with; a page with no entry here starts with none. */
function layoutFor(slug: string, locale: Locale, fixture: Fixture): Layout {
  const sections: Layout = []
  // What one hard-coded line says in each language, where the legacy compared the locale.
  const say = (en: string, ru: string, uk: string): string => ({ en, ru, uk })[locale]
  // The hero's own heading, which the legacy read from the page's `*-hero` namespace rather
  // than from the navigation label the page is titled with (issue #162).
  const hero = HERO_PAGES[slug]?.[locale]

  if (hero !== undefined)
    sections.push({
      blockType: 'heroSubpage',
      title: hero.title,
      description: hero.description,
      image: fixture.photo,
    })

  // The home page, in the order the legacy file drew it (issue #134, section 4, route
  // `/[locale]`). Every one of these sections was on it, several of them on it alone, so they
  // are gathered here rather than left scattered through the list a block at a time.
  if (slug === '') {
    sections.push({
      blockType: 'heroVideo',
      // The legacy overline, and the legacy headline, which its Russian and Ukrainian
      // catalogues left in English; the fixture carries the translation the site wanted.
      overline: 'ATM JET',
      title: say(
        'Flying private made simple',
        'Частные перелёты — это просто',
        'Flying private made simple',
      ),
      // The path the legacy markup named; the file arrives with the assets of E5.12.
      video: '/video/background_full.mp4',
    })
    // Without a card, which is how the legacy home page passed it (section 5).
    sections.push({ blockType: 'makeBooking', title: MAKE_BOOKING[locale], variant: 'plain' })
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: say(
        'Why select us?',
        'Почему стоит выбрать именно нас?',
        'Чому варто вибрати саме нас?',
      ),
      cards: HOME_WHY_US.map((card) => ({
        figure: card.figure,
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
    sections.push({
      blockType: 'emptyLegs',
      title: EMPTY_LEGS[locale].title,
      description: EMPTY_LEGS[locale].description,
      limit: 12,
      cta: { label: EMPTY_LEGS[locale].button, source: 'Empty-legs' },
      channel: {
        title: EMPTY_LEGS[locale].channel.title,
        description: EMPTY_LEGS[locale].channel.description,
        label: EMPTY_LEGS[locale].channel.button,
      },
    })
    sections.push({
      blockType: 'keyFeatures',
      title: say('Exclusive key features', 'Наши сильные стороны', 'Наші сильні сторони'),
      description: say(
        'Unlock exceptional benefits with our exclusive key features designed to enhance your travel experience:',
        'Откройте для себя исключительные преимущества призванные улучшить ваши впечатления от путешествий:',
        'Відкрийте для себе виняткові переваги завдяки нашим компетенціям, покликаним поліпшити ваші враження від подорожей:',
      ),
      cards: HOME_KEY_FEATURES.map((card) => ({
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
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
    sections.push({
      blockType: 'privilege',
      title: PRIVILEGE_HEADING[locale].title,
      goldTitle: PRIVILEGE_HEADING[locale].gold,
      cards: PRIVILEGES.map((card) => ({
        icon: card.icon,
        title: card[locale][0],
        description: card[locale][1],
      })),
      contact: {
        title: PRIVILEGE_CONTACT[locale].title,
        description: PRIVILEGE_CONTACT[locale].description,
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        background: fixture.surface,
      },
    })
    const fleet = fixture.pages.get('yachts')
    if (fleet !== undefined)
      sections.push({
        blockType: 'yachtsPromo',
        title: YACHTS_PROMO[locale].title,
        description: YACHTS_PROMO[locale].description,
        image: fixture.photo,
        columns: YACHT_COLUMNS.map((column) => ({
          title: column[locale][0],
          description: column[locale][1],
        })),
        invitation: {
          image: fixture.photo,
          title: YACHTS_PROMO[locale].invitation,
          label: YACHTS_PROMO[locale].label,
          page: fleet,
        },
      })
    // Eight, as the legacy grid sliced one picture into eight. Far down the page, as it was
    // there: it is scrolled to, not landed on.
    sections.push({
      blockType: 'tiles',
      // The two placeholders in turn, so the cells of the grid can be told apart; the legacy
      // eight were eight slices of one picture.
      tiles: Array.from({ length: 8 }, (_, index) => ({
        image: index % 2 === 0 ? fixture.photo : fixture.surface,
      })),
    })
    sections.push({ blockType: 'transfer', title: TRANSFER[locale], image: fixture.photo })
    sections.push({
      blockType: 'faq',
      title: say('Frequently asked questions', 'Часто задаваемые вопросы', 'Часті запитання'),
      questions: FAQ.map((entry) => ({ question: entry[locale][0], answer: entry[locale][1] })),
    })
  }

  if (slug === 'aircraft')
    sections.push({
      blockType: 'heroAircraft',
      title: say(
        'We have access to over ',
        'У нас есть доступ к более чем ',
        'У нас є доступ до більш ніж ',
      ),
      figure: '50,000',
      title2: say(
        ' aircraft',
        ' воздушным суднам доступным к вылету',
        ' літаків у постійному доступі',
      ),
      description: say(
        'Our group of companies has been working since 2004 to combine the highest level of freedom and comfort in the air and at sea.',
        'Наша группа компаний с 2004 года работает над тем, чтобы обеспечить высочайший уровень свободы и комфорта в воздухе и на воде.',
        'Наша група компаній з 2004 року працює над тим, щоб забезпечити найвищий рівень свободи та комфорту в повітрі та на воді.',
      ),
    })

  if (slug === 'aircraft')
    sections.push({
      blockType: 'contactCard',
      title: say('Contact us', 'Свяжитесь с нами', "Зв'яжіться з нами"),
      description: say(
        'Please contact us to request a selection of the five most suitable aircraft models, along with an explanation of the benefits of each model to suit your requirements.',
        'Напишите нам, и мы предоставим вам подборку из 5ти наиболее подходящих моделей самолетов и расскажем преимущества каждого под ваш запрос.',
        'Напишіть нам, і ми надамо вам добірку з 5ти найбільш підходящих моделей літаків і розповімо переваги кожного під ваш запит.',
      ),
      image: fixture.photo,
      cta: {
        label: say('Contact now', 'Оставить контакты', 'Залишити контакти'),
        source: 'Contact_us_aircraft',
      },
    })

  // Between the card that invites a call and the contact section, where the legacy page drew
  // the list (section 4).
  if (slug === 'aircraft')
    sections.push({
      blockType: 'aircraftListing',
      title: say('Filter aircraft', 'Фильтровать самолёты', 'Filter aircraft'),
    })

  if (slug === 'empty_legs')
    sections.push({
      blockType: 'heroEmptyLegs',
      figure: '75%',
      title: say(
        'We can save you on your flight with Empty legs',
        'Мы можем сэкономить вам на перелете категории «Empty Leg»',
        'Ми можемо заощадити вам на перельоті категорії «Empty Leg»',
      ),
      image: fixture.photo,
      subtitle: say('Empty legs', '«Empty Leg»', '«Empty Leg»'),
      description: say(
        'Empty legs is when an aircraft flies without passengers. This happens when the aircraft returns to where it started or to its initial airport. To make the return flight more profitable, the aircraft owner offers it for hire at a reduced price.',
        '«Empty Leg» - это перегон самолета летит без пассажиров. Так происходит, когда самолет летит с домашнего аэропорта в точку вылета клиента или обратно в свой домашний аэропорт. Чтобы сделать полет без пассажира рентабельнее, владелец самолета предлагает его в аренду по сниженной цене.',
        '«Empty Leg» - це перегін літака, що летить без пасажирів. Це відбувається, коли літак летить із домашнього аеропорту в точку вильоту клієнта або назад у свій домашній аеропорт. Щоб зробити політ без пасажира рентабельнішим, власник літака пропонує його в оренду за зниженою ціною.',
      ),
    })

  if (slug === 'partners')
    sections.push({
      blockType: 'heroPartners',
      title: say('Over ', 'Нам доверяют более ', 'Нам довіряють понад '),
      figure: '12',
      title2: say(' partners trust us.', ' партнеров.', ' партнерів.'),
      description: say(
        'ATM JET: Exclusive Private Aviation Solutions for Elite Clients',
        'ATM JET: эксклюзивные решения в области частной авиации для элитных клиентов',
        'ATM JET: Exclusive Private Aviation Solutions for Elite Clients',
      ),
      image: fixture.photo,
    })

  if (slug === 'atm_jet_group')
    sections.push({
      blockType: 'heroGroup',
      chip: say('since 2004', 'с 2004 года', 'з 2004 року'),
      title: 'ATM JET Group',
      description: say(
        'Our group of companies has been dedicated to providing the highest level of freedom and comfort in the air and on the water for two decades.',
        'Наша группа компаний 20 лет работает над тем, чтобы обеспечить высочайший уровень свободы и комфорта в воздухе и на воде.',
        'Наша група компаній 20 років працює над тим, щоб забезпечити найвищий рівень свободи та комфорту в повітрі та на воді.',
      ),
    })

  // The sales department page down to the services it offers, in the legacy order (issue #142,
  // section 4): the hero, the manager who answers, and the aircraft themselves.
  if (slug === 'sales_dept') {
    const hero = HERO_SALES[locale]
    const manager = PERSONAL_MANAGER[locale]
    sections.push({
      blockType: 'heroSales',
      overline: hero.overline,
      lines: hero.lines.map(([figure, text]) => ({ figure, text })),
      description: hero.description,
      image: fixture.photo,
      cta: { label: hero.button, source: 'Hero_sales' },
    })
    sections.push({
      blockType: 'personalManager',
      title: manager.title,
      description: manager.description,
      image: fixture.photo,
      chips: manager.chips.map((label) => ({ label })),
    })
    sections.push({
      blockType: 'catalogueAircraft',
      title: say(
        'Most-flown business aircraft:',
        'Самые популярные самолёты сейчас:',
        'Найбільш літаючий бізнес-літак:',
      ),
      limit: 15,
    })
  }

  if (slug === 'empty_legs')
    sections.push({
      blockType: 'descriptor',
      title: say(
        'Access 10,000+ aircraft options',
        'Доступ к 10 000+ вариантов самолетов',
        'Доступ до 10 000+ варіантів літаків',
      ),
      description: say(
        'Discover a wide range of aircraft through our extensive partner network. From private jets to helicopters, we offer unparalleled choice for your travel needs.',
        'Откройте для себя широкий выбор самолетов благодаря нашей обширной партнерской сети. От частных самолетов до вертолетов - мы предлагаем непревзойденный выбор для ваших путешествий.',
        'Відкрийте для себе широкий вибір літаків завдяки нашій великій партнерській мережі. Від приватних літаків до вертольотів - ми пропонуємо неперевершений вибір для ваших подорожей.',
      ),
    })

  if (slug === 'empty_legs')
    sections.push({
      blockType: 'emptyLegs',
      title: EMPTY_LEGS[locale].title,
      description: EMPTY_LEGS[locale].description,
      limit: 12,
      cta: { label: EMPTY_LEGS[locale].button, source: 'Empty-legs' },
      channel: {
        title: EMPTY_LEGS[locale].channel.title,
        description: EMPTY_LEGS[locale].channel.description,
        label: EMPTY_LEGS[locale].channel.button,
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

  // Between the hero and the contact section, where the legacy page drew it (section 4).
  if (slug === 'yachts')
    sections.push({
      blockType: 'yachtsListing',
      title: say('Filter yachts', 'Фильтровать яхты', 'Фільтрувати яхти'),
      heading: say(
        'Yachts available for rent in Dubai',
        'Яхты доступные в аренду в Дубае',
        'Yachts available for rent in Dubai',
      ),
    })

  if (slug === 'medical_aviation')
    sections.push({
      blockType: 'keyFeatures',
      title: say('Exclusive key features', 'Наши преимущества', 'Наші переваги'),
      description: say(
        'Unlock exceptional benefits with our exclusive key features designed to enhance your travel experience:',
        'Основные преимущества позволившие ATM JET стать лидером в медицинской авиации ',
        'Основні переваги, що дозволили ATM JET стати лідером у медичній авіації ',
      ),
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
      // The legacy passed this one a heading and no sentence under it (section 4).
      title: say('Why choose us?', 'Почему стоит выбрать нас?', 'Чому варто вибрати нас?'),
      cards: WHY_US.map((card) => ({
        figure: card.figure,
        title: card[locale][0],
        description: card[locale][1],
        image: card.withImage ? fixture.photo : undefined,
      })),
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
      title: say('For personal assistants', 'Для бизнес-ассистентов', 'Для бізнес-асистентів'),
      heading: say(
        'Personal assistant guides',
        'Руководства для бизнес-ассистентов',
        'Посібники для бізнес-асистентів',
      ),
      points: GUIDE_POINTS.map((point) => ({ text: point[locale] })),
      image: fixture.photo,
    })
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: say(
        'Why select us?',
        'Почему стоит выбрать именно нас?',
        'Чому варто вибрати саме нас?',
      ),
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
      title: say(
        'We buy yachts for our clients as well as for ourselves.',
        'Нашим клиентам мы покупаем так же трепетно, как себе.',
        'Нашим клієнтам ми купуємо так само трепетно, як собі.',
      ),
    })
    sections.push({
      blockType: 'recentYachts',
      title: say(
        'Recently bought yachts for ourselves',
        'Наши последние покупки в собственный флот',
        'Наші останні покупки у власний флот',
      ),
      limit: 8,
    })
    sections.push({
      blockType: 'weInspect',
      title: say(
        'Conducting a technical assessment',
        'Проведение технической оценки',
        'Проведення технічної оцінки',
      ),
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

  const yachts = fixture.pages.get('yachts')
  if (slug === 'atm_jet_group' && yachts !== undefined)
    sections.push({
      blockType: 'yachtsPromo',
      title: YACHTS_PROMO[locale].title,
      description: YACHTS_PROMO[locale].description,
      image: fixture.photo,
      columns: YACHT_COLUMNS.map((column) => ({
        title: column[locale][0],
        description: column[locale][1],
      })),
      invitation: {
        image: fixture.photo,
        title: YACHTS_PROMO[locale].invitation,
        label: YACHTS_PROMO[locale].label,
        page: yachts,
      },
    })

  if (slug === 'partners') {
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: say('Clients benefit', 'Клиенты выбирают нас', 'Clients benefit'),
      cards: HOME_WHY_US.map((card) => ({
        figure: card.figure,
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: say('We offer:', 'Мы предлагаем:', 'Ми пропонуємо:'),
      description: say(
        'Unlock exclusive benefits and strong partnerships tailored for long-term cooperation at the highest level.',
        'Мы строим прочные партнёрские отношения с консьерж-сервисами, туристическими компаниями и агентами',
        'Ми будуємо міцні партнерські відносини з консьєрж-сервісами, туристичними компаніями та агентами',
      ),
      cards: WE_OFFER.map((card) => ({
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
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

  // What selling through the company is worth, and the management that follows the sale. The
  // legacy headed the stack with the company's own name (section 4, item 6).
  if (slug === 'sales_dept') {
    sections.push({
      blockType: 'advantages',
      title: say(
        'Each aircraft is assessed by a team of mechanics licensed by the manufacturer of the desired aircraft.',
        'Мы подбираем команду механиков, лицензированных производителем желаемого самолета.',
        'Ми підбираємо команду механіків, ліцензованих виробником бажаного літака.',
      ),
      image: fixture.photo,
      cards: ADVANTAGES.map((card) => ({ title: card[locale][0], description: card[locale][1] })),
    })
    sections.push({
      blockType: 'whyUs',
      variant: 'stacked',
      title: 'ATM JET',
      description: SALES_WHY_US.description[locale],
      cards: SALES_WHY_US.cards.map((card) => ({
        figure: card.figure,
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })
  }

  // The twenty years, and what they buy a yacht under management. The legacy gave both the same
  // heading, so the page says it twice (section 4, items 7 and 8).
  if (slug === 'sales_yachts') {
    const years = say("20 years' experience", '20 лет опыта', '20 років досвіду')
    sections.push({
      blockType: 'photoDescriptor',
      title: years,
      description: say(
        'We will negotiate on your behalf to secure the most favorable terms.',
        'Мы будем вести переговоры от вашего имени, и получим наиболее выгодные условия.',
        'Ми вестимемо переговори від вашого імені, і отримаємо найвигідніші умови.',
      ),
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
      title: PRIVILEGE_HEADING[locale].title,
      goldTitle: PRIVILEGE_HEADING[locale].gold,
      cards: PRIVILEGES.map((card) => ({
        icon: card.icon,
        title: card[locale][0],
        description: card[locale][1],
      })),
      contact: {
        title: PRIVILEGE_CONTACT[locale].title,
        description: PRIVILEGE_CONTACT[locale].description,
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
      hours: say(
        'Telephone line is open 24/7',
        'Телефонная линия открыта 24/7',
        'Telephone line is open 24/7',
      ),
      source: 'Contact_us',
    })

  return sections
}

/**
 * The same sections in another language, keeping every id the English write handed out. Payload
 * matches a block, and a row inside it, by id; a write without them replaces the rows instead of
 * translating them, and the English words go with the rows that held them.
 */
function translated(
  layout: Layout | null | undefined,
  slug: string,
  locale: Locale,
  fixture: Fixture,
): Layout {
  return layoutFor(slug, locale, fixture).map((block, index) => {
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
      case 'aircraftListing':
        return { ...block, id }
      case 'bestPrice':
        return { ...block, id }
      case 'catalogueAircraft':
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
      case 'yachtsListing':
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

  for (const locale of ALL_LOCALES.filter((entry) => entry !== 'en'))
    await payload.update({
      collection: 'pages',
      id,
      data: { layout: translated(written.layout, slug, locale, fixture) },
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

    const answersIn = PAGE_LOCALES[slug]
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: TITLES[slug].en,
        slug,
        layout: [],
        _status: 'published',
        availableLocales: answersIn ? [...answersIn] : undefined,
        meta: META[slug]?.en,
      },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    // The other routed locales are translations of the same document, not new ones.
    for (const locale of ALL_LOCALES.filter((entry) => entry !== 'en'))
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: TITLES[slug][locale], meta: META[slug]?.[locale] },
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
