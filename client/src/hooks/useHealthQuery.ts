import { useQuery } from "@tanstack/react-query";

import { getJSON } from "../api/api";
import type { Health } from "../types/health";
import { toHealth } from "../types/health";

export const useHealthQuery = () =>
  useQuery<Health>({
    queryKey: ["health"],
    queryFn: async ({ signal }) => {
      const response = await getJSON<unknown>("/api/health", { signal });
      return toHealth(response);
    },
    staleTime: 15_000,
    refetchInterval: 30_000
  });
