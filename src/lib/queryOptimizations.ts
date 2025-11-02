import { QueryClient } from "@tanstack/react-query";

// Optymalizacje dla React Query z automatycznym odświeżaniem
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Krótszy staleTime dla lepszej responsywności
        staleTime: 30 * 1000, // 30 sekund
        // Przechowuj w cache przez 5 minut
        gcTime: 5 * 60 * 1000,
        // Włącz refetch przy focus okna dla lepszej synchronizacji
        refetchOnWindowFocus: true,
        // Włącz refetch przy reconnect
        refetchOnReconnect: true,
        // Retry tylko raz
        retry: 1,
        // Retry delay
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch w tle dla świeżych danych
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations tylko raz
        retry: 1,
        // Automatyczne odświeżanie po mutacjach
        onSettled: () => {
          // Można dodać globalne logowanie mutacji
        },
      },
    },
  });
};

// Predefiniowane query keys dla lepszej organizacji
export const queryKeys = {
  competitions: {
    all: ["competitions"] as const,
    lists: () => [...queryKeys.competitions.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.competitions.lists(), { filters }] as const,
    details: () => [...queryKeys.competitions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.competitions.details(), id] as const,
  },
  athletes: {
    all: ["athletes"] as const,
    lists: () => [...queryKeys.athletes.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.athletes.lists(), { filters }] as const,
    details: () => [...queryKeys.athletes.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.athletes.details(), id] as const,
  },
  registrations: {
    all: ["registrations"] as const,
    lists: () => [...queryKeys.registrations.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.registrations.lists(), { filters }] as const,
    my: () => [...queryKeys.registrations.all, "my"] as const,
  },
} as const;

// Funkcje do prefetch danych
export const prefetchQueries = {
  competitions: (queryClient: QueryClient) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.competitions.lists(),
      queryFn: async () => {
        const { competitionsApi } = await import("@/lib/api");
        const response = await competitionsApi.getPublic();
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  },

  athletes: (queryClient: QueryClient) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.athletes.lists(),
      queryFn: async () => {
        const { athletesApi } = await import("@/lib/api");
        const response = await athletesApi.getAll();
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  },
};
