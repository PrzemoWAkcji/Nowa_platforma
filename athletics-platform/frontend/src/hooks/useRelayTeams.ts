import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Hook do zarządzania zespołami sztafetowymi
export const useRelayTeams = (competitionId?: string) => {
  return useQuery({
    queryKey: ["relay-teams", competitionId],
    queryFn: () =>
      api
        .get(
          `/relay-teams${
            competitionId ? `?competitionId=${competitionId}` : ""
          }`
        )
        .then((res) => res.data),
    enabled: !!competitionId,
  });
};

// Hook do pobierania pojedynczego zespołu
export const useRelayTeam = (teamId: string) => {
  return useQuery({
    queryKey: ["relay-team", teamId],
    queryFn: () => api.get(`/relay-teams/${teamId}`).then((res) => res.data),
    enabled: !!teamId,
  });
};

// Hook do tworzenia zespołu
export const useCreateRelayTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      api.post("/relay-teams", data).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["relay-teams", variables.competitionId],
      });
      toast.success("Zespół sztafetowy został utworzony");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas tworzenia zespołu"
      );
    },
  });
};

// Hook do aktualizacji zespołu
export const useUpdateRelayTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/relay-teams/${id}`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["relay-team", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["relay-teams"] });
      toast.success("Zespół sztafetowy został zaktualizowany");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas aktualizacji zespołu"
      );
    },
  });
};

// Hook do usuwania zespołu
export const useDeleteRelayTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/relay-teams/${id}`).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["relay-teams"] });
      toast.success("Zespół sztafetowy został usunięty");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas usuwania zespołu"
      );
    },
  });
};

// Hook do dodawania członka zespołu
export const useAddRelayTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) =>
      api.post(`/relay-teams/${teamId}/members`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["relay-team", variables.teamId],
      });
      queryClient.invalidateQueries({ queryKey: ["relay-teams"] });
      toast.success("Członek zespołu został dodany");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Błąd podczas dodawania członka zespołu"
      );
    },
  });
};

// Hook do usuwania członka zespołu
export const useRemoveRelayTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      api
        .delete(`/relay-teams/${teamId}/members/${memberId}`)
        .then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["relay-team", variables.teamId],
      });
      queryClient.invalidateQueries({ queryKey: ["relay-teams"] });
      toast.success("Członek zespołu został usunięty");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas usuwania członka zespołu"
      );
    },
  });
};

// Hook do pobierania rejestracji zespołów sztafetowych dla wydarzenia
export const useRelayTeamEventRegistrations = (eventId: string) => {
  return useQuery({
    queryKey: ["relay-team-event-registrations", eventId],
    queryFn: () =>
      api
        .get(`/relay-teams/event/${eventId}/registrations`)
        .then((res) => res.data),
    enabled: !!eventId,
  });
};

// Hook do rejestracji zespołu na wydarzenie
export const useRegisterRelayTeamForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, eventId }: { teamId: string; eventId: string }) =>
      api
        .post(`/relay-teams/${teamId}/events/${eventId}/register`)
        .then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["relay-team-event-registrations", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["relay-team", variables.teamId],
      });
      toast.success("Zespół został zarejestrowany na wydarzenie");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Błąd podczas rejestracji zespołu na wydarzenie"
      );
    },
  });
};

// Hook do naprawy członków zespołu (usuwanie duplikatów)
export const useFixRelayTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) =>
      api.post(`/relay-teams/${teamId}/fix-members`).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["relay-team", variables],
      });
      queryClient.invalidateQueries({ queryKey: ["relay-teams"] });
      toast.success("Członkowie zespołu zostali naprawieni");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas naprawy członków zespołu"
      );
    },
  });
};

// Hook do pobierania wyników zespołów sztafetowych dla wydarzenia
export const useRelayTeamEventResults = (eventId: string) => {
  return useQuery({
    queryKey: ["relay-team-event-results", eventId],
    queryFn: () =>
      api.get(`/relay-teams/event/${eventId}/results`).then((res) => res.data),
    enabled: !!eventId,
  });
};

// Hook do dodawania wyniku zespołu sztafetowego
export const useAddRelayTeamResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      api
        .post(`/relay-teams/event/${eventId}/results`, data)
        .then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["relay-team-event-results", variables.eventId],
      });
      toast.success("Wynik zespołu został dodany");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas dodawania wyniku zespołu"
      );
    },
  });
};
