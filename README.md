# Simple Schedule MVP

This project is a minimal schedule planner built with Next.js 16, React 19, PostgreSQL, and Drizzle ORM. The MVP focuses on one daily planning screen, but the internal structure is intentionally split so the feature can be moved into a larger application later.

## Stack

- Next.js 16 App Router
- next-intl with cookie-based locale switching
- React 19 Server Components and Server Actions
- PostgreSQL in Docker
- Drizzle ORM and Drizzle Kit
- Tailwind CSS 4

## Local setup

1. Create a local env file.

```bash
cp .env.example .env.local
```

2. Start PostgreSQL with Docker.

```bash
docker compose up -d
```

3. Apply the database schema.

```bash
pnpm db:generate
pnpm db:migrate
```

4. Start the app.

```bash
pnpm dev
```

Open `http://localhost:3000/schedule`.

## Available scripts

- `pnpm dev` starts the local Next.js app.
- `pnpm lint` runs ESLint.
- `pnpm build` creates a production build.
- `pnpm db:generate` creates SQL migrations from the Drizzle schema.
- `pnpm db:migrate` applies generated migrations.
- `pnpm db:push` pushes the schema directly to the database for quick iteration.

## Current MVP scope

- View a single day schedule
- Jump to previous, next, or custom date
- Switch between Chinese and English
- Add a todo for the selected day
- Edit or delete a todo
- Mark a todo as complete or keep it open
- Show an empty-state placeholder when the selected day has no todos
- Download a day as Markdown, preserving completion and optional status
- Select years, months, or days for a streamed ZIP export with per-day results

## Schedule exports

- `GET /api/schedule/export?date=YYYY-MM-DD` returns a UTF-8 Markdown attachment. An empty day includes a placeholder.
- `POST /api/schedule/export` accepts `{ "dates": ["2026-09-19"] }` (up to 10,000 dates, deduplicated).
- Batch responses use NDJSON: `chunk` messages contain base64 ZIP bytes, followed by a `result` message with `success` and `failures` (`date`, `reason`). Clients must receive the final result before offering the archive for download.
- ZIP entries use `year/month/date.md` paths and include `export-report.json`. Missing days and read errors are reported individually; successful days are still exported.
- The server compresses one day at a time with backpressure. The browser accumulates the compressed ZIP for its download, so browser memory scales with archive size. Interrupted transfers are reported as failures, not partial success.
- The export format and ZIP writer are independent of the route and database for future integration.

Run export format and ZIP integrity tests with Node.js 22.18 or newer:

```bash
node --experimental-strip-types --test tests/export.test.mjs
```

## Schedule imports

The import link and language selector are inside the collapsible gear menu at the top right. Select one or multiple UTF-8 `.md` files, review the parsed tasks and editable dates, then confirm. ZIP uploads are not supported.

The day view also offers a delete-day button with confirmation. It removes all tasks for the selected date, including completed and optional tasks, without affecting other dates. The button is disabled for an empty day.

The parser supports iCloud plain-text exports and this app's Markdown checklists. It uses the heading date before the filename date; iCloud modification dates do not override schedule dates. Conflicting body dates are flagged for review. Plain text tasks start incomplete; checklist completion and optional status are preserved.

`POST /api/schedule/import` accepts `{ date, todos: [{ title, isCompleted, isOptional }] }`. Each file imports in one transaction, appending only titles not already present on that date. Existing task states are preserved. Repeated imports skip duplicates. The UI reports each file's added/skipped counts or failure and refreshes the schedule.

Limits: 1,000 selected files, 10 MB total, 256 KB and 500 tasks per file, 160 characters per task. The API also enforces a 1 MB request body limit. Source files are read in the browser; no uploaded files are stored on disk.

Parser checks: `node --experimental-strip-types --test tests/import.test.mjs`.

## Project structure

- `app/` keeps route files only.
- `components/schedule/` contains page-level UI blocks.
- `messages/` stores localized text.
- `i18n/` contains the `next-intl` request config.
- `features/schedule/todos/` contains todo validation, actions, services, and repository functions.
- `features/schedule/lib/` contains shared formatting logic.
- `db/` contains schema, migrations, and database setup.

## Notes for future integration

- UI mutations already go through Server Actions instead of talking to the database directly.
- REST endpoints are available for other frontends or future integration points.
- The schedule feature can later grow user ownership, recurring events, reminders, calendars, and permissions without rewriting the route layer.
