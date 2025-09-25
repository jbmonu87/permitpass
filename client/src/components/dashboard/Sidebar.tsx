import React from "react";

import { Project } from "../../lib/types";
import { statusLabel } from "../../lib/status";
import { StatusDot } from "./StatusDot";

type Props = {
  projects: Project[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Sidebar: React.FC<Props> = ({ projects, selectedId, onSelect }) => {
  const [filter, setFilter] = React.useState("");
  const [openOpen, setOpenOpen] = React.useState(true);
  const [openClosed, setOpenClosed] = React.useState(true);

  const lowerFilter = filter.trim().toLowerCase();
  const match = React.useCallback(
    (project: Project) =>
      lowerFilter.length === 0 ||
      project.name.toLowerCase().includes(lowerFilter) ||
      project.municipality.toLowerCase().includes(lowerFilter),
    [lowerFilter]
  );

  const openProjects = projects.filter((project) => !project.isClosed).filter(match);
  const closedProjects = projects.filter((project) => project.isClosed).filter(match);

  return (
    <aside className="flex h-screen w-[320px] shrink-0 flex-col border-r bg-white/70 backdrop-blur">
      <div className="border-b px-4 pb-3 pt-4">
        <h2 className="text-sm font-semibold text-slate-700">Projects</h2>
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter projects…"
          className="mt-2 w-full rounded-md border px-2 py-1 text-sm"
        />
      </div>

      <div className="flex-1 space-y-6 overflow-auto px-4 py-4">
        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500"
            onClick={() => setOpenOpen((value) => !value)}
          >
            <span>
              Open ({openProjects.length})
            </span>
            <ChevronDownIcon className={`h-4 w-4 transition ${openOpen ? "rotate-180" : ""}`} />
          </button>
          {openOpen ? (
            <ul className="mt-2 space-y-1">
              {openProjects.map((project) => {
                const selected = selectedId === project.id;
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                        selected ? "bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200" : "hover:bg-slate-100"
                      }`}
                      onClick={() => onSelect(project.id)}
                    >
                      <div className="flex items-center gap-2">
                        <StatusDot status={project.status} />
                        <span className="line-clamp-1">{project.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{statusLabel[project.status]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500"
            onClick={() => setOpenClosed((value) => !value)}
          >
            <span>
              Closed ({closedProjects.length})
            </span>
            <ChevronDownIcon className={`h-4 w-4 transition ${openClosed ? "rotate-180" : ""}`} />
          </button>
          {openClosed ? (
            <ul className="mt-2 space-y-1">
              {closedProjects.map((project) => {
                const selected = selectedId === project.id;
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                        selected ? "bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200" : "hover:bg-slate-100"
                      }`}
                      onClick={() => onSelect(project.id)}
                    >
                      <div className="flex items-center gap-2">
                        <StatusDot status={project.status} />
                        <span className="line-clamp-1">{project.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{statusLabel[project.status]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t px-4 py-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>● red = not started</span>
          <span>● yellow = in progress</span>
          <span>● green = ready</span>
          <span>✓ green = submitted</span>
        </div>
      </div>
    </aside>
  );
};
