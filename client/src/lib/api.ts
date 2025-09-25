import { Project, ProjectFormValues, MunicipalitySchema } from "./types";
import { getMunicipalities, getSchemaForMunicipality } from "./schema";
import { ProjectStatus } from "./status";

const LS_KEY_PROJECTS = "pp_projects";
const LS_KEY_VALUES = "pp_values";

function load<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : fallback;
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const LEGACY_STATUS_MAP: Record<string, ProjectStatus> = {
  not_started: "NOT_STARTED",
  in_progress: "IN_PROGRESS",
  ready_to_submit: "READY"
};

function normalizeProjects(projects: any[]): Project[] {
  let changed = false;
  const normalized = projects.map((project) => {
    const statusValue = typeof project.status === "string" ? project.status : "NOT_STARTED";
    const nextStatus = (LEGACY_STATUS_MAP[statusValue] ?? statusValue) as ProjectStatus;
    if (nextStatus !== project.status) {
      changed = true;
    }

    const workScopes = Array.isArray(project.workScopes) ? project.workScopes : [];
    if (!Array.isArray(project.workScopes) && project.workScopes !== undefined) {
      changed = true;
    }

    return {
      ...project,
      status: nextStatus,
      workScopes: workScopes
    } as Project;
  });

  if (changed) {
    save(LS_KEY_PROJECTS, normalized);
  }

  return normalized;
}

// Seed some projects on first load
function seedIfNeeded() {
  const projects = load<Project[]>(LS_KEY_PROJECTS, []);
  if (projects.length === 0) {
    const now = new Date().toISOString();
    const seeded: Project[] = [
      {
        id: "p1",
        name: "117 Longwoods EV & Deck",
        municipality: "Cumberland",
        status: "IN_PROGRESS",
        isClosed: false,
        updatedAt: now,
        state: "MA",
        workScopes: ["ev", "deck"]
      },
      {
        id: "p2",
        name: "3749 Sierra ADU",
        municipality: "Cumberland",
        status: "NOT_STARTED",
        isClosed: false,
        updatedAt: now,
        state: "MA",
        workScopes: ["adu"]
      },
      {
        id: "p3",
        name: "Oceanview Renovation",
        municipality: "Cumberland",
        status: "READY",
        isClosed: true,
        updatedAt: now,
        state: "MA",
        workScopes: ["interior"]
      },
      {
        id: "p4",
        name: "Retail Fit-out",
        municipality: "Springfield",
        status: "IN_PROGRESS",
        isClosed: true,
        updatedAt: now,
        state: "NJ",
        workScopes: ["commercial"]
      }
    ];
    save(LS_KEY_PROJECTS, seeded);
  }

  const values = load<Record<string, ProjectFormValues>>(LS_KEY_VALUES, {});
  if (!values["p1"]) {
    values["p1"] = { org_name: "GreenBuild LLC" };
    save(LS_KEY_VALUES, values);
  }
}

seedIfNeeded();

export async function fetchProjects(): Promise<Project[]> {
  const all = normalizeProjects(load<Project[]>(LS_KEY_PROJECTS, []));
  await new Promise((resolve) => setTimeout(resolve, 200));
  return all.sort((a, b) => Number(a.isClosed) - Number(b.isClosed));
}

export async function fetchProject(projectId: string): Promise<Project | undefined> {
  const all = normalizeProjects(load<Project[]>(LS_KEY_PROJECTS, []));
  await new Promise((resolve) => setTimeout(resolve, 150));
  return all.find((project) => project.id === projectId);
}

export async function updateProject(projectId: string, patch: Partial<Project>): Promise<Project> {
  const all = normalizeProjects(load<Project[]>(LS_KEY_PROJECTS, []));
  const index = all.findIndex((project) => project.id === projectId);
  if (index < 0) throw new Error("Project not found");
  const updated: Project = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString()
  };
  all[index] = updated;
  save(LS_KEY_PROJECTS, all);
  await new Promise((resolve) => setTimeout(resolve, 100));
  return updated;
}

export async function fetchMunicipalities(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return getMunicipalities();
}

export async function fetchMunicipalitySchema(municipality: string): Promise<MunicipalitySchema> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return getSchemaForMunicipality(municipality);
}

export async function fetchFormValues(projectId: string): Promise<ProjectFormValues> {
  const values = load<Record<string, ProjectFormValues>>(LS_KEY_VALUES, {});
  await new Promise((resolve) => setTimeout(resolve, 100));
  return values[projectId] ?? {};
}

export async function saveFormValue(
  projectId: string,
  fieldId: string,
  value: unknown
): Promise<ProjectFormValues> {
  const values = load<Record<string, ProjectFormValues>>(LS_KEY_VALUES, {});
  const next = { ...(values[projectId] ?? {}), [fieldId]: value };
  values[projectId] = next;
  save(LS_KEY_VALUES, values);
  await new Promise((resolve) => setTimeout(resolve, 100));
  return next;
}

export async function uploadFiles(
  projectId: string,
  files: File[]
): Promise<{ ok: true; count: number }> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  setTimeout(() => {
    const values = load<Record<string, ProjectFormValues>>(LS_KEY_VALUES, {});
    const current = values[projectId] ?? {};
    const enriched = {
      ...current,
      uploaded_summary: `Parsed ${files.length} file(s). Detected 'EV Charger' + 'Final Electrical' inspection.`,
      project_type: current["project_type"] ?? "ev",
      required_inspections: Array.from(
        new Set([...(Array.isArray(current["required_inspections"]) ? (current["required_inspections"] as string[]) : []), "final_elec"])
      )
    };
    values[projectId] = enriched;
    save(LS_KEY_VALUES, values);
  }, 2000);

  return { ok: true, count: files.length };
}
