import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { postForm } from "../api/api";

const zUploadResponse = z
  .object({
    ok: z.boolean(),
    message: z.string().optional()
  })
  .passthrough();

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues.map((issue) => issue.message).join(", ") || "unknown error";

export type UploadResponse = z.infer<typeof zUploadResponse>;

export const useUploadCsv = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", "csv-upload");
      formData.append("doc_type_key", "csv");

      const response = await postForm<unknown>("/api/upload", formData);
      const result = zUploadResponse.safeParse(response);

      if (!result.success) {
        throw new Error(`Invalid upload response: ${formatIssues(result.error.issues)}`);
      }

      if (!result.data.ok) {
        throw new Error(result.data.message ?? "Upload failed");
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });
};
