const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseRuleInput = (input: unknown): unknown => {
  if (typeof input !== "string") {
    return input;
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return true;
  }

  const lower = trimmed.toLowerCase();

  if (lower === "true") {
    return true;
  }

  if (lower === "false") {
    return false;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return input;
  }
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number(trimmed);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
};

const normalizeComparisonValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return "";
    }

    const lower = trimmed.toLowerCase();

    if (lower === "true") {
      return true;
    }

    if (lower === "false") {
      return false;
    }

    const numeric = toNumber(trimmed);

    if (numeric !== null) {
      return numeric;
    }

    return trimmed;
  }

  return value;
};

const valuesEqual = (left: unknown, right: unknown): boolean => {
  const normalizedLeft = normalizeComparisonValue(left);
  const normalizedRight = normalizeComparisonValue(right);

  if (Array.isArray(normalizedLeft)) {
    if (Array.isArray(normalizedRight)) {
      if (normalizedLeft.length !== normalizedRight.length) {
        return false;
      }

      return normalizedLeft.every((value, index) => valuesEqual(value, normalizedRight[index]));
    }

    return normalizedLeft.some((value) => valuesEqual(value, normalizedRight));
  }

  if (Array.isArray(normalizedRight)) {
    return normalizedRight.some((value) => valuesEqual(normalizedLeft, value));
  }

  return normalizedLeft === normalizedRight;
};

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

const gatherExpectedValues = (record: Record<string, unknown>): unknown[] => {
  const candidates = [
    record.values,
    record.value,
    record.matches,
    record.equals,
    record.expected,
    record.options,
    record.in,
    record.oneOf,
    record.anyOf,
    record.allOf,
    record.contains,
    record.threshold,
    record.expectedValue,
    record.target,
    record.targets
  ];

  const values: unknown[] = [];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) {
      continue;
    }

    if (Array.isArray(candidate)) {
      values.push(...candidate.map((entry) => normalizeComparisonValue(entry)));
      continue;
    }

    if (typeof candidate === "string") {
      const trimmed = candidate.trim();

      if (trimmed.length === 0) {
        continue;
      }

      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed) as unknown;

          if (Array.isArray(parsed)) {
            values.push(...parsed.map((entry) => normalizeComparisonValue(entry)));
            continue;
          }

          values.push(normalizeComparisonValue(parsed));
          continue;
        } catch {
          // Ignore JSON parse failure and fall through to comma handling.
        }
      }

      if (trimmed.includes(",")) {
        const parts = trimmed
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0);

        if (parts.length > 1) {
          values.push(...parts.map((part) => normalizeComparisonValue(part)));
          continue;
        }
      }

      values.push(normalizeComparisonValue(trimmed));
      continue;
    }

    values.push(normalizeComparisonValue(candidate));
  }

  return values;
};

const compareNumbers = (left: unknown, right: unknown): number | null => {
  const leftNumber = toNumber(left);
  const rightNumber = toNumber(right);

  if (leftNumber === null || rightNumber === null) {
    return null;
  }

  if (leftNumber > rightNumber) {
    return 1;
  }

  if (leftNumber < rightNumber) {
    return -1;
  }

  return 0;
};

const getFirstArray = (record: Record<string, unknown>, keys: string[]): unknown[] => {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const getFirstString = (record: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();

    if (trimmed === "true") {
      return true;
    }

    if (trimmed === "false") {
      return false;
    }
  }

  return undefined;
};

const getValueByPath = (values: Record<string, unknown>, path: string): unknown => {
  const segments = path
    .split(".")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  let current: unknown = values;

  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number(segment);

      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return undefined;
      }

      current = current[index];
      continue;
    }

    if (!isRecord(current)) {
      return undefined;
    }

    if (!(segment in current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
};

const containsValue = (actual: unknown, expectedValues: unknown[]): boolean => {
  if (expectedValues.length === 0) {
    return false;
  }

  if (Array.isArray(actual)) {
    return expectedValues.some((expected) =>
      actual.some((value) => valuesEqual(value, expected))
    );
  }

  if (typeof actual === "string") {
    const normalizedActual = actual.toLowerCase();

    return expectedValues.some((expected) => {
      if (typeof expected === "string") {
        return normalizedActual.includes(expected.toLowerCase());
      }

      return false;
    });
  }

  return expectedValues.some((expected) => valuesEqual(actual, expected));
};

const matchAny = (actual: unknown, expectedValues: unknown[]): boolean => {
  if (expectedValues.length === 0) {
    return !isEmptyValue(actual);
  }

  if (Array.isArray(actual)) {
    return actual.some((value) => matchAny(value, expectedValues));
  }

  return expectedValues.some((expected) => valuesEqual(actual, expected));
};

const matchNone = (actual: unknown, expectedValues: unknown[]): boolean => {
  if (expectedValues.length === 0) {
    return true;
  }

  return !matchAny(actual, expectedValues);
};

const evaluateCondition = (
  condition: Record<string, unknown>,
  projectValues: Record<string, unknown>
): boolean => {
  const key = getFirstString(condition, [
    "project_value_key",
    "projectValueKey",
    "project_values_key",
    "value_key",
    "fact",
    "key",
    "field",
    "path",
    "property",
    "attribute"
  ]);

  const operator = (
    getFirstString(condition, [
      "operator",
      "op",
      "comparison",
      "comparator",
      "condition",
      "type",
      "presence"
    ]) ?? "equals"
  ).toLowerCase();

  if (!key) {
    if (operator === "always" || operator === "true") {
      return true;
    }

    if (operator === "never" || operator === "false") {
      return false;
    }

    const boolValue = toBoolean(condition.value ?? condition.result ?? condition.default);

    if (typeof boolValue === "boolean") {
      return boolValue;
    }

    return false;
  }

  const actual = getValueByPath(projectValues, key);
  const expectedValues = gatherExpectedValues(condition);

  switch (operator) {
    case "equals":
    case "eq":
    case "==":
    case "is":
    case "===":
      return matchAny(actual, expectedValues.length > 0 ? expectedValues : [true]);
    case "not_equals":
    case "not-equals":
    case "ne":
    case "neq":
    case "!=":
    case "!==":
    case "is_not":
      return matchNone(actual, expectedValues);
    case "in":
    case "one_of":
    case "includes":
    case "any_of":
      return matchAny(actual, expectedValues);
    case "not_in":
    case "none_of":
    case "excludes":
      return matchNone(actual, expectedValues);
    case "contains":
      return containsValue(actual, expectedValues);
    case "not_contains":
      return !containsValue(actual, expectedValues);
    case "greater_than":
    case "gt":
    case ">": {
      const comparison = compareNumbers(actual, expectedValues[0]);
      return comparison !== null && comparison > 0;
    }
    case "greater_than_or_equal":
    case "gte":
    case "ge":
    case ">=": {
      const comparison = compareNumbers(actual, expectedValues[0]);
      return comparison !== null && comparison >= 0;
    }
    case "less_than":
    case "lt":
    case "<": {
      const comparison = compareNumbers(actual, expectedValues[0]);
      return comparison !== null && comparison < 0;
    }
    case "less_than_or_equal":
    case "lte":
    case "le":
    case "<=": {
      const comparison = compareNumbers(actual, expectedValues[0]);
      return comparison !== null && comparison <= 0;
    }
    case "exists":
    case "present":
    case "defined":
    case "is_defined":
    case "is_not_blank":
      return !isEmptyValue(actual);
    case "not_exists":
    case "absent":
    case "undefined":
    case "is_blank":
    case "missing":
      return isEmptyValue(actual);
    case "truthy":
      return Boolean(actual);
    case "falsy":
      return !actual;
    case "always":
    case "true":
      return true;
    case "never":
    case "false":
      return false;
    default:
      return false;
  }
};

const evaluateNode = (
  rule: unknown,
  projectValues: Record<string, unknown>
): boolean => {
  const node = parseRuleInput(rule);

  if (node === null || node === undefined) {
    return true;
  }

  if (typeof node === "boolean") {
    return node;
  }

  if (typeof node === "string") {
    const trimmed = node.trim();

    if (trimmed.length === 0) {
      return true;
    }

    const lower = trimmed.toLowerCase();

    if (lower === "true") {
      return true;
    }

    if (lower === "false") {
      return false;
    }

    const directValue = getValueByPath(projectValues, trimmed);

    if (directValue !== undefined) {
      return Boolean(directValue);
    }

    return Boolean(trimmed);
  }

  if (Array.isArray(node)) {
    if (node.length === 0) {
      return true;
    }

    return node.every((child) => evaluateNode(child, projectValues));
  }

  if (!isRecord(node)) {
    return Boolean(node);
  }

  const type = typeof node.type === "string" ? node.type.toLowerCase() : undefined;
  const combinator =
    typeof node.combinator === "string" ? node.combinator.toLowerCase() : undefined;
  const condition =
    typeof node.condition === "string" ? node.condition.toLowerCase() : undefined;

  if (type === "always" || type === "true") {
    return true;
  }

  if (type === "never" || type === "false") {
    return false;
  }

  if (Array.isArray(node.all)) {
    return node.all.every((child) => evaluateNode(child, projectValues));
  }

  if (Array.isArray(node.any)) {
    return node.any.some((child) => evaluateNode(child, projectValues));
  }

  if (Array.isArray(node.none)) {
    return node.none.every((child) => !evaluateNode(child, projectValues));
  }

  if (node.not !== undefined) {
    return !evaluateNode(node.not, projectValues);
  }

  if (
    type === "all" ||
    type === "and" ||
    combinator === "all" ||
    combinator === "and" ||
    condition === "and"
  ) {
    const children = getFirstArray(node, [
      "rules",
      "conditions",
      "children",
      "expressions",
      "operands"
    ]);

    if (children.length > 0) {
      return children.every((child) => evaluateNode(child, projectValues));
    }
  }

  if (
    type === "any" ||
    type === "or" ||
    combinator === "any" ||
    combinator === "or" ||
    condition === "or"
  ) {
    const children = getFirstArray(node, [
      "rules",
      "conditions",
      "children",
      "expressions",
      "operands"
    ]);

    if (children.length > 0) {
      return children.some((child) => evaluateNode(child, projectValues));
    }
  }

  if (type === "not") {
    const child =
      node.rule ??
      node.condition ??
      node.child ??
      node.expression ??
      node.operand ??
      node.value;

    if (child !== undefined) {
      return !evaluateNode(child, projectValues);
    }
  }

  return evaluateCondition(node, projectValues);
};

export const evaluateRule = (
  rule: unknown,
  projectValues: Record<string, unknown>
): boolean => evaluateNode(rule, projectValues ?? {});
