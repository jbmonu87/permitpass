import { z } from "zod";

export const zProject = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().optional()
});

export type Project = z.infer<typeof zProject>;

export const zProjects = z.object({
  items: z.array(zProject)
});

export type Projects = z.infer<typeof zProjects>;

const zProjectRecord = z.object({
  project_id: z.string(),
  display_name: z.string().nullable().optional(),
  municipality_key: z.string(),
  permit_type_key: z.string(),
  created_at: z.string()
});

const zProjectsResponse = z.array(zProjectRecord);

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues.map((issue) => issue.message).join(", ") || "unknown error";

export const toProjects = (input: unknown): Projects => {
  const rawResult = zProjectsResponse.safeParse(input);

  if (!rawResult.success) {
    throw new Error(`Invalid projects response: ${formatIssues(rawResult.error.issues)}`);
  }

  const normalizedItems = rawResult.data
    .map((record) => ({
      id: record.project_id,
      name: record.display_name?.trim() ? record.display_name : record.project_id,
      status: undefined as string | undefined,
      createdAt: record.created_at
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(({ createdAt, ...project }) => project);

  const result = zProjects.safeParse({ items: normalizedItems });

  if (!result.success) {
    throw new Error(`Invalid projects response: ${formatIssues(result.error.issues)}`);
  }

  return result.data;
};
