import assert from "node:assert/strict";
import path from "node:path";
import { readFile, rm } from "node:fs/promises";

import request from "supertest";

import { createApp } from "../src/app.js";
import { store, type ProjectRecord } from "../src/storage.js";

const SNAPSHOT_DIR = path.resolve(".local");
const SNAPSHOT_PATH = path.join(SNAPSHOT_DIR, "snapshot.json");

const removePath = async (target: string) => {
  await rm(target, { recursive: true, force: true });
};

const PROJECT_ID_PATTERN = /^PRJ-\d{6}$/;

const main = async () => {
  await removePath(SNAPSHOT_DIR);

  store.documentTypes = [];
  store.supplementalRequirements = [];
  store.documents = [];
  store.projects = [];
  store.projectValues = {};

  const app = createApp();

  const postResponse = await request(app)
    .post("/api/projects")
    .send({
      municipalityKey: "gotham",
      permitTypeKey: "residential_addition",
      displayName: "Wayne Manor"
    });

  assert.equal(postResponse.status, 201, "expected 201 Created");

  const project = postResponse.body as ProjectRecord;
  assert.ok(project, "expected project payload");

  assert.match(project.project_id, PROJECT_ID_PATTERN, "expected PRJ-XXXXXX project id");
  assert.equal(project.municipality_key, "gotham");
  assert.equal(project.permit_type_key, "residential_addition");
  assert.equal(project.display_name, "Wayne Manor");
  assert.equal(typeof project.created_at, "string");
  assert.ok(!Number.isNaN(Date.parse(project.created_at)), "created_at should be ISO timestamp");

  assert.equal(store.projects.length, 1, "store should include the new project");
  assert.deepEqual(store.projects[0], project, "stored project should match response");
  assert.deepEqual(store.projectValues[project.project_id], {}, "projectValues should initialize empty record");

  const listResponse = await request(app).get("/api/projects");
  assert.equal(listResponse.status, 200, "expected 200 OK when listing projects");
  assert.deepEqual(listResponse.body, [project], "listing should return stored project");

  const snapshotContents = await readFile(SNAPSHOT_PATH, "utf8");
  const snapshot = JSON.parse(snapshotContents) as {
    projects?: ProjectRecord[];
    projectValues?: Record<string, unknown>;
  };

  assert.deepEqual(snapshot.projects ?? [], [project], "snapshot should persist project");
  assert.ok(snapshot.projectValues, "snapshot should include projectValues");
  assert.deepEqual(
    snapshot.projectValues?.[project.project_id],
    {},
    "snapshot should initialize projectValues for new project"
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await removePath(SNAPSHOT_DIR);
  });
