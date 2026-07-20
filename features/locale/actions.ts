"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
} from "@/i18n/config";

export async function setLocaleAction(formData: FormData) {
  const nextLocale = String(formData.get("locale") || defaultLocale);
  const redirectTo = String(formData.get("redirectTo") || "/");
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, isAppLocale(nextLocale) ? nextLocale : defaultLocale, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(redirectTo);
}
