import type { ReactNode } from "react";

const DefaultIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    className="h-6 w-6 stroke-slate-400"
    aria-hidden
  >
    <path
      d="M7 3.75h5.25L17 8.5v11.75A1.75 1.75 0 0 1 15.25 22H7A1.75 1.75 0 0 1 5.25 20.25v-15A1.75 1.75 0 0 1 7 3.75Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3.75V7a1.5 1.5 0 0 0 1.5 1.5h3.25"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type EmptyProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

const Empty = ({ title, description, icon }: EmptyProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-inner">
      {icon ?? <DefaultIcon />}
    </div>
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    {description ? <p className="text-xs text-slate-500">{description}</p> : null}
  </div>
);

export default Empty;
