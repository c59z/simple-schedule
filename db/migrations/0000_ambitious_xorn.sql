CREATE TYPE "public"."event_status" AS ENUM('scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "schedule_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "event_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schedule_events_valid_range_check" CHECK ("schedule_events"."starts_at" < "schedule_events"."ends_at")
);
--> statement-breakpoint
CREATE INDEX "schedule_events_starts_at_idx" ON "schedule_events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "schedule_events_status_idx" ON "schedule_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "schedule_events_updated_at_idx" ON "schedule_events" USING btree ("updated_at");