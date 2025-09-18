import path from "node:path";
import process from "node:process";

import type { CsvRow } from "./lib/csv.js";
import { readCsv } from "./lib/csv.js";
import { loadSnapshot, saveSnapshot, store } from "./storage.js";

const DATA_DIR = path.resolve("data");
const SNAPSHOT_RELATIVE_PATH = path.join(".local", "snapshot.json");

type ImportTarget = "DocumentType" | "SupplementalRequirement";

const exitWithError = (message: string, error?: unknown): never => {
  console.error(message);
  if (error) {
    console.error(error);
  }
  process.exit(1);
};

const ensureHeadersMatchRows = (
  fileLabel: string,
  headers: string[],
  rows: CsvRow[]
): void => {
  if (headers.length === 0) {
    exitWithError(`[${fileLabel}] is missing a header row.`);
  }

  const uniqueHeaders = new Set(headers);
  if (uniqueHeaders.size !== headers.length) {
    exitWithError(`[${fileLabel}] has duplicate headers: ${headers.join(", ")}`);
  }

  rows.forEach((row, index) => {
    const missing = headers.filter((header) => !Object.prototype.hasOwnProperty.call(row, header));
    const extra = Object.keys(row).filter((key) => !uniqueHeaders.has(key));

    if (missing.length > 0 || extra.length > 0) {
      const issues = [
        missing.length > 0 ? `missing columns: ${missing.join(", ")}` : null,
        extra.length > 0 ? `unexpected columns: ${extra.join(", ")}` : null
      ]
        .filter((value): value is string => value !== null)
        .join("; ");

      exitWithError(`[${fileLabel}] row ${index + 1} does not match header definition (${issues}).`);
    }
  });
};

const importCsv = async (target: ImportTarget): Promise<void> => {
  const fileName = `${target}.csv`;
  const filePath = path.join(DATA_DIR, fileName);

  let headers: string[];
  let rows: CsvRow[];

  try {
    const result = await readCsv(filePath);
    headers = result.headers;
    rows = result.rows;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      exitWithError(`Could not find required data file at ${filePath}`);
    }

    exitWithError(`Failed to read ${fileName}`, err);
  }

  ensureHeadersMatchRows(fileName, headers, rows);

  if (target === "DocumentType") {
    store.documentTypes = rows;
  } else {
    store.supplementalRequirements = rows;
  }

  console.log(`Imported ${rows.length} ${target === "DocumentType" ? "document types" : "supplemental requirements"}.`);
};

const run = async () => {
  await loadSnapshot();

  await importCsv("DocumentType");
  await importCsv("SupplementalRequirement");

  await saveSnapshot();

  console.log(
    `Snapshot saved to ${SNAPSHOT_RELATIVE_PATH} with ${store.documentTypes.length} document types and ${store.supplementalRequirements.length} supplemental requirements.`
  );
};

run().catch((error) => {
  exitWithError("Import failed", error);
});
