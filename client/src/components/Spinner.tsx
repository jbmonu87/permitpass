type SpinnerProps = {
  className?: string;
  label?: string;
};

const Spinner = ({ className, label }: SpinnerProps) => {
  const classes = [
    "inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} role="status" aria-label={label ?? "Loading"} />;
};

export default Spinner;
