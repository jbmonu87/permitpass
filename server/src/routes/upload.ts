import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import multer from "multer";

import { saveSnapshot, store } from "../storage.js";

const upload = multer({ storage: multer.memoryStorage() });

const UPLOAD_ROOT = path.resolve("uploads");

const coerceField = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
    }
  }

  return null;
};

const sanitizePathSegment = (value: string): string => {
  const sanitized = value.replace(/[^a-zA-Z0-9-_]/g, "_");
  return sanitized.length > 0 ? sanitized : "upload";
};

export const uploadRouter = Router();

uploadRouter.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = coerceField(req.body?.projectId);
      const docTypeKey = coerceField(req.body?.doc_type_key);

      const missing: string[] = [];

      if (!projectId) {
        missing.push("projectId");
      }

      if (!docTypeKey) {
        missing.push("doc_type_key");
      }

      if (missing.length > 0) {
        res.status(400).json({
          ok: false,
          error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`
        });
        return;
      }

      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        res.status(400).json({
          ok: false,
          error: "Missing file upload"
        });
        return;
      }

      const safeProjectId = sanitizePathSegment(projectId);
      const uploadDir = path.join(UPLOAD_ROOT, safeProjectId);

      await mkdir(uploadDir, { recursive: true });

      const extension = path.extname(file.originalname ?? "");
      const fileName = `${randomUUID()}${extension}`;
      const absolutePath = path.join(uploadDir, fileName);
      await writeFile(absolutePath, file.buffer);

      const storagePath = path.posix.join(safeProjectId, fileName);

      const document = {
        project_id: projectId,
        doc_type_key: docTypeKey,
        status: "received",
        storage_path: storagePath,
        uploaded_at: new Date().toISOString()
      } as const;

      store.documents.push(document);
      await saveSnapshot();

      res.json({ ok: true, document });
    } catch (error) {
      next(error);
    }
  }
);
