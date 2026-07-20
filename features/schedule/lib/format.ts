import { format } from "date-fns";

const scheduleDateFormatters = new Map<
  string,
  {
    day: Intl.DateTimeFormat;
    longDay: Intl.DateTimeFormat;
    time: Intl.DateTimeFormat;
  }
>();

export function formatScheduleDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function getFormatter(locale: string) {
  const cached = scheduleDateFormatters.get(locale);
  if (cached) {
    return cached;
  }

  const created = {
    day: new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      weekday: "long",
    }),
    longDay: new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }),
    time: new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };

  scheduleDateFormatters.set(locale, created);
  return created;
}

export function formatScheduleDateLabel(date: Date, locale: string) {
  return getFormatter(locale).day.format(date);
}

export function formatScheduleLongDateLabel(date: Date, locale: string) {
  return getFormatter(locale).longDay.format(date);
}

export function formatScheduleTimeRange(start: Date, end: Date, locale: string) {
  const formatter = getFormatter(locale).time;
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function formatDateTimeInput(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
