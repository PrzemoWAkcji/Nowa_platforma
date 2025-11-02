import { eventsApi } from "@/lib/api";
import { CreateEventForm, Event, EventStatistics } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useEvents = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const response = await eventsApi.getAll(params);
      return response.data as Event[];
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ["events", id],
    queryFn: async () => {
      const response = await eventsApi.getById(id);
      return response.data as Event;
    },
    enabled: !!id,
  });
};

export const useEventStatistics = (id: string) => {
  return useQuery({
    queryKey: ["events", id, "statistics"],
    queryFn: async () => {
      const response = await eventsApi.getStatistics(id);
      return response.data as EventStatistics;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventForm) => {
      const response = await eventsApi.create(data);
      return response.data as Event;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z eventami
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateEventForm>;
    }) => {
      const response = await eventsApi.update(id, data);
      return response.data as Event;
    },
    onSuccess: (_, { id }) => {
      // Invaliduj wszystkie zapytania związane z eventami
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", id] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await eventsApi.delete(id);
      return id;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z eventami
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["events"] });
    },
  });
};
