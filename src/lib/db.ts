import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { stories } from "./schema";
import path from "node:path";

// On stocke le fichier SQLite à la racine du projet (gitignored)
const DB_PATH = path.join(process.cwd(), "taleway.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL"); // perf + concurrence

export const db = drizzle(sqlite, { schema: { stories } });