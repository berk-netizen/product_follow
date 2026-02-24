import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { getMessages } from 'next-intl/server';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Product Follow App",
  description: "Production Tracking & Costing Management",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 w-full shadow-sm">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-lg">P</div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">Product Follow</h1>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                  <Link href={`/${locale}`} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Dashboard
                  </Link>
                  <Link href={`/${locale}/analytics`} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Analytics
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
              </div>
            </header>
            <main className="flex-1 max-w-[1600px] mx-auto w-full p-6">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
