"use client";

import { useLocale, useTranslations } from "next-intl";

import { setLocaleAction } from "@/features/locale/actions";
import { locales } from "@/i18n/config";

type LocaleSwitcherProps = {
  redirectTo: string;
};

export function LocaleSwitcher({ redirectTo }: LocaleSwitcherProps) {
  const locale = useLocale();
  const t = useTranslations("Locale");

  return (
    <section className="rounded-[1.4rem] border border-[#dbe9fb] bg-[#f8fbff] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5a7fc4]">
          {t("label")}
        </p>
      </div>
      <div className="flex gap-2">
        {locales.map((item) => {
          const isActive = item === locale;

          return (
            <form action={setLocaleAction} key={item} className="flex-1">
              <input type="hidden" name="locale" value={item} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className={[
                  "w-full rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[linear-gradient(135deg,_rgba(96,165,250,0.95),_rgba(125,211,252,0.95))] text-white shadow-[0_12px_30px_rgba(56,189,248,0.35)]"
                    : "border border-white/60 bg-white/55 text-[#3c5a93] hover:bg-white/80",
                ].join(" ")}
              >
                {t(item)}
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
