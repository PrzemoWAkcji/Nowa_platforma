import { heatsApi } from "@/lib/api";
import {
  AdvancedAutoAssignHeatsForm,
  AutoAssignHeatsForm,
  CreateHeatForm,
  Heat,
  HeatLane,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Używamy globalnego typu HeatLane z @/types

// Hook do pobierania wszystkich serii
export const useHeats = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["heats", params],
    queryFn: async () => {
      const response = await heatsApi.getAll(params);
      return response.data;
    },
  });
};

// Hook do pobierania konkretnej serii
export const useHeat = (id: string) => {
  return useQuery({
    queryKey: ["heat", id],
    queryFn: async () => {
      const response = await heatsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook do pobierania serii dla konkretnej konkurencji
export const useEventHeats = (eventId: string) => {
  return useQuery({
    queryKey: ["event-heats", eventId],
    queryFn: async () => {
      const response = await heatsApi.getEventHeats(eventId);
      return response.data;
    },
    enabled: !!eventId,
  });
};

// Hook do tworzenia serii
export const useCreateHeat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHeatForm) => {
      const response = await heatsApi.create(data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["heats"] });
      queryClient.invalidateQueries({
        queryKey: ["event-heats", variables.eventId],
      });
    },
  });
};

// Hook do aktualizacji serii
export const useUpdateHeat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      const response = await heatsApi.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["heats"] });
      queryClient.invalidateQueries({ queryKey: ["heat", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["event-heats"] });
    },
  });
};

// Hook do usuwania serii
export const useDeleteHeat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await heatsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heats"] });
      queryClient.invalidateQueries({ queryKey: ["event-heats"] });
    },
  });
};

// Hook do automatycznego rozstawiania
export const useAutoAssignHeats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AutoAssignHeatsForm) => {
      const response = await heatsApi.autoAssign(data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["heats"] });
      queryClient.invalidateQueries({
        queryKey: ["event-heats", variables.eventId],
      });
    },
  });
};

// Hook do zaawansowanego automatycznego rozstawiania
export const useAdvancedAutoAssignHeats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdvancedAutoAssignHeatsForm) => {
      const response = await heatsApi.advancedAutoAssign(data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["heats"] });
      queryClient.invalidateQueries({
        queryKey: ["event-heats", variables.eventId],
      });
    },
  });
};

// Hook do zapisywania kompletnej listy startowej (wszystkie serie dla konkurencji)
export const useSaveStartlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      heats,
    }: {
      eventId: string;
      heats: Heat[];
    }) => {
      // Usuń istniejące serie dla tej konkurencji
      const existingHeats = await heatsApi.getEventHeats(eventId);
      if (existingHeats.data && existingHeats.data.length > 0) {
        for (const heat of existingHeats.data) {
          await heatsApi.delete(heat.id);
        }
      }

      // Utwórz nowe serie
      const createdHeats = [];
      for (const heat of heats) {
        const heatData = {
          eventId,
          heatNumber: heat.heatNumber as number,
          round: "QUALIFICATION" as const,
          maxLanes: (heat.lanes as any[]).length,
          assignments: (heat.lanes as any[])
            .filter((lane: any) => lane.athlete)
            .map((lane: any) => ({
              registrationId: lane.athlete.registrationId,
              lane: lane.number,
              seedTime: lane.athlete.seedTime,
              assignmentMethod: "MANUAL" as const,
              isPresent: true,
            })),
        };

        const response = await heatsApi.create(heatData);
        createdHeats.push(response.data);
      }

      return createdHeats;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["heats"] });
      queryClient.invalidateQueries({
        queryKey: ["event-heats", variables.eventId],
      });
    },
  });
};
