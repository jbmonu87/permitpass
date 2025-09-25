export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "READY" | "SENT";

export const statusLabel: Record<ProjectStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  READY: "Ready to submit",
  SENT: "Submitted"
};

export function statusDotClasses(status: ProjectStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "bg-red-500";
    case "IN_PROGRESS":
      return "bg-amber-500";
    case "READY":
      return "bg-emerald-500";
    case "SENT":
      return "bg-emerald-600";
    default:
      return "bg-slate-400";
  }
}
