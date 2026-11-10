import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

// prepare: false keeps this working behind Supabase's transaction pooler too.
const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL ?? "", { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema, casing: "snake_case" });

export * from "./schema";
export * from "drizzle-orm";
