import assert from "node:assert/strict";
import path from "node:path";
import { readFile, rm } from "node:fs/promises";

import request from "supertest";

import { createApp } from "../src/app.js";
import { store } from "../src/storage.js";

const SNAPSHOT_DIR = path.resolve(".local");
const SNAPSHOT_PATH = path.join(SNAPSHOT_DIR, "snapshot.json");
const UPLOADS_ROOT = path.resolve("uploads");

const removePath = async (target: string) => {
  await rm(target, { recursive: true, force: true });
};

const isWithinUploads = (target: string): boolean => {
  const relative = path.relative(UPLOADS_ROOT, target);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
};

type UploadResponseDocument = {
  project_id: string;
  doc_type_key: string;
  status: string;
  storage_path: string;
  uploaded_at: string;
};

let storedRelativePath: string | null = null;

const main = async () => {
  await removePath(SNAPSHOT_DIR);

  store.documentTypes = [];
  store.supplementalRequirements = [];
  store.documents = [];
  store.projectValues = {};

  const app = createApp();
  const initialCount = store.documents.length;

  const response = await request(app)
    .post("/api/upload")
    .field("projectId", "test-project")
    .field("doc_type_key", "test-doc")
    .attach("file", Buffer.from("hello world"), "greeting.txt");

  assert.equal(response.status, 200, "expected 200 OK");
  assert.equal(response.body.ok, true, "expected ok: true in response body");

  const document = response.body.document as UploadResponseDocument;
  assert.ok(document, "expected document payload");

  storedRelativePath = document.storage_path;

  assert.equal(document.project_id, "test-project");
  assert.equal(document.doc_type_key, "test-doc");
  assert.equal(document.status, "received");
  assert.equal(typeof document.uploaded_at, "string");
  assert.ok(!Number.isNaN(Date.parse(document.uploaded_at)), "uploaded_at should be ISO timestamp");

  assert.equal(store.documents.length, initialCount + 1, "store should include new document record");
  assert.deepEqual(
    store.documents.at(-1),
    document,
    "latest store document should match response"
  );

  const snapshotContents = await readFile(SNAPSHOT_PATH, "utf8");
  const snapshot = JSON.parse(snapshotContents) as { documents?: unknown[] };
  const snapshotDocuments = Array.isArray(snapshot.documents) ? snapshot.documents : [];

  assert.equal(
    snapshotDocuments.length,
    initialCount + 1,
    "snapshot should include the uploaded document"
  );

  const lastSnapshotDocument = snapshotDocuments.at(-1) as UploadResponseDocument | undefined;
  assert.deepEqual(lastSnapshotDocument, document, "snapshot should persist the uploaded document");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await removePath(SNAPSHOT_DIR);

    if (storedRelativePath) {
      const uploadDirectory = path.resolve(
        UPLOADS_ROOT,
        path.dirname(storedRelativePath)
      );

      if (isWithinUploads(uploadDirectory)) {
        await removePath(uploadDirectory);
      }
    }
  });
