export type EvaluateRuleOptions = {
  projectValues?: Record<string, unknown>;
};

type ComparisonOperator = "===" | "==" | "=" | "!==" | "!=" | "<" | ">" | "<=" | ">=";

type ParsedComparison = {
  key: string;
  operator: ComparisonOperator;
  expected: unknown;
};

const comparisonPattern =
  /^(project_value|projectValue)\(\s*(['"])([^"']+)\2\s*\)\s*(===|==|=|!==|!=|<=|>=|<|>)\s*(.+)$/i;

const parseLiteralValue = (value: string): unknown => {
  const trimmed = value.trim();

  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === "true";
  }

  if (/^null$/i.test(trimmed)) {
    return null;
  }

  return trimmed;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const areEqual = (actual: unknown, expected: unknown): boolean => {
  if (expected === null) {
    return actual === null || actual === undefined;
  }

  if (typeof expected === "boolean") {
    if (typeof actual === "boolean") {
      return actual === expected;
    }

    if (typeof actual === "string") {
      const normalized = actual.trim().toLowerCase();
      if (normalized === "true" || normalized === "false") {
        return normalized === String(expected);
      }
    }

    return false;
  }

  if (typeof expected === "number") {
    const actualNumber = toNumber(actual);
    return actualNumber !== null && actualNumber === expected;
  }

  if (typeof expected === "string") {
    if (typeof actual === "string") {
      return actual === expected;
    }

    if (actual === undefined || actual === null) {
      return false;
    }

    return String(actual) === expected;
  }

  return Object.is(actual, expected);
};

const compareNumbers = (
  actual: unknown,
  expected: unknown,
  comparator: (left: number, right: number) => boolean
): boolean => {
  const actualNumber = toNumber(actual);
  const expectedNumber = toNumber(expected);

  if (actualNumber === null || expectedNumber === null) {
    return false;
  }

  return comparator(actualNumber, expectedNumber);
};

const evaluateComparison = (
  actual: unknown,
  operator: ComparisonOperator,
  expected: unknown
): boolean => {
  switch (operator) {
    case "=":
    case "==":
    case "===":
      return areEqual(actual, expected);
    case "!=":
    case "!==":
      return !areEqual(actual, expected);
    case ">":
      return compareNumbers(actual, expected, (left, right) => left > right);
    case ">=":
      return compareNumbers(actual, expected, (left, right) => left >= right);
    case "<":
      return compareNumbers(actual, expected, (left, right) => left < right);
    case "<=":
      return compareNumbers(actual, expected, (left, right) => left <= right);
    default:
      return false;
  }
};

const parseComparisonRule = (rule: string): ParsedComparison | null => {
  const match = rule.match(comparisonPattern);

  if (!match) {
    return null;
  }

  const [, , , key, operator, rawValue] = match;

  return {
    key,
    operator: operator as ComparisonOperator,
    expected: parseLiteralValue(rawValue)
  };
};

export const evaluateRule = (
  rule: string | null | undefined,
  options: EvaluateRuleOptions = {}
): boolean => {
  const trimmed = rule?.trim();

  if (!trimmed) {
    return true;
  }

  const normalized = trimmed.toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  const comparison = parseComparisonRule(trimmed);

  if (!comparison) {
    return false;
  }

  const { projectValues = {} } = options;
  const actual = projectValues[comparison.key];

  if (actual === undefined) {
    return false;
  }

  return evaluateComparison(actual, comparison.operator, comparison.expected);
};
