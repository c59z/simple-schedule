CREATE TABLE "schedule_todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"todo_date" date NOT NULL,
	"title" text NOT NULL,
	"details" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "schedule_todos_todo_date_idx" ON "schedule_todos" USING btree ("todo_date");--> statement-breakpoint
CREATE INDEX "schedule_todos_is_completed_idx" ON "schedule_todos" USING btree ("is_completed");--> statement-breakpoint
CREATE INDEX "schedule_todos_sort_idx" ON "schedule_todos" USING btree ("todo_date","sort_order","created_at");