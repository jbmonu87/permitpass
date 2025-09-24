import Card from "./Card";
import Badge, { type BadgeVariant } from "./Badge";
import Spinner from "./Spinner";
import ErrorState from "./ErrorState";
import { useHealthQuery } from "../hooks/useHealthQuery";
import type { Health } from "../types/health";

const statusDisplay: Record<Health["status"], { label: string; variant: BadgeVariant }> = {
  ready: { label: "Ready", variant: "green" },
  missing: { label: "Missing", variant: "red" },
  needs_attention: { label: "Needs attention", variant: "yellow" }
};

const HealthCard = () => {
  const { data, isPending, isError, error, refetch } = useHealthQuery();

  const message = error instanceof Error ? error.message : undefined;
  const formattedTimestamp = (() => {
    if (!data) {
      return "";
    }

    const parsed = new Date(data.timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return "Unknown time";
    }

    return parsed.toLocaleString();
  })();

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Service health</h2>
        <p className="text-sm text-slate-500">PermitPass API status with automatic polling.</p>
      </div>
      {isPending ? (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner />
          <span>Checking status…</span>
        </div>
      ) : isError || !data ? (
        <ErrorState message={message} onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">PermitPass API:</span>
            <Badge variant={statusDisplay[data.status].variant}>{statusDisplay[data.status].label}</Badge>
          </div>
          <p className="text-xs text-slate-500">Updated {formattedTimestamp}</p>
        </div>
      )}
    </Card>
  );
};

export default HealthCard;
