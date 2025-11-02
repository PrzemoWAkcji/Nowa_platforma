import { competitionsApi } from "@/lib/api";
import { Competition, CreateCompetitionForm } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCompetitions = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const response = await competitionsApi.getPublic();
      return response.data as Competition[];
    },
    enabled,
    retry: 1,
    staleTime: 0, // Zawsze pobieraj świeże dane
    refetchOnMount: true,
  });
};

export const useCompetition = (id: string) => {
  return useQuery({
    queryKey: ["competitions", id],
    queryFn: async () => {
      const response = await competitionsApi.getById(id);
      return response.data as Competition;
    },
    enabled: !!id,
  });
};

export const useCreateCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompetitionForm) => {
      const response = await competitionsApi.create(data);
      return response.data as Competition;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z zawodami
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["competitions"] });
    },
  });
};

export const useUpdateCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCompetitionForm>;
    }) => {
      const response = await competitionsApi.update(id, data);
      return response.data as Competition;
    },
    onSuccess: (_, { id }) => {
      // Invaliduj wszystkie zapytania związane z zawodami
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["competitions", id] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["competitions"] });
    },
  });
};

export const useDeleteCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await competitionsApi.delete(id);
      return id;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z zawodami
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["competitions"] });
    },
  });
};
