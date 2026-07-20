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
