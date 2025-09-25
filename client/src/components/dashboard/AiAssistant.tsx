import React from "react";

type Props = {
  className?: string;
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AiAssistant({ className }: Props) {
  const [value, setValue] = React.useState("");

  return (
    <div className={cn("rounded-xl border bg-white p-4 shadow-sm", className)}>
      <h3 className="text-sm font-medium text-slate-900">AI Assistant (beta)</h3>
      <p className="mt-1 text-xs text-slate-500">
        Ask questions about this screen. (UI only — no backend wired yet.)
      </p>
      <div className="mt-3 space-y-2">
        <textarea
          className="w-full resize-none rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          placeholder="e.g., Which fields are still missing for Cumberland?"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="flex gap-2">
          <button className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            Ask
          </button>
          <button
            className="rounded border px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={() => setValue("")}
            type="button"
          >
            Clear
          </button>
        </div>
        <div className="mt-2 rounded bg-slate-50 p-2 text-xs text-slate-600">
          <p>Example prompts:</p>
          <ul className="list-disc pl-5">
            <li>What forms are required for EV charger in Cumberland?</li>
            <li>Which sections are incomplete?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
