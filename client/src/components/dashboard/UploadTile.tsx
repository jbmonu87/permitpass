import React from "react";

import { uploadFiles } from "../../lib/api";

type Props = {
  projectId?: string;
  onUploaded?: () => void;
};

export const UploadTile: React.FC<Props> = ({ projectId, onUploaded }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  function stop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  async function handleFiles(fileList: FileList | null) {
    if (!projectId || !fileList || fileList.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const files = Array.from(fileList);
      const result = await uploadFiles(projectId, files);
      setMessage(`Uploaded ${result.count} file(s). Parsing in background…`);
      onUploaded?.();
    } catch (error) {
      setMessage("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition ${dragOver ? "ring-2 ring-indigo-300" : ""}`}
      onDragEnter={(event) => {
        stop(event);
        setDragOver(true);
      }}
      onDragOver={stop}
      onDragLeave={(event) => {
        stop(event);
        setDragOver(false);
      }}
      onDrop={(event) => {
        stop(event);
        setDragOver(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <div className="text-sm font-medium text-slate-900">Upload files</div>
      <p className="mt-1 text-xs text-slate-500">
        Drag and drop or click to upload files. We’ll parse them automatically.
      </p>

      <label className="mt-3 inline-flex items-center gap-2 text-sm text-indigo-700">
        <input
          type="file"
          multiple
          className="hidden"
          disabled={!projectId || busy}
          onChange={(event) => handleFiles(event.target.files)}
        />
        <span
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 ${
            busy ? "opacity-60" : "hover:bg-indigo-50 hover:text-indigo-900"
          }`}
        >
          {busy ? "Uploading…" : "Choose files"}
        </span>
      </label>

      {message ? <div className="mt-3 text-xs text-slate-600">{message}</div> : null}
    </div>
  );
};
