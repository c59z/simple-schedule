import { getTranslations } from "next-intl/server";
import { addHours, setMinutes, setSeconds } from "date-fns";

import { createEventAction } from "@/features/schedule/actions/event-actions";
import {
  formatDateTimeInput,
} from "@/features/schedule/lib/format";

type CreateEventFormProps = {
  selectedDate: Date;
};

export async function CreateEventForm({ selectedDate }: CreateEventFormProps) {
  const t = await getTranslations("Form");
  const startTime = setSeconds(setMinutes(selectedDate, 0), 0);
  startTime.setHours(9, 0, 0, 0);
  const endTime = addHours(startTime, 1);

  return (
    <section className="rounded-[2.2rem] border border-white/55 bg-white/34 p-6 shadow-[0_24px_90px_rgba(76,134,255,0.2)] backdrop-blur-2xl">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5a7fc4]">
          {t("eyebrow")}
        </p>
        <h2 className="text-2xl font-black tracking-[-0.03em] text-[#11305f]">
          {t("title")}
        </h2>
        <p className="text-sm leading-6 text-[#5a76a7]">{t("description")}</p>
      </div>

      <form action={createEventAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#36568f]" htmlFor="title">
            {t("titleLabel")}
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={120}
            placeholder={t("titlePlaceholder")}
            className="w-full rounded-[1.4rem] border border-white/65 bg-white/70 px-4 py-3 text-sm text-[#17345f] outline-none transition focus:border-[#73b9ff] focus:bg-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#36568f]" htmlFor="startsAt">
              {t("startsAtLabel")}
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={formatDateTimeInput(startTime)}
              className="w-full rounded-[1.4rem] border border-white/65 bg-white/70 px-4 py-3 text-sm text-[#17345f] outline-none transition focus:border-[#73b9ff] focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#36568f]" htmlFor="endsAt">
              {t("endsAtLabel")}
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              required
              defaultValue={formatDateTimeInput(endTime)}
              className="w-full rounded-[1.4rem] border border-white/65 bg-white/70 px-4 py-3 text-sm text-[#17345f] outline-none transition focus:border-[#73b9ff] focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#36568f]" htmlFor="description">
            {t("descriptionLabel")}
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder={t("descriptionPlaceholder")}
            className="w-full rounded-[1.4rem] border border-white/65 bg-white/70 px-4 py-3 text-sm text-[#17345f] outline-none transition focus:border-[#73b9ff] focus:bg-white"
          />
        </div>

        <button
          type="submit"
          className="inline-flex rounded-[1.3rem] bg-[linear-gradient(135deg,_#63a6ff,_#86dfff)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(81,159,255,0.3)] transition hover:brightness-105"
        >
          {t("submit")}
        </button>
      </form>
    </section>
  );
}
