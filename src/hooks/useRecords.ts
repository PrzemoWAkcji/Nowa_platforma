import { CreateRecordForm, Record, RecordCheckResult, RecordStatistics } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// API functions
const recordsApi = {
  // Pobierz wszystkie rekordy z filtrami
  getRecords: async (filters?: {
    type?: string;
    eventName?: string;
    gender?: string;
    category?: string;
    nationality?: string;
    isActive?: boolean;
    isIndoor?: boolean;
  }): Promise<Record[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/records?${params}`);
    if (!response.ok) throw new Error('Failed to fetch records');
    return response.json();
  },

  // Pobierz pojedynczy rekord
  getRecord: async (id: string): Promise<Record> => {
    const response = await fetch(`${API_BASE_URL}/records/${id}`);
    if (!response.ok) throw new Error('Failed to fetch record');
    return response.json();
  },

  // Utwórz nowy rekord
  createRecord: async (data: CreateRecordForm): Promise<Record> => {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create record');
    return response.json();
  },

  // Aktualizuj rekord
  updateRecord: async (id: string, data: Partial<CreateRecordForm>): Promise<Record> => {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update record');
    return response.json();
  },

  // Usuń rekord
  deleteRecord: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete record');
  },

  // Pobierz najlepszy rekord
  getBestRecord: async (
    eventName: string,
    type: string,
    gender: string,
    category: string,
    nationality?: string,
    isIndoor?: boolean
  ): Promise<Record | null> => {
    const params = new URLSearchParams({
      eventName,
      type,
      gender,
      category,
    });
    if (nationality) params.append('nationality', nationality);
    if (isIndoor !== undefined) params.append('isIndoor', isIndoor.toString());

    const response = await fetch(`${API_BASE_URL}/records/best?${params}`);
    if (!response.ok) throw new Error('Failed to fetch best record');
    return response.json();
  },

  // Sprawdź potencjalny rekord
  checkPotentialRecord: async (
    eventName: string,
    result: string,
    unit: string,
    gender: string,
    category: string,
    nationality: string,
    isIndoor?: boolean
  ): Promise<RecordCheckResult> => {
    const params = new URLSearchParams({
      eventName,
      result,
      unit,
      gender,
      category,
      nationality,
    });
    if (isIndoor !== undefined) params.append('isIndoor', isIndoor.toString());

    const response = await fetch(`${API_BASE_URL}/records/check-potential?${params}`);
    if (!response.ok) throw new Error('Failed to check potential record');
    return response.json();
  },

  // Pobierz statystyki rekordów
  getStatistics: async (): Promise<RecordStatistics> => {
    const response = await fetch(`${API_BASE_URL}/records/statistics`);
    if (!response.ok) throw new Error('Failed to fetch record statistics');
    return response.json();
  },

  // Importuj rekordy z pliku CSV
  importRecords: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/records/import`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to import records');
    return response.json();
  },
};

// Custom hooks
export const useRecords = (filters?: {
  type?: string;
  eventName?: string;
  gender?: string;
  category?: string;
  nationality?: string;
  isActive?: boolean;
  isIndoor?: boolean;
}) => {
  return useQuery({
    queryKey: ['records', filters],
    queryFn: () => recordsApi.getRecords(filters),
  });
};

export const useRecord = (id: string) => {
  return useQuery({
    queryKey: ['record', id],
    queryFn: () => recordsApi.getRecord(id),
    enabled: !!id,
  });
};

export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recordsApi.createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record-statistics'] });
    },
  });
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecordForm> }) =>
      recordsApi.updateRecord(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record', id] });
      queryClient.invalidateQueries({ queryKey: ['record-statistics'] });
    },
  });
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recordsApi.deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record-statistics'] });
    },
  });
};

export const useBestRecord = (
  eventName: string,
  type: string,
  gender: string,
  category: string,
  nationality?: string,
  isIndoor?: boolean
) => {
  return useQuery({
    queryKey: ['best-record', eventName, type, gender, category, nationality, isIndoor],
    queryFn: () => recordsApi.getBestRecord(eventName, type, gender, category, nationality, isIndoor),
    enabled: !!(eventName && type && gender && category),
  });
};

export const useCheckPotentialRecord = () => {
  return useMutation({
    mutationFn: ({
      eventName,
      result,
      unit,
      gender,
      category,
      nationality,
      isIndoor,
    }: {
      eventName: string;
      result: string;
      unit: string;
      gender: string;
      category: string;
      nationality: string;
      isIndoor?: boolean;
    }) => recordsApi.checkPotentialRecord(eventName, result, unit, gender, category, nationality, isIndoor),
  });
};

export const useRecordStatistics = () => {
  return useQuery({
    queryKey: ['record-statistics'],
    queryFn: recordsApi.getStatistics,
  });
};

export const useImportRecords = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recordsApi.importRecords,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record-statistics'] });
    },
  });
};