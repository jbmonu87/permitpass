import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className }: CardProps) => {
  const classes = ["rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
};

export default Card;
