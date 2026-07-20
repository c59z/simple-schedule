import { getLocale, getTranslations } from "next-intl/server";
import { differenceInMinutes } from "date-fns";
import clsx from "clsx";

import {
  deleteEventAction,
  toggleEventStatusAction,
} from "@/features/schedule/actions/event-actions";
import { formatScheduleTimeRange } from "@/features/schedule/lib/format";
import type { ScheduleEvent } from "@/features/schedule/types/event";

const statusStyles: Record<ScheduleEvent["status"], string> = {
  scheduled: "bg-[#e0f2fe] text-[#0c4a6e]",
  completed: "bg-[#e9f7ef] text-[#21643d]",
  cancelled: "bg-[#fee2e2] text-[#991b1b]",
};

type EventListProps = {
  events: ScheduleEvent[];
};

export async function EventList({ events }: EventListProps) {
  const locale = await getLocale();
  const t = await getTranslations("Events");
  const statusT = await getTranslations("Status");

  return (
    <section className="rounded-[2.2rem] border border-white/55 bg-white/34 p-6 shadow-[0_24px_90px_rgba(76,134,255,0.2)] backdrop-blur-2xl">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5a7fc4]">
            {t("eyebrow")}
          </p>
          <h2 className="text-2xl font-black tracking-[-0.03em] text-[#11305f]">
            {events.length === 0
              ? t("emptyTitle")
              : t("countTitle", { count: events.length })}
          </h2>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[1.7rem] border border-dashed border-white/70 bg-white/45 px-6 py-10 text-sm leading-7 text-[#6480ae]">
          {t("emptyDescription")}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const duration = differenceInMinutes(event.endsAt, event.startsAt);
            const nextStatus =
              event.status === "completed" ? "scheduled" : "completed";

            return (
              <article
                key={event.id}
                className="rounded-[1.85rem] border border-white/60 bg-[linear-gradient(180deg,_rgba(255,255,255,0.62),_rgba(230,244,255,0.46))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:bg-white/65"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={clsx(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                          statusStyles[event.status],
                        )}
                      >
                        {statusT(event.status)}
                      </span>
                      <span className="text-sm text-[#53709f]">
                        {formatScheduleTimeRange(
                          event.startsAt,
                          event.endsAt,
                          locale,
                        )}
                      </span>
                      <span className="text-sm text-[#85a0c9]">
                        {t("minutes", { count: duration })}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3
                        className={clsx(
                          "text-xl font-bold text-[#14325f]",
                          event.status === "completed" && "line-through",
                        )}
                      >
                        {event.title}
                      </h3>
                      {event.description ? (
                        <p className="max-w-2xl text-sm leading-7 text-[#5d79a8]">
                          {event.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={toggleEventStatusAction}>
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="nextStatus" value={nextStatus} />
                      <button
                        type="submit"
                        className="rounded-[1.1rem] border border-white/65 bg-white/65 px-4 py-2 text-sm font-semibold text-[#36568f] transition hover:bg-white"
                      >
                        {event.status === "completed"
                          ? t("activate")
                          : t("complete")}
                      </button>
                    </form>

                    <form action={deleteEventAction}>
                      <input type="hidden" name="id" value={event.id} />
                      <button
                        type="submit"
                        className="rounded-[1.1rem] border border-[#ffd1d8] bg-white/70 px-4 py-2 text-sm font-semibold text-[#c14f76] transition hover:bg-white"
                      >
                        {t("delete")}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
