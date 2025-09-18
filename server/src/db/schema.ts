import type { DatabaseClient } from "./client.js";

export const initializeSchema = (database: DatabaseClient) => {
  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS contractors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        license_number TEXT,
        license_expires_at TEXT,
        insurance_document_path TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contractor_id INTEGER,
        project_type TEXT NOT NULL,
        town TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (contractor_id) REFERENCES contractors(id)
      )`
    )
    .run();
};
