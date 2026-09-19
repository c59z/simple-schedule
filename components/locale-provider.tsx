"use client";

import { NextIntlClientProvider } from "next-intl";
import { defaultLocale, isAppLocale } from "@/i18n/config";
import { messagesByLocale } from "@/i18n/messages";

export function LocaleProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const resolvedLocale = isAppLocale(locale) ? locale : defaultLocale;
  // Track message modules in the client graph so Fast Refresh updates translations too.
  return <NextIntlClientProvider locale={resolvedLocale} messages={messagesByLocale[resolvedLocale]}>{children}</NextIntlClientProvider>;
}
