"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatScheduleDate } from "@/features/schedule/lib/format";
import type { ScheduleTodoDaySummary } from "@/features/schedule/todos/types/todo";

type SidebarProps = { locale: string; recentDays: ScheduleTodoDaySummary[]; selectedDate: Date };

export function Sidebar({ recentDays, selectedDate }: SidebarProps) {
  const t = useTranslations("Sidebar");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const selected = formatScheduleDate(selectedDate);
  const today = formatScheduleDate(new Date());
  const days = [...recentDays];
  for (const date of new Set([selected, today])) {
    if (!days.some((day) => day.todoDate === date)) days.push({ todoDate: date, firstTitle: "", totalCount: 0, completedCount: 0 });
  }
  const filtered = days.sort((a, b) => b.todoDate.localeCompare(a.todoDate)).filter((day) => `${day.todoDate} ${day.firstTitle}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <aside className="flex min-h-0 flex-col border-b border-[#dbe9fb] bg-[#edf6ff]/80 md:border-r md:border-b-0">
      <div className="space-y-3 p-4">
        <h2 className="text-lg font-bold text-[#17345f]">{t("recent")}</h2>
        <input type="search" aria-label={t("search")} placeholder={t("search")} value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-lg border border-white bg-white/80 px-3 text-sm" />
        <div className="flex items-center gap-2">
          <input type="date" aria-label={t("jump")} value={selected} onChange={(event) => {
            const date = event.target.value;
            if (date) startTransition(() => router.push(`/schedule?date=${date}`, { scroll: false }));
          }} className="h-9 min-w-0 flex-1 rounded-lg border border-[#d5e5fb] bg-white/70 px-2 text-sm" />
          <Link href={`/schedule?date=${today}`} scroll={false} className="text-sm font-semibold text-[#2f83e6]">{t("today")}</Link>
        </div>
        {pending && <p role="status" className="text-xs text-[#6681ad]">{t("loading")}</p>}
      </div>
      <nav aria-label={t("recent")} className="max-h-64 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 pb-3 md:max-h-none">
        {filtered.length === 0 && <p className="p-4 text-sm text-[#6681ad]">{t("noResults")}</p>}
        {filtered.map((day) => (
          <Link key={day.todoDate} href={`/schedule?date=${day.todoDate}`} scroll={false} aria-current={day.todoDate === selected ? "page" : undefined} className={`block rounded-lg border px-4 py-3 ${day.todoDate === selected ? "border-[#b4d9fa] bg-[#d9edff]" : "border-transparent hover:bg-white/70"}`}>
            <p className="font-bold text-[#17345f]">{day.todoDate}</p>
            <p className="mt-1 text-xs text-[#6681ad]">{t("recentCount", { completed: day.completedCount, total: day.totalCount })}</p>
            <p className="mt-1 truncate text-sm text-[#44678f]">{day.firstTitle || t("emptyDay")}</p>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
