import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings';

export function useSettings() {
  const queryClient = useQueryClient();

  const useSettingsQuery = () => {
    return useQuery({
      queryKey: ['settings'],
      queryFn: () => settingsService.getSettings(),
      select: (response) => response.data,
    });
  };

  const useUpdateSettings = () => {
    return useMutation({
      mutationFn: settingsService.updateSettings,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      },
    });
  };

  return {
    useSettingsQuery,
    useUpdateSettings,
  };
}