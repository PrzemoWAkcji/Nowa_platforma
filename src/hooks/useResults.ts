import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsApi } from '@/lib/api';
import { Result, CreateResultForm } from '@/types';

export const useResults = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['results', params],
    queryFn: async () => {
      const response = await resultsApi.getAll(params);
      return response.data as Result[];
    },
  });
};

export const useResult = (id: string) => {
  return useQuery({
    queryKey: ['results', id],
    queryFn: async () => {
      const response = await resultsApi.getById(id);
      return response.data as Result;
    },
    enabled: !!id,
  });
};

export const useEventResults = (eventId: string) => {
  return useQuery({
    queryKey: ['results', 'events', eventId],
    queryFn: async () => {
      const response = await resultsApi.getEventResults(eventId);
      return response.data as Result[];
    },
    enabled: !!eventId,
  });
};

export const useAthleteResults = (athleteId: string, eventName: string) => {
  return useQuery({
    queryKey: ['results', 'athletes', athleteId, 'events', eventName],
    queryFn: async () => {
      const response = await resultsApi.getAthleteResults(athleteId, eventName);
      return response.data as Result[];
    },
    enabled: !!athleteId && !!eventName,
  });
};

export const useCreateResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateResultForm) => {
      const response = await resultsApi.create(data);
      return response.data as Result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
};

export const useUpdateResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateResultForm> }) => {
      const response = await resultsApi.update(id, data);
      return response.data as Result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['results', id] });
    },
  });
};

export const useCalculatePositions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await resultsApi.calculatePositions(eventId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
};

export const useDeleteResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await resultsApi.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
};