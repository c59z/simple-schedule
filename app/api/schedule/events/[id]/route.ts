import { NextResponse } from "next/server";

import { serializeEvent } from "@/features/schedule/api/serializers";
import {
  findScheduleEvent,
  removeScheduleEvent,
  updateScheduleEvent,
} from "@/features/schedule/lib/schedule-service";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/schedule/events/[id]">,
) {
  const { id } = await context.params;
  const event = await findScheduleEvent(id);

  if (!event) {
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  }

  return NextResponse.json(serializeEvent(event));
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/schedule/events/[id]">,
) {
  const { id } = await context.params;
  const body = (await request.json()) as Record<string, FormDataEntryValue>;
  const event = await updateScheduleEvent(id, body);

  if (!event) {
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  }

  return NextResponse.json(serializeEvent(event));
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/schedule/events/[id]">,
) {
  const { id } = await context.params;
  const event = await removeScheduleEvent(id);

  if (!event) {
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  }

  return NextResponse.json(serializeEvent(event));
}
