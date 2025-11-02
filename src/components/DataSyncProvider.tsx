"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Komponent zapewniający automatyczną synchronizację danych
 * Odświeża dane gdy użytkownik wraca do okna lub po określonym czasie
 */
export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Funkcja do odświeżania kluczowych danych
    const refreshCriticalData = () => {
      queryClient.refetchQueries({
        queryKey: ["registrations"],
        type: "active",
      });
      queryClient.refetchQueries({
        queryKey: ["competitions"],
        type: "active",
      });
    };

    // Odświeżaj dane gdy użytkownik wraca do okna
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshCriticalData();
      }
    };

    // Odświeżaj dane gdy okno odzyskuje focus
    const handleFocus = () => {
      refreshCriticalData();
    };

    // Automatyczne odświeżanie co 30 sekund (tylko gdy okno jest aktywne)
    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshCriticalData();
      }
    }, 30000);

    // Dodaj event listenery
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  return <>{children}</>;
}
