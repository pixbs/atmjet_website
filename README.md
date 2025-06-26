# ATM Jet Website

A modern, multilingual website for ATM Jet, providing private jet, yacht, and cargo charter services. Built with Next.js, TypeScript, and Tailwind CSS, the site features rich media, internationalization, and seamless booking integrations.

## Features

- **Multilingual**: Supports English, Russian, and Ukrainian (with easy extension for more languages)
- **Modern UI**: Responsive, animated, and visually rich interface
- **Video Backgrounds**: High-quality video assets for immersive experience
- **Booking & Contact Forms**: Integrated with CRM and Telegram bot
- **Dynamic Content**: Aircraft, yacht, and service listings powered by Drizzle ORM
- **SEO Optimized**: Metadata, sitemaps, and robots.txt included
- **Analytics**: Integrated with Vercel Analytics and Google Tag Manager

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Database/ORM**: Drizzle ORM, PostgreSQL
- **Internationalization**: next-intl
- **UI Libraries**: Radix UI, Framer Motion, Lucide React
- **Other**: Axios, Husky, Prettier, ESLint

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (for dynamic content)

### Installation
```bash
npm install
# or
yarn install
```

### Development
```bash
npm run dev
# or
yarn dev
```

### Production Build
```bash
npm run build:next
npm start
```

### Linting & Formatting
```bash
npm run lint
npm run format
```

## Project Structure

```
atmjet_website/
├── public/           # Static assets (images, videos, fonts)
├── src/
│   ├── app/          # Next.js app directory (routes, layouts, API)
│   ├── components/   # UI components (sections, elements, forms)
│   ├── messages/     # Localization files (en, ru, uk)
│   ├── lib/          # Database/ORM config
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types
├── scripts/          # Utility scripts (e.g., country code generator)
├── tailwind.config.ts
├── postcss.config.mjs
├── drizzle.config.ts
└── README.md
```

## Localization

- Uses [next-intl](https://github.com/amannn/next-intl) for internationalization
- Message files are in `messages/{locale}/` (e.g., `en`, `ru`, `uk`)
- Add or update translations by editing the respective JSON files
- Supported locales: `en`, `ru`, `uk`

## Assets

- **Images**: `public/images/` (organized by section)
- **Videos**: `public/en/video/` (backgrounds, hero videos)
- **Fonts**: `public/fonts/`

## Scripts

- `scripts/number-iso.js`: Generates a list of countries with phone codes for use in forms (`src/countries.ts`). Run manually if you need to update country data.

## API & Integrations

- **CRM Integration**: API route at `src/app/api/post_data/route.ts` posts booking/contact data to Kommo CRM
- **Telegram Bot**: `src/app/telegramBot.ts` sends notifications to allowed Telegram users

## Contributing

Pull requests and issues are welcome! Please lint and format your code before submitting.

## License

This project is proprietary and all rights are reserved by ATM Jet. Contact the project owner for licensing inquiries.
