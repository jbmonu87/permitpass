# PermitPass

PermitPass is a frictionless permitting assistant for contractors. This repository contains a React + Vite client and an Express + TypeScript API server backed by SQLite.

## Getting started

```bash
npm install
npm run dev
```

The `dev` script starts both the API (`http://localhost:4000`) and the Vite client (`http://localhost:5173`). The client proxies `/api/*` requests to the API.

### Environment variables

The server reads environment variables from `.env` if present. By default it stores the SQLite database at `./data/permitpass.db`.

### Useful commands

| Command | Description |
| --- | --- |
| `npm run dev:server` | Run only the API server |
| `npm run dev:client` | Run only the client |
| `npm run lint` | Lint server and client code |
| `npm run typecheck` | Type-check server and client |
| `npm run build` | Build the server and client bundles |

### Uploading documents

The `/api/upload` endpoint accepts multipart form data with the fields `projectId`, `doc_type_key`, and `file`.

```bash
curl -X POST http://localhost:4000/api/upload \
  -F projectId=example-project \
  -F doc_type_key=structural_plan \
  -F file=@/path/to/file.pdf
```

### Managing projects

The `/api/projects` endpoints allow you to create and list stored projects.

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"municipalityKey":"springfield","permitTypeKey":"residential_new","displayName":"Evergreen Terrace"}'
```

```bash
curl http://localhost:4000/api/projects
```

### Project layout

```
client/      # React + Vite + Tailwind UI scaffold
server/      # Express API with SQLite adapter and health endpoint
data/        # SQLite database and future CSV exports (gitignored)
uploads/     # User uploads (gitignored)
templates/   # Permit templates (gitignored)
```
 
