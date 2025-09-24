import type { ReactNode } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white text-slate-900 shadow"
      : "text-slate-200 hover:bg-slate-800 hover:text-white"
  ].join(" ");

const shellClasses = "grid min-h-screen grid-cols-1 bg-slate-950 text-slate-100 lg:grid-cols-[260px_1fr]";

const Section = ({ title, children, description }: { title: string; description?: string; children: ReactNode }) => (
  <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-inner shadow-slate-900">
    <header className="space-y-1">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description ? (
        <p className="text-sm text-slate-300">{description}</p>
      ) : null}
    </header>
    <div className="text-sm text-slate-200">{children}</div>
  </section>
);

const ReadyBadge = ({ status }: { status: "ready" | "missing" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
      status === "ready"
        ? "bg-emerald-400/10 text-emerald-300"
        : "bg-amber-400/10 text-amber-300"
    }`}
  >
    <span className="h-2 w-2 rounded-full bg-current" />
    {status === "ready" ? "Ready" : "Missing"}
  </span>
);

const ProjectOverview = () => (
  <div className="space-y-6">
    <Section
      title="Latest project"
      description="We remember every detail once you send it—no retyping across projects."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xl font-semibold text-white">EV charger • Yarmouth</p>
          <p className="text-sm text-slate-300">12 Maple Street • Submitted 4 minutes ago</p>
        </div>
        <ReadyBadge status="missing" />
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-400">Company profile</dt>
          <dd className="mt-1 font-medium text-white">Autofilled</dd>
        </div>
        <div>
          <dt className="text-slate-400">Checklist items</dt>
          <dd className="mt-1 font-medium text-white">2 missing • Wiring diagram &amp; panel photo</dd>
        </div>
        <div>
          <dt className="text-slate-400">Time to ready</dt>
          <dd className="mt-1 font-medium text-white">6 minutes</dd>
        </div>
      </dl>
    </Section>
    <Section title="Frictionless principles" description="PermitPass keeps crews focused on installs, not paperwork.">
      <ul className="space-y-2 text-slate-200">
        <li>• Ask once, remember forever—profiles auto-fill every town form.</li>
        <li>• Dynamic checklist stays focused: only show what a town actually needs.</li>
        <li>• Extract from quotes, photos, and emails so contractors never type twice.</li>
      </ul>
    </Section>
  </div>
);

const ChecklistPreview = () => {
  const requirements = [
    {
      title: "Town application (PDF)",
      detail: "Autofilled from contractor profile + project basics.",
      status: "ready" as const
    },
    {
      title: "Panel photo",
      detail: "Required-if load &gt; 60A. Auto-tagged when texted to your PermitPass number.",
      status: "missing" as const
    },
    {
      title: "Wiring diagram",
      detail: "Upload once; we reuse the latest stamped version for every Yarmouth EV job.",
      status: "ready" as const
    }
  ];

  return (
    <Section
      title="Dynamic checklist"
      description="Pick project + town and PermitPass pulls the exact list—no extra paperwork."
    >
      <ul className="space-y-4">
        {requirements.map((req) => (
          <li key={req.title} className="flex flex-col gap-2 rounded-lg border border-slate-800/80 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{req.title}</p>
              <p className="text-xs text-slate-300">{req.detail}</p>
            </div>
            <ReadyBadge status={req.status} />
          </li>
        ))}
      </ul>
    </Section>
  );
};

const StatusPage = () => {
  const { data, isPending, isError } = useQuery<{ status: string; timestamp: string }>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Failed to reach API");
      return (await response.json()) as { status: string; timestamp: string };
    }
  });

  return (
    <Section
      title="Service health"
      description="PermitPass API keeps status simple: Ready, Missing, or Needs attention."
    >
      {isPending ? (
        <p className="text-slate-300">Checking API health…</p>
      ) : isError ? (
        <p className="text-rose-300">API offline. We alert the team automatically.</p>
      ) : (
        <div className="flex items-center gap-3">
          <ReadyBadge
            status={data && data.status.toLowerCase().includes("healthy") ? "ready" : "missing"}
          />
          <div>
            <p className="font-medium text-white">{data?.status ?? "Unknown"}</p>
            <p className="text-xs text-slate-400">
              Updated {data ? new Date(data.timestamp).toLocaleString() : ""}
            </p>
          </div>
        </div>
      )}
    </Section>
  );
};

const Shell = ({ children }: { children: ReactNode }) => (
  <div className={shellClasses}>
    <aside className="border-b border-r border-slate-800/80 bg-slate-900/70 p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">PermitPass</p>
      <h1 className="mt-2 text-2xl font-bold text-white">Frictionless permitting</h1>
      <nav className="mt-8 flex flex-col gap-2">
        <NavLink to="/" className={navLinkStyles} end>
          Overview
        </NavLink>
        <NavLink to="/checklist" className={navLinkStyles}>
          Checklist
        </NavLink>
        <NavLink to="/status" className={navLinkStyles}>
          Status
        </NavLink>
      </nav>
      <p className="mt-8 text-xs text-slate-400">
        Built to stay ahead of town changes, compute fees correctly, and share a clear Ready / Missing X snapshot.
      </p>
    </aside>
    <main className="overflow-y-auto bg-slate-950 p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">{children}</div>
    </main>
  </div>
);

function App() {
  return (
    <Shell>
      <Routes>
        <Route index element={<ProjectOverview />} />
        <Route path="/checklist" element={<ChecklistPreview />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </Shell>
  );
}

export default App;
