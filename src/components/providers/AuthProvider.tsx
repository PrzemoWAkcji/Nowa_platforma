'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // Inicjalizuj uwierzytelnienie przy starcie aplikacji
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}