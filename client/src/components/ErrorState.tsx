type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
    <div>
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1 text-xs sm:text-sm">{message ?? "Please try again."}</p>
    </div>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-md border border-rose-300 bg-white px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-1 focus:ring-offset-rose-50"
      >
        Retry
      </button>
    ) : null}
  </div>
);

export default ErrorState;
