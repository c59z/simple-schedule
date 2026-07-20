"use server";

import { revalidatePath } from "next/cache";

import {
  createScheduleEvent,
  removeScheduleEvent,
  updateScheduleEvent,
} from "@/features/schedule/lib/schedule-service";

function formEntries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createEventAction(formData: FormData) {
  await createScheduleEvent(formEntries(formData));
  revalidatePath("/schedule");
}

export async function toggleEventStatusAction(formData: FormData) {
  const entries = formEntries(formData);
  const id = String(entries.id);
  const nextStatus = String(entries.nextStatus);

  await updateScheduleEvent(id, { status: nextStatus });
  revalidatePath("/schedule");
}

export async function deleteEventAction(formData: FormData) {
  const entries = formEntries(formData);
  const id = String(entries.id);

  await removeScheduleEvent(id);
  revalidatePath("/schedule");
}
