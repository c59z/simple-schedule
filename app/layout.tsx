import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Geist_Mono, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  variable: "--font-ui",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simple Schedule",
  description: "An extensible MVP for daily schedule planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutInner>{children}</RootLayoutInner>;
}

async function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${notoSansSc.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-[#eef6ff] text-slate-900">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="relative min-h-full">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_22%),radial-gradient(circle_at_85%_0%,_rgba(164,209,255,0.34),_transparent_20%),linear-gradient(180deg,_#f5fbff_0%,_#e5f2ff_56%,_#f2f8ff_100%)]" />
            <div className="relative flex min-h-full flex-col">{children}</div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
