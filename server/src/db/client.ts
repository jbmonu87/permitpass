import Database from "better-sqlite3";
import { appEnv } from "../config/env.js";
import { ensureFileDirectoryExists, toAbsolutePath } from "../utils/fileSystem.js";

const databasePath = toAbsolutePath(appEnv.databasePath);
ensureFileDirectoryExists(databasePath);

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

type DatabaseClient = typeof db;

export type { DatabaseClient };
