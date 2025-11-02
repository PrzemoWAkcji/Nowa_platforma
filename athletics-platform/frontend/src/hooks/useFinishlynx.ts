import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FinishlynxImportResult {
  message: string;
  processedResults: number;
  totalResults: number;
  errors: string[];
}

export interface FinishlynxValidationResult {
  valid: boolean;
  fileType: string;
  eventCount?: number;
  resultCount?: number;
  message: string;
}

export const useImportFinishlynxFile = () => {
  return useMutation<FinishlynxImportResult, Error, { file: File; competitionId?: string }>({
    mutationFn: async ({ file, competitionId }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (competitionId) {
        formData.append('competitionId', competitionId);
      }

      const response = await api.post('/finishlynx/import-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
};

export const useValidateFinishlynxFile = () => {
  return useMutation<FinishlynxValidationResult, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/finishlynx/validate-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
};

export const useManualImportFinishlynx = () => {
  return useMutation<FinishlynxImportResult, Error, { fileType: string; fileContent: string; competitionId?: string }>({
    mutationFn: async (data) => {
      const response = await api.post('/finishlynx/manual-import', data);
      return response.data;
    },
  });
};

export const useFinishlynxImportHistory = () => {
  return useQuery({
    queryKey: ['finishlynx-import-history'],
    queryFn: async () => {
      const response = await api.get('/finishlynx/import-history');
      return response.data;
    },
  });
};

export const usePreviewFinishlynxFile = () => {
  return useMutation<unknown, Error, { file: File; competitionId?: string }>({
    mutationFn: async ({ file, competitionId }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (competitionId) {
        formData.append('competitionId', competitionId);
      }

      const response = await api.post('/finishlynx/preview-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
};

export const useEventMappingSuggestions = (competitionId: string, eventName: string) => {
  return useQuery({
    queryKey: ['event-mapping-suggestions', competitionId, eventName],
    queryFn: async () => {
      const response = await api.get(`/finishlynx/event-mapping-suggestions/${competitionId}/${encodeURIComponent(eventName)}`);
      return response.data;
    },
    enabled: !!competitionId && !!eventName,
  });
};