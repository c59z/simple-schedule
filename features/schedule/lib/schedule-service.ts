import {
  createEvent,
  deleteEvent,
  getEventById,
  listEventsInRange,
  updateEvent,
} from "@/features/schedule/data/event-repository";
import {
  buildDayRange,
  createEventSchema,
  updateEventSchema,
} from "@/features/schedule/lib/validation";

export async function getScheduleForDay(date?: string) {
  const range = buildDayRange(date);
  const events = await listEventsInRange(range.from, range.to);

  return {
    ...range,
    events,
  };
}

export async function createScheduleEvent(input: Record<string, FormDataEntryValue>) {
  const parsed = createEventSchema.parse({
    title: input.title,
    description: input.description,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  });

  return createEvent(parsed);
}

export async function updateScheduleEvent(
  id: string,
  input: Record<string, FormDataEntryValue | string | undefined>,
) {
  const parsed = updateEventSchema.parse({
    title: input.title,
    description:
      input.description === undefined
        ? undefined
        : String(input.description || "").trim() || null,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    status: input.status,
  });

  return updateEvent(id, parsed);
}

export async function removeScheduleEvent(id: string) {
  return deleteEvent(id);
}

export async function findScheduleEvent(id: string) {
  return getEventById(id);
}
