import { getTranslations } from "next-intl/server";
import { addDays } from "date-fns";

import {
  formatScheduleDate,
  formatScheduleLongDateLabel,
} from "@/features/schedule/lib/format";

type PageHeaderProps = {
  eventCount: number;
  locale: string;
  selectedDate: Date;
};

export async function PageHeader({
  eventCount,
  locale,
  selectedDate,
}: PageHeaderProps) {
  const pageT = await getTranslations("Page");
  const navT = await getTranslations("Navigation");
  const summaryT = await getTranslations("Summary");
  const previousDate = formatScheduleDate(addDays(selectedDate, -1));
  const nextDate = formatScheduleDate(addDays(selectedDate, 1));
  const todayDate = formatScheduleDate(new Date());

  return (
    <header className="relative overflow-hidden rounded-[2.2rem] border border-white/55 bg-white/34 p-6 shadow-[0_24px_90px_rgba(76,134,255,0.22)] backdrop-blur-2xl md:p-8">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,_rgba(255,255,255,0.52),_transparent)]" />
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-5">
          <span className="inline-flex w-fit rounded-full border border-white/60 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#5a7fc4]">
            {pageT("eyebrow")}
          </span>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] text-[#11305f] md:text-6xl">
              {pageT("title")}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#4b6798] md:text-base">
              {pageT("description")}
            </p>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-white/60 bg-[linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(232,244,255,0.58))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7c9acc]">
            {summaryT("title")}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#6d8ab7]">
            {summaryT("dateLabel")}
          </p>
          <p className="mt-3 text-2xl font-bold text-[#163563]">
            {formatScheduleLongDateLabel(selectedDate, locale)}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5b78aa]">
            {summaryT("count", { count: eventCount })}
          </p>
          <p className="mt-4 text-sm leading-6 text-[#6f89b3]">
            {summaryT("hint")}
          </p>
        </div>
      </div>

      <form className="relative mt-6 grid gap-3 rounded-[1.8rem] border border-white/60 bg-white/46 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] md:grid-cols-[1fr_160px_120px_120px_120px]">
        <a
          href={`/schedule?date=${previousDate}`}
          className="flex items-center justify-center rounded-[1.2rem] border border-white/60 bg-white/72 px-4 py-3 text-sm font-semibold text-[#36568f] transition hover:bg-white"
        >
          {navT("previous")}
        </a>
        <input
          type="date"
          name="date"
          defaultValue={formatScheduleDate(selectedDate)}
          className="rounded-[1.2rem] border border-white/60 bg-white/72 px-4 py-3 text-sm font-semibold text-[#17345f] outline-none transition focus:border-[#7ebdf7]"
        />
        <button
          type="submit"
          className="rounded-[1.2rem] bg-[linear-gradient(135deg,_#63a6ff,_#8ad9ff)] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(81,159,255,0.28)] transition hover:brightness-105"
        >
          {navT("jump")}
        </button>
        <a
          href={`/schedule?date=${todayDate}`}
          className="flex items-center justify-center rounded-[1.2rem] border border-white/60 bg-white/72 px-4 py-3 text-sm font-semibold text-[#36568f] transition hover:bg-white"
        >
          {navT("today")}
        </a>
        <a
          href={`/schedule?date=${nextDate}`}
          className="flex items-center justify-center rounded-[1.2rem] border border-white/60 bg-white/72 px-4 py-3 text-sm font-semibold text-[#36568f] transition hover:bg-white"
        >
          {navT("next")}
        </a>
      </form>
    </header>
  );
}
