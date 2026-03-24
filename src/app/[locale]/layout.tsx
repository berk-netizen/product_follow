import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased min-h-screen selection:bg-emerald-500/30`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            <header className="bg-background/40 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 w-full shadow-sm">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">K</div>
                  <h1 className="text-xl font-bold tracking-tight text-white font-playfair">KNTLGY</h1>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                  <Link href={`/${locale}`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link href={`/${locale}/samples`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Numune Takip
                  </Link>
                  <Link href={`/${locale}/analytics`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Analytics
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </header>
            <main className="flex-1 max-w-[1600px] mx-auto w-full p-6">
              {children}
            </main>
          </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
