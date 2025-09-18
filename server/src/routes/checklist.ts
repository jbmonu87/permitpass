import { Router } from "express";

import { evaluateRule } from "../lib/rules.js";
import { store } from "../storage.js";

type SupplementalRequirement = {
  municipality_key?: string;
  permit_type_key?: string;
  doc_type_key?: string;
  active?: unknown;
  rule_definition?: unknown;
  ruleDefinition?: unknown;
  rule?: unknown;
  [key: string]: unknown;
};

type DocumentType = {
  doc_type_key?: string;
  display_name?: string;
  [key: string]: unknown;
};

type DocumentRecord = {
  project_id?: unknown;
  doc_type_key?: string;
  status?: unknown;
  [key: string]: unknown;
};

type ChecklistSupplement = SupplementalRequirement & {
  display_name: string | null;
  satisfied: boolean;
};

const isTruthyActive = (value: unknown): boolean => {
  if (value === true) {
    return true;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
};

const getQueryParam = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const [first] = value;
    return typeof first === "string" ? first : null;
  }

  return null;
};

export const checklistRouter = Router();

checklistRouter.get("/", (req, res) => {
  const municipalityKeyRaw = getQueryParam(req.query.municipalityKey);
  const permitTypeKeyRaw = getQueryParam(req.query.permitTypeKey);
  const projectIdRaw = getQueryParam(req.query.projectId);

  const missing: string[] = [];

  const municipalityKey = municipalityKeyRaw?.trim();
  const permitTypeKey = permitTypeKeyRaw?.trim();
  const projectId = projectIdRaw?.trim();

  if (!municipalityKey) {
    missing.push("municipalityKey");
  }

  if (!permitTypeKey) {
    missing.push("permitTypeKey");
  }

  if (!projectId) {
    missing.push("projectId");
  }

  if (missing.length > 0) {
    res.status(400).json({
      status: "error",
      message: `Missing required query parameter${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`
    });
    return;
  }

  const supplementalRequirements = store.supplementalRequirements as SupplementalRequirement[];
  const documentTypes = store.documentTypes as DocumentType[];
  const documents = store.documents as DocumentRecord[];
  const projectValues = (store.projectValues?.[projectId] ?? {}) as Record<string, unknown>;

  const applicableRequirements = supplementalRequirements.filter((requirement) => {
    const matchesMunicipality = requirement.municipality_key?.trim() === municipalityKey;
    const matchesPermitType = requirement.permit_type_key?.trim() === permitTypeKey;
    const isActive = isTruthyActive(requirement.active);

    return matchesMunicipality && matchesPermitType && isActive;
  });

  const requiredSupplements: ChecklistSupplement[] = applicableRequirements
    .filter((requirement) => {
      const ruleDefinition =
        requirement.rule_definition ?? requirement.ruleDefinition ?? requirement.rule;

      return evaluateRule(ruleDefinition, projectValues);
    })
    .map((requirement) => {
      const docTypeKey = requirement.doc_type_key ?? null;
      const matchingDocType = documentTypes.find(
        (docType) => docType.doc_type_key === docTypeKey
      );

      const satisfied = documents.some((document) => {
        if (document.doc_type_key !== docTypeKey) {
          return false;
        }

        if (String(document.project_id) !== projectId) {
          return false;
        }

        const status = typeof document.status === "string" ? document.status.toLowerCase() : null;

        return status !== "rejected";
      });

      return {
        ...requirement,
        display_name: matchingDocType?.display_name ?? null,
        satisfied
      } satisfies ChecklistSupplement;
    });

  const counts = {
    required: requiredSupplements.length,
    satisfied: requiredSupplements.filter((supplement) => supplement.satisfied).length
  };

  res.json({
    supplements: requiredSupplements,
    counts
  });
});
