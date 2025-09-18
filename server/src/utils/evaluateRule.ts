// server/src/utils/evaluateRule.ts
// Minimal, battle-tested evaluator for our v1 rules.
// Supports: "true", "false", "", and simple numeric comparisons like
//   ev_breaker_amps >= 50
// Reads values from projectValues[projectId] (caller passes as `values`).

export function evaluateRule(
  rule: string | undefined | null,
  values: Record<string, any> | undefined | null
): boolean {
  const r = (rule ?? "").trim();
  if (!r || r.toLowerCase() === "false") return false;
  if (r.toLowerCase() === "true") return true;

  // key OP number   e.g.,  ev_breaker_amps >= 50
  const m = r.match(/^([a-zA-Z0-9_]+)\s*(==|!=|>=|<=|>|<)\s*([-+]?\d+(?:\.\d+)?)$/);
  if (!m) return false;

  const [, key, op, rhsStr] = m;
  const lhs = Number(values?.[key]);
  const rhs = Number(rhsStr);
  if (Number.isNaN(lhs) || Number.isNaN(rhs)) return false;

  switch (op) {
    case "==": return lhs == rhs;   // loose compare allows "50" vs 50
    case "!=": return lhs != rhs;
    case ">=": return lhs >= rhs;
    case "<=": return lhs <= rhs;
    case ">":  return lhs >  rhs;
    case "<":  return lhs <  rhs;
    default:   return false;
  }
}

export default evaluateRule;
