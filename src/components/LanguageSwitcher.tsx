"use client"

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const t = useTranslations('Navigation');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = () => {
        const nextLocale = locale === 'en' ? 'tr' : 'en';
        // Remove current locale from path and prepend the new one
        // Assuming simple path structure based on middleware /:locale/:path
        const pathWithoutLocale = pathname.replace(`/${locale}`, '');
        router.replace(`/${nextLocale}${pathWithoutLocale}`);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleLocaleChange} className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{locale === 'en' ? t('en') : t('tr')}</span>
        </Button>
    );
}
