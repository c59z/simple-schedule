import { addDays } from "date-fns";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/schedule/locale-switcher";
import {
  formatScheduleDate,
  formatScheduleDateLabel,
} from "@/features/schedule/lib/format";
import type { ScheduleTodoDaySummary } from "@/features/schedule/todos/types/todo";

type SidebarProps = {
  locale: string;
  recentDays: ScheduleTodoDaySummary[];
  selectedDate: Date;
};

export async function Sidebar({
  locale,
  recentDays,
  selectedDate,
}: SidebarProps) {
  const t = await getTranslations("Sidebar");
  const today = formatScheduleDate(new Date());
  const previousDate = formatScheduleDate(addDays(selectedDate, -1));
  const nextDate = formatScheduleDate(addDays(selectedDate, 1));
  const selectedDateString = formatScheduleDate(selectedDate);
  const redirectTo = `/schedule?date=${selectedDateString}`;

  return (
    <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
      <div className="flex h-full flex-col gap-4 rounded-[1.8rem] border border-white/70 bg-white/78 p-4 shadow-[0_18px_48px_rgba(89,136,214,0.12)]">
        <div className="rounded-[1.4rem] bg-[linear-gradient(180deg,_#f7fbff,_#edf6ff)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f8fbe]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[#153361]">
            {formatScheduleDateLabel(selectedDate, locale)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6681ad]">
            {t("description")}
          </p>
        </div>

        <LocaleSwitcher redirectTo={redirectTo} />

        <form className="grid gap-3 rounded-[1.4rem] border border-[#dbe9fb] bg-[#f8fbff] p-3">
          <input
            type="date"
            name="date"
            defaultValue={selectedDateString}
            className="rounded-[1rem] border border-[#d5e5fb] bg-white px-4 py-3 text-sm font-semibold text-[#17345f] outline-none transition focus:border-[#7ebdf7]"
          />
          <button
            type="submit"
            className="rounded-[1rem] bg-[linear-gradient(135deg,_#63a6ff,_#8ad9ff)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-105"
          >
            {t("jump")}
          </button>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`/schedule?date=${previousDate}`}
              className="rounded-[1rem] border border-[#d5e5fb] bg-white px-3 py-2 text-center text-sm font-semibold text-[#456898]"
            >
              {t("previous")}
            </a>
            <a
              href={`/schedule?date=${today}`}
              className="rounded-[1rem] border border-[#d5e5fb] bg-white px-3 py-2 text-center text-sm font-semibold text-[#456898]"
            >
              {t("today")}
            </a>
            <a
              href={`/schedule?date=${nextDate}`}
              className="rounded-[1rem] border border-[#d5e5fb] bg-white px-3 py-2 text-center text-sm font-semibold text-[#456898]"
            >
              {t("next")}
            </a>
          </div>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-[1.4rem] border border-[#dbe9fb] bg-[#f8fbff] p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f8fbe]">
              {t("recent")}
            </p>
          </div>
          <div className="space-y-2">
            {recentDays.length === 0 ? (
              <p className="rounded-[1rem] bg-white px-4 py-4 text-sm leading-6 text-[#6a84af]">
                {t("empty")}
              </p>
            ) : (
              recentDays.map((day) => {
                const isActive = day.todoDate === selectedDateString;

                return (
                  <a
                    key={day.todoDate}
                    href={`/schedule?date=${day.todoDate}`}
                    className={[
                      "block rounded-[1rem] border px-4 py-3 transition",
                      isActive
                        ? "border-[#82bdff] bg-[linear-gradient(135deg,_#e8f4ff,_#fafdff)]"
                        : "border-transparent bg-white hover:border-[#d5e5fb]",
                    ].join(" ")}
                  >
                    <p className="text-sm font-bold text-[#17345f]">
                      {day.todoDate}
                    </p>
                    <p className="mt-1 truncate text-sm text-[#44678f]">
                      {t("recentCount", {
                        completed: day.completedCount,
                        total: day.totalCount,
                      })}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#7c97bf]">
                      {day.firstTitle}
                    </p>
                  </a>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
