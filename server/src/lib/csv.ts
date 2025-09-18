import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";

export type CsvRow = Record<string, string>;

export type CsvResult = {
  headers: string[];
  rows: CsvRow[];
};

export const readCsv = async (filePath: string): Promise<CsvResult> => {
  const fileContents = await readFile(filePath, "utf8");

  if (fileContents.trim().length === 0) {
    return { headers: [], rows: [] };
  }

  let headers: string[] = [];

  const records = parse(fileContents, {
    bom: true,
    columns: (parsedHeaders: string[]) => {
      headers = parsedHeaders.map((header) => header.trim());
      return headers;
    },
    skip_empty_lines: true,
    trim: true
  }) as CsvRow[];

  const rows = records.map((record) => {
    const normalized: CsvRow = {};

    for (const [key, value] of Object.entries(record)) {
      normalized[key] = value === undefined ? "" : String(value).trim();
    }

    return normalized;
  });

  return { headers, rows };
};
