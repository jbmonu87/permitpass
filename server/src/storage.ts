/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ProjectRecord = {
  project_id: string;
  display_name: string | null;
  municipality_key: string;
  permit_type_key: string;
  created_at: string;
};

export type Store = {
  documentTypes: any[];
  supplementalRequirements: any[];
  documents: any[];
  projects: ProjectRecord[];
  projectValues: Record<string, Record<string, any>>;
};

const SNAPSHOT_DIR = path.resolve(".local");
const SNAPSHOT_PATH = path.join(SNAPSHOT_DIR, "snapshot.json");

const createDefaultStore = (): Store => ({
  documentTypes: [],
  supplementalRequirements: [],
  documents: [],
  projects: [],
  projectValues: {}
});

export let store: Store = createDefaultStore();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeStore = (value: unknown): Store => {
  if (!isRecord(value)) {
    return createDefaultStore();
  }

  const next = createDefaultStore();

  if (Array.isArray(value.documentTypes)) {
    next.documentTypes = value.documentTypes;
  }

  if (Array.isArray(value.supplementalRequirements)) {
    next.supplementalRequirements = value.supplementalRequirements;
  }

  if (Array.isArray(value.documents)) {
    next.documents = value.documents;
  }

  if (Array.isArray(value.projects)) {
    const projects: ProjectRecord[] = [];

    for (const candidate of value.projects) {
      if (!isRecord(candidate)) {
        continue;
      }

      const projectId = candidate.project_id;
      const municipalityKey = candidate.municipality_key;
      const permitTypeKey = candidate.permit_type_key;
      const createdAt = candidate.created_at;

      if (
        typeof projectId !== "string" ||
        typeof municipalityKey !== "string" ||
        typeof permitTypeKey !== "string" ||
        typeof createdAt !== "string"
      ) {
        continue;
      }

      const displayNameRaw = candidate.display_name;
      const displayName =
        typeof displayNameRaw === "string"
          ? displayNameRaw
          : displayNameRaw === null
            ? null
            : null;

      projects.push({
        project_id: projectId,
        display_name: displayName,
        municipality_key: municipalityKey,
        permit_type_key: permitTypeKey,
        created_at: createdAt
      });
    }

    next.projects = projects;
  }

  if (isRecord(value.projectValues)) {
    const projectValues: Record<string, Record<string, any>> = {};

    for (const [projectId, projectValue] of Object.entries(value.projectValues)) {
      if (isRecord(projectValue)) {
        projectValues[projectId] = projectValue as Record<string, any>;
      }
    }

    next.projectValues = projectValues;
  }

  return next;
};

export const loadSnapshot = async (): Promise<Store> => {
  try {
    const snapshot = await readFile(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(snapshot) as unknown;
    store = normalizeStore(parsed);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      store = createDefaultStore();
      return store;
    }

    throw err;
  }

  return store;
};

export const saveSnapshot = async (): Promise<void> => {
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  await writeFile(SNAPSHOT_PATH, JSON.stringify(store, null, 2), "utf8");
};
