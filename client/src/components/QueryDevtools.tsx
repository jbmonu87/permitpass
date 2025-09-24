import { useEffect, useMemo, useState } from "react";
import { useIsFetching, useIsMutating, useQueryClient } from "@tanstack/react-query";
import type { Query, QueryKey } from "@tanstack/query-core";

const formatQueryKey = (key: QueryKey): string =>
  Array.isArray(key) ? key.map((part) => JSON.stringify(part)).join(" · ") : JSON.stringify(key);

const getStatusLabel = (query: Query): string => {
  const { status, fetchStatus } = query.state;

  if (fetchStatus === "fetching") {
    return "Fetching";
  }

  if (status === "pending") {
    return "Idle";
  }

  if (status === "error") {
    return "Error";
  }

  return "Success";
};

const QueryDevtools = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const fetching = useIsFetching();
  const mutating = useIsMutating();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      setVersion((prev) => prev + 1);
    });

    return unsubscribe;
  }, [queryClient]);

  const queries = useMemo(() => queryClient.getQueryCache().findAll(), [queryClient, version]);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 text-xs">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 font-semibold text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <span>Devtools</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
          {fetching} fetching / {mutating} mutating
        </span>
      </button>
      {isOpen ? (
        <div className="mt-2 w-72 space-y-2 rounded-xl border border-slate-300 bg-white p-3 text-slate-700 shadow-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Active queries ({queries.length})
          </p>
          {queries.length === 0 ? (
            <p className="text-[11px] text-slate-500">No queries have been started.</p>
          ) : (
            <ul className="space-y-2">
              {queries.map((query) => (
                <li key={query.queryHash} className="rounded-lg border border-slate-200 p-2">
                  <p className="font-mono text-[10px] text-slate-500">
                    {formatQueryKey(query.queryKey)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-700">{getStatusLabel(query)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default QueryDevtools;
