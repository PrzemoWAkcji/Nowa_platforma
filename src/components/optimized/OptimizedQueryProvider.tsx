'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface OptimizedQueryProviderProps {
  children: React.ReactNode;
}

export default function OptimizedQueryProvider({ children }: OptimizedQueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Zwiększ czas cache'owania
        staleTime: 5 * 60 * 1000, // 5 minut
        gcTime: 10 * 60 * 1000, // 10 minut (poprzednio cacheTime)
        
        // Optymalizacje dla wydajności
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: (failureCount: number, error: any) => {
          // Nie ponawiaj dla błędów 4xx
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        
        // Batch requests
        networkMode: 'online',
      },
      mutations: {
        // Optymalizacje dla mutacji
        retry: 1,
        networkMode: 'online',
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
        />
      )}
    </QueryClientProvider>
  );
}