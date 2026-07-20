export type EventStatus = "scheduled" | "completed" | "cancelled";

export type ScheduleEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleEventInput = {
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
};

export type ScheduleEventUpdate = {
  title?: string;
  description?: string | null;
  startsAt?: Date;
  endsAt?: Date;
  status?: EventStatus;
};

export type ScheduleQuery = {
  from: Date;
  to: Date;
};
