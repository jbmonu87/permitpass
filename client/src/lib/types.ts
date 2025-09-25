import { ProjectStatus } from "./status";

export type Project = {
  id: string;
  name: string;
  municipality: string;
  status: ProjectStatus;
  isClosed: boolean;
  updatedAt: string; // ISO
  state?: string;
  workScopes?: string[];
};

export type FieldKind =
  | "text"
  | "textarea"
  | "checkbox"
  | "select"
  | "multiselect";

export type FieldOption = { label: string; value: string };

export type FormField = {
  id: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[]; // for select/multiselect
};

export type FormSection = {
  id: string;
  title: string;
  fields: FormField[];
  initiallyOpen?: boolean;
};

export type MunicipalitySchema = {
  municipality: string;
  sections: FormSection[];
};

export type ProjectFormValues = Record<string, unknown>;
