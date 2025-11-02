import { competitionsApi } from "@/lib/api";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export function useCompetitionLogos(competitionId: string) {
  return useQuery({
    queryKey: ["competition-logos", competitionId],
    queryFn: async () => {
      const response = await competitionsApi.getLogos(competitionId);
      return response.data.logos || [];
    },
    enabled: !!competitionId,
  });
}

export function useUploadCompetitionLogos(
  competitionId: string,
  options?: Omit<
    UseMutationOptions<AxiosResponse<unknown, unknown>, Error, File[], unknown>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) =>
      competitionsApi.uploadLogos(competitionId, files),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["competition-logos", competitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["competitions", competitionId],
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    ...options,
  });
}

export function useDeleteCompetitionLogo(
  competitionId: string,
  options?: Omit<
    UseMutationOptions<AxiosResponse<unknown, unknown>, Error, string, unknown>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logoId: string) =>
      competitionsApi.deleteLogo(competitionId, logoId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["competition-logos", competitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["competitions", competitionId],
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    ...options,
  });
}

export function useToggleLogoVisibility(
  competitionId: string,
  options?: Omit<
    UseMutationOptions<
      AxiosResponse<unknown, unknown>,
      Error,
      { logoId: string; isVisible: boolean },
      unknown
    >,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logoId,
      isVisible,
    }: {
      logoId: string;
      isVisible: boolean;
    }) =>
      competitionsApi.toggleLogoVisibility(competitionId, logoId, isVisible),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["competition-logos", competitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["competitions", competitionId],
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
    ...options,
  });
}
