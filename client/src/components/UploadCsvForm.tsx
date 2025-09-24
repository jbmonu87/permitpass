import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import Card from "./Card";
import Spinner from "./Spinner";
import ErrorState from "./ErrorState";
import { useUploadCsv } from "../hooks/useUploadCsv";

const UploadCsvForm = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const uploadMutation = useUploadCsv();

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!file) {
      setErrorMessage("Select a CSV file to upload.");
      return;
    }

    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        setSuccessMessage(data.message ?? "Uploaded ✔");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      onError: (mutationError) => {
        const message =
          mutationError instanceof Error ? mutationError.message : "Upload failed";
        setErrorMessage(message);
      }
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Upload CSV</h2>
        <p className="text-sm text-slate-500">
          Import new projects by uploading a CSV export from your permitting tools.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="csv-upload"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            CSV file
          </label>
          <input
            ref={fileInputRef}
            id="csv-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <p className="mt-2 text-xs text-slate-500">
            We’ll process headers automatically—just ensure the file is exported as UTF-8.
          </p>
        </div>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        {successMessage ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        ) : null}
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? <Spinner className="h-4 w-4 border-white/70" label="Uploading" /> : null}
          <span>{uploadMutation.isPending ? "Uploading…" : "Upload CSV"}</span>
        </button>
      </form>
    </Card>
  );
};

export default UploadCsvForm;
