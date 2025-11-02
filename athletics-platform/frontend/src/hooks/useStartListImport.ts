import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface ImportStartListData {
  csvData: string;
  format?: "PZLA" | "ROSTER" | "AUTO";
}

export interface ImportStartListResult {
  success: boolean;
  message: string;
  importedCount: number;
  skippedCount: number;
  updatedCount: number;
  errors: string[];
  warnings: string[];
  detectedFormat: string;
  entries: Record<string, unknown>[];
}

export function useImportStartList(competitionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: ImportStartListData
    ): Promise<ImportStartListResult> => {
      const response = await api.post(
        `/competitions/${competitionId}/import-startlist-json`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["competitions", competitionId],
      });
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({
        queryKey: ["events", { competitionId }],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      queryClient.invalidateQueries({
        queryKey: ["relay-teams", competitionId],
      });
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}
