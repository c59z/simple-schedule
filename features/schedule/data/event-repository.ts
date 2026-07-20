import { and, asc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { scheduleEvents } from "@/db/schema";
import type {
  ScheduleEvent,
  ScheduleEventInput,
  ScheduleEventUpdate,
} from "@/features/schedule/types/event";

function mapEvent(record: typeof scheduleEvents.$inferSelect): ScheduleEvent {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listEventsInRange(from: Date, to: Date) {
  const records = await db
    .select()
    .from(scheduleEvents)
    .where(and(lte(scheduleEvents.startsAt, to), gte(scheduleEvents.endsAt, from)))
    .orderBy(asc(scheduleEvents.startsAt), asc(scheduleEvents.createdAt));

  return records.map(mapEvent);
}

export async function createEvent(input: ScheduleEventInput) {
  const [record] = await db
    .insert(scheduleEvents)
    .values({
      title: input.title,
      description: input.description || null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    })
    .returning();

  return mapEvent(record);
}

export async function updateEvent(id: string, input: ScheduleEventUpdate) {
  const [record] = await db
    .update(scheduleEvents)
    .set({
      ...input,
      description:
        input.description === undefined ? undefined : input.description || null,
      updatedAt: new Date(),
    })
    .where(eq(scheduleEvents.id, id))
    .returning();

  return record ? mapEvent(record) : null;
}

export async function deleteEvent(id: string) {
  const [record] = await db
    .delete(scheduleEvents)
    .where(eq(scheduleEvents.id, id))
    .returning();

  return record ? mapEvent(record) : null;
}

export async function getEventById(id: string) {
  const [record] = await db
    .select()
    .from(scheduleEvents)
    .where(eq(scheduleEvents.id, id))
    .limit(1);

  return record ? mapEvent(record) : null;
}
