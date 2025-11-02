import { registrationsApi } from "@/lib/api";
import {
  CreateRegistrationForm,
  Registration,
  RegistrationStatistics,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDataSync } from "./useDataSync";

export const useRegistrations = (params?: {
  competitionId?: string;
  eventId?: string;
  athleteId?: string;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: ["registrations", params],
    queryFn: async () => {
      const response = await registrationsApi.getAll(params);
      return response.data as Registration[];
    },
    refetchOnWindowFocus: true,
    staleTime: 10 * 1000, // 10 sekund - krótki czas dla częstych zmian
    gcTime: 1000 * 60 * 5, // Cache przez 5 minut
    refetchInterval: 30 * 1000, // Automatyczne odświeżanie co 30 sekund
    refetchIntervalInBackground: false, // Tylko gdy okno jest aktywne
  });
};

export const useRegistrationsPublic = (params?: {
  competitionId?: string;
  eventId?: string;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: ["registrations", "public", params],
    queryFn: async () => {
      const response = await registrationsApi.getAllPublic(params);
      return response.data as Registration[];
    },
    refetchOnWindowFocus: true,
    staleTime: 10 * 1000, // 10 sekund - krótki czas dla częstych zmian
    gcTime: 1000 * 60 * 5, // Cache przez 5 minut
    refetchInterval: 30 * 1000, // Automatyczne odświeżanie co 30 sekund
    refetchIntervalInBackground: false, // Tylko gdy okno jest aktywne
  });
};

export const useStartListSortedByRecords = (
  competitionId: string,
  eventId: string,
  sortBy?: "PB" | "SB" | "SEED_TIME"
) => {
  return useQuery({
    queryKey: ["registrations", "start-list", competitionId, eventId, sortBy],
    queryFn: async () => {
      const response = await registrationsApi.getStartListSortedByRecords(
        competitionId,
        eventId,
        sortBy
      );
      return response.data as Registration[];
    },
    enabled: !!competitionId && !!eventId,
    refetchOnWindowFocus: false, // Wyłącz automatyczne odświeżanie przy focus
    staleTime: 5 * 60 * 1000, // 5 minut - dłuższy czas dla stabilnych danych
    gcTime: 1000 * 60 * 10, // Cache przez 10 minut
    refetchInterval: false, // Wyłącz automatyczne odświeżanie
    refetchIntervalInBackground: false,
  });
};

export const useAllStartListsForCompetition = (
  competitionId: string,
  sortBy?: "PB" | "SB" | "SEED_TIME"
) => {
  return useQuery({
    queryKey: ["registrations", "all-start-lists", competitionId, sortBy],
    queryFn: async () => {
      const response = await registrationsApi.getAllStartListsForCompetition(
        competitionId,
        sortBy
      );
      return response.data as Array<{
        eventId: string;
        eventName: string;
        eventType: string;
        eventCategory: string;
        registrations: Registration[];
      }>;
    },
    enabled: !!competitionId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minut
    gcTime: 1000 * 60 * 10, // Cache przez 10 minut
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
};

export const useRegistration = (id: string) => {
  return useQuery({
    queryKey: ["registrations", id],
    queryFn: async () => {
      const response = await registrationsApi.getById(id);
      return response.data as Registration;
    },
    enabled: !!id,
  });
};

export const useMyRegistrations = () => {
  return useQuery({
    queryKey: ["registrations", "my"],
    queryFn: async () => {
      const response = await registrationsApi.getMy();
      return response.data as Registration[];
    },
  });
};

export const useRegistrationStatistics = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["registrations", "statistics", params],
    queryFn: async () => {
      const response = await registrationsApi.getStatistics(params);
      return response.data as RegistrationStatistics;
    },
  });
};

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();
  const { syncAfterRegistrationChange } = useDataSync();

  return useMutation({
    mutationFn: async (data: CreateRegistrationForm) => {
      const response = await registrationsApi.create(data);
      return response.data as Registration;
    },
    onSuccess: () => {
      // Użyj centralnej funkcji synchronizacji
      syncAfterRegistrationChange();
    },
  });
};

export const useUpdateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRegistrationForm>;
    }) => {
      const response = await registrationsApi.update(id, data);
      return response.data as Registration;
    },
    onSuccess: (_, { id }) => {
      // Invaliduj wszystkie zapytania związane z rejestracjami
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["registrations"] });
    },
  });
};

export const useConfirmRegistration = () => {
  const queryClient = useQueryClient();
  const { syncAfterRegistrationChange } = useDataSync();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await registrationsApi.confirm(id);
      return response.data as Registration;
    },
    onSuccess: (_, id) => {
      // Invaliduj konkretną rejestrację
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      // Użyj centralnej funkcji synchronizacji
      syncAfterRegistrationChange();
    },
  });
};

export const useCancelRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await registrationsApi.cancel(id);
      return response.data as Registration;
    },
    onSuccess: (_, id) => {
      // Invaliduj wszystkie zapytania związane z rejestracjami
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["registrations"] });
    },
  });
};

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await registrationsApi.reject(id);
      return response.data as Registration;
    },
    onSuccess: (_, id) => {
      // Invaliduj wszystkie zapytania związane z rejestracjami
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrations", id] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["registrations"] });
    },
  });
};

export const useAssignBibNumbers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      competitionId,
      startingNumber,
    }: {
      competitionId: string;
      startingNumber?: number;
    }) => {
      const response = await registrationsApi.assignBibNumbers(
        competitionId,
        startingNumber
      );
      return response.data;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z rejestracjami
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["registrations"] });
    },
  });
};

export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();
  const { syncAfterRegistrationChange } = useDataSync();

  return useMutation({
    mutationFn: async (id: string) => {
      await registrationsApi.delete(id);
      return id;
    },
    onSuccess: () => {
      // Użyj centralnej funkcji synchronizacji
      syncAfterRegistrationChange();
    },
  });
};

export const useDeleteAllRegistrationsByCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (competitionId: string) => {
      const response =
        await registrationsApi.deleteAllByCompetition(competitionId);
      return response.data;
    },
    onSuccess: () => {
      // Invaliduj wszystkie zapytania związane z rejestracjami
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      // Invaliduj również powiązane dane
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["registrations"] });
    },
  });
};

export const useUpdateRecordsFromCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      competitionId,
      csvData,
    }: {
      competitionId: string;
      csvData: string;
    }) => {
      const response = await registrationsApi.updateRecordsFromCsv(
        competitionId,
        csvData
      );
      return response.data;
    },
    onSuccess: () => {
      // Invaliduj zapytania związane z zawodnikami i rejestracjami
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      // Wymuszaj natychmiastowe refetch
      queryClient.refetchQueries({ queryKey: ["registrations"] });
    },
  });
};
