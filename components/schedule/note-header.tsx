import { getTranslations } from "next-intl/server";

import { formatScheduleLongDateLabel } from "@/features/schedule/lib/format";

type ScheduleHeaderProps = {
  locale: string;
  selectedDate: Date;
  todoCount: number;
  completedCount: number;
};

export async function NoteHeader({
  completedCount,
  locale,
  selectedDate,
  todoCount,
}: ScheduleHeaderProps) {
  const t = await getTranslations("Page");

  return (
    <header className="rounded-[1.8rem] border border-white/75 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(245,250,255,0.9))] px-5 py-5 shadow-[0_18px_48px_rgba(89,136,214,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f8fbe]">
        {t("eyebrow")}
      </p>
      <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#153361] xl:text-5xl">
            {formatScheduleLongDateLabel(selectedDate, locale)}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5d79a8]">
            {t("description")}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#456898]">
            {t("progress", { completed: completedCount, total: todoCount })}
          </p>
        </div>
      </div>
    </header>
  );
}
