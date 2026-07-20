import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

declare global {
  var __scheduleSql: ReturnType<typeof postgres> | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

const sql =
  globalThis.__scheduleSql ??
  postgres(getDatabaseUrl(), {
    prepare: false,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__scheduleSql = sql;
}

export const db = drizzle(sql, { schema });
