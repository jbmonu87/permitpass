import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchFormValues,
  fetchMunicipalities,
  fetchMunicipalitySchema,
  fetchProject,
  fetchProjects,
  saveFormValue,
  updateProject
} from "../lib/api";
import { MunicipalitySchema, Project, ProjectFormValues } from "../lib/types";
import { Sidebar } from "../components/dashboard/Sidebar";
import { UploadTile } from "../components/dashboard/UploadTile";
import { Section } from "../components/dashboard/Section";
import { FieldInput } from "../components/dashboard/FieldInput";
import { AiAssistant } from "../components/dashboard/AiAssistant";

const STATES = ["CA", "MA", "NY", "NJ", "WA"] as const;

const MUNICIPALITIES_BY_STATE: Record<string, string[]> = {
  CA: ["San Francisco", "Los Angeles"],
  MA: ["Cumberland", "Springfield"],
  NY: ["Albany", "Brooklyn"],
  NJ: ["Hoboken", "Newark"],
  WA: ["Seattle", "Spokane"]
};

const MUNICIPALITY_TO_STATE = Object.entries(MUNICIPALITIES_BY_STATE).reduce<Record<string, string>>(
  (acc, [state, municipalities]) => {
    municipalities.forEach((municipality) => {
      acc[municipality] = state;
    });
    return acc;
  },
  {}
);

const WORK_SCOPE_OPTIONS = [
  { value: "ev", label: "EV Charger" },
  { value: "solar", label: "Solar Panels" },
  { value: "deck", label: "Deck" },
  { value: "adu", label: "Accessory Dwelling Unit" },
  { value: "interior", label: "Interior Remodel" },
  { value: "commercial", label: "Commercial Fit-out" }
];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);
  const [selectedState, setSelectedState] = React.useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = React.useState<string>("");

  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const projects = projectsQuery.data ?? [];

  React.useEffect(() => {
    if (!selectedId && projects.length > 0) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const projectQuery = useQuery({
    queryKey: ["project", selectedId],
    queryFn: () => fetchProject(selectedId as string),
    enabled: Boolean(selectedId)
  });

  const project = projectQuery.data;

  React.useEffect(() => {
    if (!project) return;
    setSelectedState((prev) => {
      const derived = project.state ?? MUNICIPALITY_TO_STATE[project.municipality] ?? prev;
      return derived ?? "";
    });
    setSelectedMunicipality(project.municipality ?? "");
  }, [project?.id, project?.state, project?.municipality]);

  const municipalitiesQuery = useQuery({
    queryKey: ["municipalities"],
    queryFn: fetchMunicipalities
  });

  const schemaMunicipality = selectedMunicipality || project?.municipality || "";

  const schemaQuery = useQuery<MunicipalitySchema>({
    queryKey: ["schema", schemaMunicipality],
    queryFn: () => fetchMunicipalitySchema(schemaMunicipality),
    enabled: schemaMunicipality.length > 0
  });

  const valuesQuery = useQuery<ProjectFormValues>({
    queryKey: ["values", selectedId],
    queryFn: () => fetchFormValues(selectedId as string),
    enabled: Boolean(selectedId)
  });

  const saveField = useMutation({
    mutationFn: ({ fieldId, value }: { fieldId: string; value: unknown }) => saveFormValue(selectedId as string, fieldId, value),
    onMutate: async ({ fieldId, value }) => {
      await queryClient.cancelQueries({ queryKey: ["values", selectedId] });
      const previousValues = queryClient.getQueryData<ProjectFormValues>(["values", selectedId]);
      queryClient.setQueryData<ProjectFormValues>(["values", selectedId], (old) => ({
        ...(old ?? {}),
        [fieldId]: value
      }));
      return { previousValues };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousValues) {
        queryClient.setQueryData(["values", selectedId], context.previousValues);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["values", selectedId] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: (patch: Partial<Project>) => updateProject(selectedId as string, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["project", selectedId] });
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProject = queryClient.getQueryData<Project>(["project", selectedId]);
      const previousProjects = queryClient.getQueryData<Project[]>(["projects"]);
      const optimisticTimestamp = new Date().toISOString();
      if (previousProject) {
        queryClient.setQueryData<Project>(["project", selectedId], {
          ...previousProject,
          ...patch,
          updatedAt: optimisticTimestamp
        });
      }
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(["projects"], previousProjects.map((item) => {
          if (item.id !== selectedId) return item;
          return {
            ...item,
            ...patch,
            updatedAt: optimisticTimestamp
          };
        }));
      }
      return { previousProject, previousProjects };
    },
    onError: (_error, _patch, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(["project", selectedId], context.previousProject);
      }
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const values = valuesQuery.data ?? {};
  const schema = schemaQuery.data;

  const municipalityOptions = React.useMemo(() => {
    const byState = selectedState ? MUNICIPALITIES_BY_STATE[selectedState] ?? [] : [];
    const all = municipalitiesQuery.data ?? [];
    const combined = new Set<string>([...byState, ...all]);
    return Array.from(combined).map((municipality) => ({ value: municipality, label: municipality }));
  }, [municipalitiesQuery.data, selectedState]);

  const lastUpdated = project?.updatedAt ? new Date(project.updatedAt).toLocaleString() : "—";

  const handleFieldCommit = React.useCallback(
    (fieldId: string, value: unknown) => {
      if (!selectedId) return Promise.resolve();
      return saveField.mutateAsync({ fieldId, value });
    },
    [saveField, selectedId]
  );

  const commitProjectPatch = React.useCallback(
    (patch: Partial<Project>) => {
      if (!selectedId) return Promise.resolve();
      return updateProjectMutation.mutateAsync(patch);
    },
    [selectedId, updateProjectMutation]
  );

  const handleStateChange = React.useCallback(
    async (nextState: string) => {
      setSelectedState(nextState);
      if (!project) return;
      const availableMunicipalities = MUNICIPALITIES_BY_STATE[nextState] ?? [];
      let nextMunicipality = selectedMunicipality;
      if (!nextMunicipality || !availableMunicipalities.includes(nextMunicipality)) {
        nextMunicipality = availableMunicipalities[0] ?? nextMunicipality;
      }
      const patch: Partial<Project> = { state: nextState };
      if (nextMunicipality && nextMunicipality !== project.municipality) {
        patch.municipality = nextMunicipality;
        setSelectedMunicipality(nextMunicipality);
      }
      await commitProjectPatch(patch);
    },
    [commitProjectPatch, project, selectedMunicipality]
  );

  const handleMunicipalityChange = React.useCallback(
    async (nextMunicipality: string) => {
      setSelectedMunicipality(nextMunicipality);
      await commitProjectPatch({ municipality: nextMunicipality });
    },
    [commitProjectPatch]
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar projects={projects} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-20 border-b bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
            <div className="text-sm text-slate-500">Last update: {lastUpdated}</div>
          </div>
        </header>
        <main className="mx-auto max-w-[1200px] px-4 pb-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <Section title="Project Info" subtitle="Name and jurisdiction" collapsible={false}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldInput
                    field={{ id: "project_name", label: "Project name", kind: "text", required: true, placeholder: "117 Longwoods" }}
                    value={project?.name ?? ""}
                    onCommit={async (next) => {
                      await commitProjectPatch({ name: typeof next === "string" ? next : "" });
                    }}
                  />
                  <FieldInput
                    field={{
                      id: "project_state",
                      label: "State",
                      kind: "select",
                      options: STATES.map((state) => ({ value: state, label: state }))
                    }}
                    value={selectedState}
                    onCommit={async (next) => {
                      await handleStateChange(typeof next === "string" ? next : "");
                    }}
                  />
                  <FieldInput
                    field={{
                      id: "project_municipality",
                      label: "Municipality",
                      kind: "select",
                      options: municipalityOptions
                    }}
                    value={selectedMunicipality}
                    onCommit={async (next) => {
                      await handleMunicipalityChange(typeof next === "string" ? next : "");
                    }}
                  />
                  <FieldInput
                    field={{
                      id: "project_scope",
                      label: "Work scope",
                      kind: "multiselect",
                      options: WORK_SCOPE_OPTIONS
                    }}
                    value={project?.workScopes ?? []}
                    onCommit={async (next) => {
                      const scopes = Array.isArray(next) ? (next as string[]) : [];
                      await commitProjectPatch({ workScopes: scopes });
                    }}
                  />
                </div>
              </Section>

              {schemaQuery.isPending ? (
                <Section title="Loading schema" collapsible={false}>
                  <div className="py-2 text-sm text-slate-500">Loading schema…</div>
                </Section>
              ) : null}

              {schema &&
                schema.sections.map((section) => (
                  <Section
                    key={section.id}
                    title={section.title}
                    defaultOpen={section.initiallyOpen ?? true}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      {section.fields.map((field) => (
                        <FieldInput
                          key={field.id}
                          field={field}
                          value={values[field.id]}
                          onCommit={(next) => handleFieldCommit(field.id, next)}
                        />
                      ))}
                    </div>
                  </Section>
                ))}
            </div>
            <div className="space-y-4">
              <div className="sticky top-20 space-y-4">
                <UploadTile projectId={selectedId} onUploaded={() => valuesQuery.refetch()} />
                <AiAssistant />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
