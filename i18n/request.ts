import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isAppLocale, localeCookieName } from "@/i18n/config";
import { messagesByLocale } from "@/i18n/messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get(localeCookieName)?.value;
  const locale =
    requestedLocale && isAppLocale(requestedLocale)
      ? requestedLocale
      : defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
