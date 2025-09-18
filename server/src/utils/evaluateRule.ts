const comparisonPattern =
  /^([\w$.[\]-]+)\s*(<=|>=|===|!==|==|!=|<|>)\s*(.+)$/;

const pathTokenPattern = /([^\[\]]+)|\[(?:(-?\d+)|"([^"]+)"|'([^']+)')\]/g;

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const parseLiteral = (raw: string): { value: unknown; isQuoted: boolean } => {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return { value: "", isQuoted: false };
  }

  const firstChar = trimmed[0];
  const lastChar = trimmed[trimmed.length - 1];

  if (
    (firstChar === '"' && lastChar === '"') ||
    (firstChar === "'" && lastChar === "'")
  ) {
    return { value: trimmed.slice(1, -1), isQuoted: true };
  }

  const lower = trimmed.toLowerCase();
  if (lower === "true") {
    return { value: true, isQuoted: false };
  }

  if (lower === "false") {
    return { value: false, isQuoted: false };
  }

  if (lower === "null") {
    return { value: null, isQuoted: false };
  }

  if (lower === "undefined") {
    return { value: undefined, isQuoted: false };
  }

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    return { value: numeric, isQuoted: false };
  }

  return { value: trimmed, isQuoted: false };
};

const toComparableString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value);
};

const normalizeComparableValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed === "") {
      return "";
    }

    const lower = trimmed.toLowerCase();
    if (lower === "true") {
      return true;
    }

    if (lower === "false") {
      return false;
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    return trimmed;
  }

  return value;
};

const getNestedValue = (
  source: Record<string, unknown>,
  path: string
): unknown => {
  if (!path) {
    return undefined;
  }

  const segments = path
    .split(".")
    .flatMap<(string | number)>((segment) => {
      const tokens: (string | number)[] = [];
      let match: RegExpExecArray | null;
      pathTokenPattern.lastIndex = 0;

      while ((match = pathTokenPattern.exec(segment)) !== null) {
        if (match[1] !== undefined) {
          tokens.push(match[1]);
        } else if (match[2] !== undefined) {
          tokens.push(Number(match[2]));
        } else if (match[3] !== undefined) {
          tokens.push(match[3]);
        } else if (match[4] !== undefined) {
          tokens.push(match[4]);
        }
      }

      if (tokens.length === 0) {
        tokens.push(segment);
      }

      return tokens;
    });

  return segments.reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) {
      return undefined;
    }

    if (typeof key === "number") {
      return Array.isArray(acc) ? acc[key] : undefined;
    }

    if (typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, source);
};

const compareNumbers = (
  left: number,
  operator: string,
  right: number
): boolean => {
  switch (operator) {
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    default:
      return false;
  }
};

const compareEquality = (
  leftValue: unknown,
  operator: "==" | "===" | "!=" | "!==",
  rightValue: unknown,
  isQuoted: boolean
): boolean => {
  if (isQuoted) {
    const leftString = toComparableString(leftValue);
    const rightString = toComparableString(rightValue);
    const isEqual = leftString === rightString;
    return operator === "!=" || operator === "!==" ? !isEqual : isEqual;
  }

  const normalizedLeft = normalizeComparableValue(leftValue);
  const normalizedRight = normalizeComparableValue(rightValue);
  const isEqual = normalizedLeft === normalizedRight;
  return operator === "!=" || operator === "!==" ? !isEqual : isEqual;
};

export const evaluateRule = (
  rule: string,
  values: Record<string, unknown>
): boolean => {
  if (typeof rule !== "string") {
    return false;
  }

  const trimmedRule = rule.trim();

  if (trimmedRule === "") {
    return true;
  }

  const lowerRule = trimmedRule.toLowerCase();
  if (lowerRule === "true") {
    return true;
  }

  if (lowerRule === "false") {
    return false;
  }

  const comparisonMatch = trimmedRule.match(comparisonPattern);
  if (!comparisonMatch) {
    return false;
  }

  const [, rawLeft, operator, rawRight] = comparisonMatch;
  const leftKey = rawLeft.trim();

  if (!leftKey) {
    return false;
  }

  const leftValue = getNestedValue(values, leftKey);
  if (leftValue === undefined || leftValue === null) {
    return false;
  }

  const { value: rightValue, isQuoted } = parseLiteral(rawRight);

  if (["<", "<=", ">", ">="].includes(operator)) {
    const leftNumber = toNumber(leftValue);
    const rightNumber = toNumber(rightValue);

    if (leftNumber === null || rightNumber === null) {
      return false;
    }

    return compareNumbers(leftNumber, operator, rightNumber);
  }

  if (["==", "===", "!=", "!=="].includes(operator)) {
    return compareEquality(
      leftValue,
      operator as "==" | "===" | "!=" | "!==",
      rightValue,
      isQuoted
    );
  }

  return false;
};
