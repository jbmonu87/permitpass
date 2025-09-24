import type { ReactNode } from "react";

type BadgeVariant = "green" | "yellow" | "red" | "gray";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  red: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
  gray: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
};

const Badge = ({ children, variant = "gray", className }: BadgeProps) => {
  const classes = [
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
    variantStyles[variant],
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
};

export type { BadgeVariant };
export default Badge;
