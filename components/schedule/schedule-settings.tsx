"use client";

import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./locale-switcher";
import { ImportControls } from "./todos/import-controls";

export function ScheduleSettings({ date }: { date: string }) {
  const t = useTranslations("Settings");
  return <details className="group relative z-20 shrink-0" onKeyDown={(event) => {
    if (event.key === "Escape" && !event.currentTarget.querySelector("dialog[open]")) {
      event.currentTarget.open = false;
      event.currentTarget.querySelector("summary")?.focus();
    }
  }}>
    <summary aria-label={t("title")} title={t("title")} className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-[#dbe9fb] bg-white/80 text-[#456898] group-open:bg-[#d9edff] [&::-webkit-details-marker]:hidden">
      <Settings size={20} aria-hidden />
    </summary>
    <div className="absolute top-12 right-0 w-[min(280px,calc(100vw-3rem))] rounded-2xl border border-[#dbe9fb] bg-[#f5faff] p-3 shadow-xl shadow-blue-100/70">
      <p className="mb-2 px-2 text-sm font-semibold text-[#456898]">{t("title")}</p>
      <LocaleSwitcher redirectTo={`/schedule?date=${date}`} />
      <ImportControls />
    </div>
  </details>;
}
