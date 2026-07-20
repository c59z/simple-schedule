import type { ScheduleEvent } from "@/features/schedule/types/event";

export function serializeEvent(event: ScheduleEvent) {
  return {
    ...event,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
