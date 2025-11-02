import { useState, useEffect } from 'react';

/**
 * Hook do debounce wartości - opóźnia aktualizację wartości o określony czas
 * Przydatne dla optymalizacji wyszukiwania i API calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}