import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import { saveSnapshot, store, type ProjectRecord } from "../storage.js";

const PROJECT_ID_PREFIX = "PRJ-";
const PROJECT_ID_DIGITS = 6;

const coerceRequiredKey = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const coerceOptionalName = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const generateProjectId = (): string => {
  const existing = new Set(store.projects.map((project) => project.project_id));

  for (let attempt = 0; attempt < 1_000; attempt += 1) {
    const random = Math.floor(Math.random() * 10 ** PROJECT_ID_DIGITS)
      .toString()
      .padStart(PROJECT_ID_DIGITS, "0");
    const candidate = `${PROJECT_ID_PREFIX}${random}`;

    if (!existing.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate project ID");
};

export const projectsRouter = Router();

projectsRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const municipalityKey = coerceRequiredKey(req.body?.municipalityKey);
      const permitTypeKey = coerceRequiredKey(req.body?.permitTypeKey);
      const displayName = coerceOptionalName(req.body?.displayName);

      const missing: string[] = [];

      if (!municipalityKey) {
        missing.push("municipalityKey");
      }

      if (!permitTypeKey) {
        missing.push("permitTypeKey");
      }

      if (missing.length > 0) {
        res.status(400).json({
          error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`
        });
        return;
      }

      const projectId = generateProjectId();
      const createdAt = new Date().toISOString();

      const record: ProjectRecord = {
        project_id: projectId,
        display_name: displayName,
        municipality_key: municipalityKey,
        permit_type_key: permitTypeKey,
        created_at: createdAt
      };

      store.projects.push(record);
      store.projectValues[projectId] = {};

      await saveSnapshot();

      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }
);

projectsRouter.get("/", (_req: Request, res: Response) => {
  res.json(store.projects);
});
