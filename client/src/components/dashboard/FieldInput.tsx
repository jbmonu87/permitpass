import React from "react";

import { useDebounced } from "../../lib/useDebounced";
import { FormField } from "../../lib/types";

type Props = {
  field: FormField;
  value: unknown;
  onCommit: (value: unknown) => Promise<unknown> | void;
  disabled?: boolean;
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 8.5 6.5 11 12 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function valuesEqual(a: unknown, b: unknown) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((value) => b.includes(value));
  }

  return Object.is(a, b);
}

export const FieldInput: React.FC<Props> = ({ field, value, onCommit, disabled }) => {
  const [localText, setLocalText] = React.useState<string>(typeof value === "string" ? (value as string) : "");
  const [localArray, setLocalArray] = React.useState<string[]>(Array.isArray(value) ? (value as string[]) : []);
  const [saved, setSaved] = React.useState(false);
  const hideTimer = React.useRef<number | undefined>(undefined);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setLocalText((prev) => {
      if (typeof value === "string") {
        return prev === value ? prev : value;
      }
      if (value == null) {
        return prev === "" ? prev : "";
      }
      return prev;
    });
  }, [value]);

  React.useEffect(() => {
    setLocalArray((prev) => {
      if (Array.isArray(value)) {
        const next = value as string[];
        return valuesEqual(prev, next) ? prev : next;
      }
      if (value == null && prev.length > 0) {
        return [];
      }
      return prev;
    });
  }, [value]);

  const markSaved = React.useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
    }
    if (!isMounted.current) return;
    setSaved(true);
    hideTimer.current = window.setTimeout(() => {
      if (isMounted.current) {
        setSaved(false);
      }
    }, 1500);
  }, []);

  const commit = React.useCallback(
    async (nextValue: unknown) => {
      if (valuesEqual(nextValue, value)) {
        return;
      }
      try {
        await onCommit(nextValue);
        markSaved();
      } catch (error) {
        console.error("Failed to save field", error);
      }
    },
    [markSaved, onCommit, value]
  );

  const debouncedCommit = useDebounced((next: unknown) => {
    void commit(next);
  }, 400);

  const inputId = field.id;
  const showSaved = saved;

  function renderLabel() {
    return (
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {field.label}
          {field.required ? " *" : ""}
        </label>
        {showSaved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckIcon className="h-3 w-3" />
            Saved
          </span>
        ) : null}
      </div>
    );
  }

  if (field.kind === "checkbox") {
    const checked = Boolean(value);
    return (
      <div className="flex items-start justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700" htmlFor={inputId}>
          <input
            id={inputId}
            type="checkbox"
            className="h-4 w-4"
            checked={checked}
            disabled={disabled}
            onChange={async (event) => {
              const next = event.target.checked;
              await commit(next);
            }}
          />
          {field.label}
        </label>
        {showSaved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckIcon className="h-3 w-3" />
            Saved
          </span>
        ) : null}
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <div className="space-y-1">
        {renderLabel()}
        <select
          id={inputId}
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={typeof value === "string" ? (value as string) : ""}
          onChange={async (event) => {
            const next = event.target.value;
            await commit(next);
          }}
          disabled={disabled}
        >
          <option value="">Select…</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.kind === "multiselect") {
    return (
      <div className="space-y-2">
        {renderLabel()}
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const active = localArray.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  active ? "border-indigo-300 bg-indigo-50 text-indigo-900" : "hover:bg-slate-50"
                }`}
                aria-pressed={active}
                onClick={async () => {
                  const next = active
                    ? localArray.filter((value) => value !== option.value)
                    : [...localArray, option.value];
                  setLocalArray(next);
                  await commit(next);
                }}
                disabled={disabled}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {localArray.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {localArray.map((item) => (
              <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5">
                {field.options?.find((option) => option.value === item)?.label ?? item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (field.kind === "textarea") {
    return (
      <div className="space-y-1">
        {renderLabel()}
        <textarea
          id={inputId}
          className="min-h-[96px] w-full rounded-md border px-3 py-2 text-sm"
          placeholder={field.placeholder}
          value={localText}
          disabled={disabled}
          onChange={(event) => {
            setLocalText(event.target.value);
          }}
          onBlur={() => {
            debouncedCommit(localText);
          }}
        />
      </div>
    );
  }

  // default to text input
  return (
    <div className="space-y-1">
      {renderLabel()}
      <input
        id={inputId}
        type="text"
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder={field.placeholder}
        value={localText}
        disabled={disabled}
        onChange={(event) => {
          setLocalText(event.target.value);
        }}
        onBlur={() => {
          debouncedCommit(localText);
        }}
      />
    </div>
  );
};
