import { NextResponse } from "next/server";

import { serializeEvent } from "@/features/schedule/api/serializers";
import {
  createScheduleEvent,
  getScheduleForDay,
} from "@/features/schedule/lib/schedule-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;
  const schedule = await getScheduleForDay(date);

  return NextResponse.json({
    date: schedule.selectedDate.toISOString(),
    events: schedule.events.map(serializeEvent),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, FormDataEntryValue>;
  const event = await createScheduleEvent(body);

  return NextResponse.json(serializeEvent(event), { status: 201 });
}
