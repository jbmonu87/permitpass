import assert from "node:assert/strict";
import test from "node:test";

import { evaluateRule } from "../evaluateRule.js";

test("returns true for literal 'true'", () => {
  assert.strictEqual(evaluateRule("true"), true);
});

test("returns false for literal 'false'", () => {
  assert.strictEqual(evaluateRule("false"), false);
});

test("treats empty rules as true", () => {
  assert.strictEqual(evaluateRule(""), true);
  assert.strictEqual(evaluateRule(undefined), true);
});

test("evaluates equality expressions when project value is present", () => {
  const result = evaluateRule('project_value("Zoning District") = "Residential"', {
    projectValues: {
      "Zoning District": "Residential"
    }
  });

  assert.strictEqual(result, true);
});

test("returns false when the project value is missing", () => {
  const result = evaluateRule('project_value("Zoning District") = "Residential"', {
    projectValues: {}
  });

  assert.strictEqual(result, false);
});
