import { getRequestConfig } from 'next-intl/server';


const locales = ['en', 'tr'];

export default getRequestConfig(async ({ locale }) => {
  // Bypassing initial undefined locale renders by the app router 
  const currentLocale = locales.includes(locale as string) ? locale as string : 'en';

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});

