import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Hook do zarządzania synchronizacją danych w aplikacji
 * Zapewnia automatyczne odświeżanie powiązanych danych po mutacjach
 */
export const useDataSync = () => {
  const queryClient = useQueryClient();

  // Funkcja do odświeżania wszystkich powiązanych danych po zmianie rejestracji
  const syncAfterRegistrationChange = useCallback(() => {
    // Invaliduj wszystkie zapytania związane z rejestracjami
    queryClient.invalidateQueries({ queryKey: ["registrations"] });
    // Invaliduj również powiązane dane
    queryClient.invalidateQueries({ queryKey: ["competitions"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["athletes"] });

    // Wymuszaj natychmiastowe refetch najważniejszych danych
    queryClient.refetchQueries({ queryKey: ["registrations"] });
    queryClient.refetchQueries({ queryKey: ["competitions"] });
  }, [queryClient]);

  // Funkcja do odświeżania danych po zmianie zawodów
  const syncAfterCompetitionChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["competitions"] });
    queryClient.invalidateQueries({ queryKey: ["registrations"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });

    queryClient.refetchQueries({ queryKey: ["competitions"] });
    queryClient.refetchQueries({ queryKey: ["registrations"] });
  }, [queryClient]);

  // Funkcja do odświeżania danych po zmianie eventów
  const syncAfterEventChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["competitions"] });
    queryClient.invalidateQueries({ queryKey: ["registrations"] });

    queryClient.refetchQueries({ queryKey: ["events"] });
    queryClient.refetchQueries({ queryKey: ["competitions"] });
  }, [queryClient]);

  // Funkcja do odświeżania danych po zmianie zawodników
  const syncAfterAthleteChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["athletes"] });
    queryClient.invalidateQueries({ queryKey: ["registrations"] });

    queryClient.refetchQueries({ queryKey: ["athletes"] });
    queryClient.refetchQueries({ queryKey: ["registrations"] });
  }, [queryClient]);

  // Funkcja do wymuszenia pełnego odświeżenia wszystkich danych
  const forceFullSync = useCallback(() => {
    queryClient.invalidateQueries();
    queryClient.refetchQueries({ queryKey: ["registrations"] });
    queryClient.refetchQueries({ queryKey: ["competitions"] });
    queryClient.refetchQueries({ queryKey: ["events"] });
    queryClient.refetchQueries({ queryKey: ["athletes"] });
  }, [queryClient]);

  // Funkcja do czyszczenia cache i wymuszenia pełnego odświeżenia
  const clearCacheAndSync = useCallback(() => {
    queryClient.clear();
    // Po wyczyszczeniu cache, dane będą automatycznie pobrane ponownie
    // gdy komponenty będą ich potrzebować
  }, [queryClient]);

  return {
    syncAfterRegistrationChange,
    syncAfterCompetitionChange,
    syncAfterEventChange,
    syncAfterAthleteChange,
    forceFullSync,
    clearCacheAndSync,
  };
};

/**
 * Hook do automatycznego odświeżania danych w określonych interwałach
 * Przydatny dla stron, które wymagają częstego odświeżania
 */
export const useAutoRefresh = (intervalMs: number = 30000) => {
  const queryClient = useQueryClient();

  const startAutoRefresh = useCallback(() => {
    const interval = setInterval(() => {
      // Odświeżaj tylko aktywne zapytania
      queryClient.refetchQueries({
        queryKey: ["registrations"],
        type: "active",
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [queryClient, intervalMs]);

  return { startAutoRefresh };
};
