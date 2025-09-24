import { z } from "zod";

export const zHealth = z.object({
  status: z.enum(["ready", "missing", "needs_attention"]),
  timestamp: z.string()
});

export type Health = z.infer<typeof zHealth>;

const zHealthResponse = z.object({
  status: z.string(),
  timestamp: z.string()
});

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues.map((issue) => issue.message).join(", ") || "unknown error";

const normalizeHealthStatus = (value: string): Health["status"] => {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("healthy") || normalized.includes("ready")) {
    return "ready";
  }

  if (normalized.includes("missing") || normalized.includes("offline") || normalized.includes("down")) {
    return "missing";
  }

  return "needs_attention";
};

export const toHealth = (input: unknown): Health => {
  const rawResult = zHealthResponse.safeParse(input);

  if (!rawResult.success) {
    throw new Error(`Invalid health response: ${formatIssues(rawResult.error.issues)}`);
  }

  const normalized: Health = {
    status: normalizeHealthStatus(rawResult.data.status),
    timestamp: rawResult.data.timestamp
  };

  const result = zHealth.safeParse(normalized);

  if (!result.success) {
    throw new Error(`Invalid health response: ${formatIssues(result.error.issues)}`);
  }

  return result.data;
};
