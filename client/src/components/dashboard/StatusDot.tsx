import React from "react";

import { ProjectStatus, statusDotClasses } from "../../lib/status";

type Props = {
  status: ProjectStatus;
  className?: string;
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 8.5 6.5 11 12 5.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const StatusDot: React.FC<Props> = ({ status, className }) => {
  const showCheck = status === "SENT";
  return (
    <span className={`relative inline-flex h-3.5 w-3.5 items-center justify-center ${className ?? ""}`}>
      <span className={`absolute inset-0 rounded-full ${statusDotClasses(status)}`} />
      {showCheck ? <CheckIcon className="h-2.5 w-2.5 text-white" /> : null}
    </span>
  );
};
