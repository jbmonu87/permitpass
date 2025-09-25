import React from "react";

type SectionProps = {
  title: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  rightAdornment?: React.ReactNode;
  children: React.ReactNode;
};

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="m4 6 4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Section({
  title,
  subtitle,
  collapsible = true,
  defaultOpen = true,
  rightAdornment,
  children
}: SectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h3 className="text-sm font-medium text-slate-900">{title}</h3>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {rightAdornment}
          {collapsible ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100"
              aria-label={open ? "Collapse" : "Expand"}
            >
              <ChevronDownIcon className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
            </button>
          ) : null}
        </div>
      </header>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
  );
}
