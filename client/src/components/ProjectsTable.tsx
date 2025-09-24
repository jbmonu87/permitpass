import { useState } from "react";

import Card from "./Card";
import Spinner from "./Spinner";
import Empty from "./Empty";
import ErrorState from "./ErrorState";
import Badge, { type BadgeVariant } from "./Badge";
import { useProjectsQuery } from "../hooks/useProjectsQuery";

const getStatusBadge = (status?: string) => {
  if (!status) {
    return <span className="text-slate-400">—</span>;
  }

  const normalized = status.toLowerCase();
  let variant: BadgeVariant = "gray";
  let label = status;

  if (normalized.includes("ready")) {
    variant = "green";
    label = "Ready";
  } else if (normalized.includes("missing")) {
    variant = "red";
    label = "Missing";
  } else if (normalized.includes("attention") || normalized.includes("review")) {
    variant = "yellow";
    label = "Needs attention";
  }

  return <Badge variant={variant}>{label}</Badge>;
};

const ProjectsTable = () => {
  const [search, setSearch] = useState("");
  const { data, isPending, isError, error, refetch, isFetching } = useProjectsQuery(search);

  const showSkeleton = isPending && !data;
  const items = data?.items ?? [];

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500">Search and review recent project imports.</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 focus:ring-offset-white"
          disabled={isFetching}
        >
          {isFetching ? <Spinner className="h-4 w-4" /> : null}
          <span>{isFetching ? "Refreshing" : "Refresh"}</span>
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <input
          id="project-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by project ID or name"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div className="mt-4 grow overflow-hidden rounded-xl border border-slate-200">
        {isError ? (
          <div className="p-4">
            <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => void refetch()} />
          </div>
        ) : showSkeleton ? (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <tbody className="divide-y divide-slate-100 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : items.length === 0 ? (
          <div className="p-6">
            <Empty title="No projects yet" description="Upload a CSV to import new projects." />
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Project ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((project) => (
                  <tr key={project.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{project.id}</td>
                    <td className="px-4 py-3 text-slate-700">{project.name}</td>
                    <td className="px-4 py-3">{getStatusBadge(project.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectsTable;
