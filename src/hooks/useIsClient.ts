import { useEffect, useState } from 'react';

/**
 * Hook do sprawdzania czy komponent jest renderowany po stronie klienta
 * Pomaga uniknąć problemów z hydracją przy dostępie do localStorage, window itp.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}