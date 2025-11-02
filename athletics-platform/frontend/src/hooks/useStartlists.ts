import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competitionsApi } from '@/lib/api';

export const useImportStartlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      competitionId,
      file, 
      format, 
      updateExisting,
      createMissingAthletes
    }: { 
      competitionId: string;
      file: File; 
      format: 'pzla' | 'international'; 
      updateExisting: boolean;
      createMissingAthletes: boolean;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      formData.append('updateExisting', updateExisting.toString());
      formData.append('createMissingAthletes', createMissingAthletes.toString());
      
      const response = await competitionsApi.importStartlist(competitionId, formData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competition', variables.competitionId] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
};