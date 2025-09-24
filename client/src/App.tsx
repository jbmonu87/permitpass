import { Navigate, Route, Routes } from "react-router-dom";

import HealthCard from "./components/HealthCard";
import UploadCsvForm from "./components/UploadCsvForm";
import ProjectsTable from "./components/ProjectsTable";

const Dashboard = () => (
  <div className="min-h-screen bg-slate-100 py-10">
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">PermitPass</p>
        <h1 className="text-3xl font-bold text-slate-900">Operations dashboard</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Monitor the PermitPass API, keep an eye on project imports, and refresh data from CSV
          uploads.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <HealthCard />
          <UploadCsvForm />
        </div>
        <ProjectsTable />
      </div>
    </div>
  </div>
);

const App = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
