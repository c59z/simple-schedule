CREATE TABLE "schedule_day_notes" (
	"note_date" date PRIMARY KEY NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "schedule_day_notes_updated_at_idx" ON "schedule_day_notes" USING btree ("updated_at");