import { FooterSection, HeaderSection } from "@/components/sections";
import { useTranslations } from 'next-intl'

export default function Page() {
    const t = useTranslations()

    return (
        <main>
            <HeaderSection />
            <FooterSection />
        </main>
    )
}