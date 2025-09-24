import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getJSON } from "../api/api";
import type { Projects } from "../types/projects";
import { toProjects } from "../types/projects";

const filterProjects = (projects: Projects, search: string): Projects => {
  if (!search.trim()) {
    return projects;
  }

  const term = search.trim().toLowerCase();

  return {
    items: projects.items.filter((project) => {
      const matchesId = project.id.toLowerCase().includes(term);
      const matchesName = project.name.toLowerCase().includes(term);
      const matchesStatus = project.status ? project.status.toLowerCase().includes(term) : false;

      return matchesId || matchesName || matchesStatus;
    })
  };
};

export const useProjectsQuery = (search: string) =>
  useQuery<Projects>({
    queryKey: ["projects", search],
    queryFn: async ({ signal }) => {
      const response = await getJSON<unknown>("/api/projects", { signal });
      const projects = toProjects(response);
      return filterProjects(projects, search);
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000
  });
