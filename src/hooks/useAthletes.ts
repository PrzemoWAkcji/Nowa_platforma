import { athletesApi } from "@/lib/api";
import { Athlete, AthleteStats, CreateAthleteForm } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAthletes = (
  params?: Record<string, unknown>,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["athletes", params],
    queryFn: async () => {
      const response = await athletesApi.getAll(params);
      return response.data as Athlete[];
    },
    enabled,
  });
};

export const useAthlete = (id: string) => {
  return useQuery({
    queryKey: ["athletes", id],
    queryFn: async () => {
      const response = await athletesApi.getById(id);
      return response.data as Athlete;
    },
    enabled: !!id,
  });
};

export const useAthleteStats = (id: string) => {
  return useQuery({
    queryKey: ["athletes", id, "stats"],
    queryFn: async () => {
      const response = await athletesApi.getStats(id);
      return response.data as AthleteStats;
    },
    enabled: !!id,
  });
};

export const useCreateAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAthleteForm) => {
      const response = await athletesApi.create(data);
      return response.data as Athlete;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z zawodnikami
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["athletes"] });
    },
  });
};

export const useUpdateAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAthleteForm>;
    }) => {
      const response = await athletesApi.update(id, data);
      return response.data as Athlete;
    },
    onSuccess: (_, { id }) => {
      // Invaliduj wszystkie zapytania związane z zawodnikami
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      queryClient.invalidateQueries({ queryKey: ["athletes", id] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["athletes"] });
    },
  });
};

export const useDeleteAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await athletesApi.delete(id);
      return id;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z zawodnikami
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["athletes"] });
    },
  });
};

export const useImportAthletes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      format,
      updateExisting,
    }: {
      file: File;
      format: "pzla" | "international" | "auto";
      updateExisting: boolean;
    }) => {
      // Jeśli format to 'auto', backend automatycznie wykryje format
      const finalFormat = format === "auto" ? "pzla" : format;
      const response = await athletesApi.importCsv(
        file,
        finalFormat as "pzla" | "international",
        updateExisting
      );
      return response.data;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z zawodnikami
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["athletes"] });
    },
  });
};
