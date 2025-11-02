// Optymalizacje dla localStorage z debouncing i caching

class OptimizedStorage {
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private pendingData = new Map<string, any>();
  private readonly defaultDebounceMs = 1000;

  setItem(
    key: string,
    value: any,
    debounceMs: number = this.defaultDebounceMs
  ): void {
    // Store in memory immediately
    this.pendingData.set(key, value);

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.flushToStorage(key);
    }, debounceMs);

    this.debounceTimers.set(key, timer);
  }

  getItem<T = any>(key: string): T | null {
    // Check memory first
    if (this.pendingData.has(key)) {
      return this.pendingData.get(key);
    }

    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }

  removeItem(key: string): void {
    // Remove from memory
    this.pendingData.delete(key);

    // Clear timer
    const timer = this.debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }

    // Remove from localStorage
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage errors
    }
  }

  clear(): void {
    // Clear memory
    this.pendingData.clear();

    // Clear all timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Clear localStorage
    try {
      localStorage.clear();
    } catch (error) {
      // Ignore storage errors
    }
  }

  flush(): void {
    // Flush all pending data
    this.pendingData.forEach((value, key) => {
      this.flushToStorage(key);
    });
  }

  private flushToStorage(key: string): void {
    const value = this.pendingData.get(key);
    if (value === undefined) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.pendingData.delete(key);
      this.debounceTimers.delete(key);
    } catch (error) {
      // Ignore storage errors
    }
  }
}

export const optimizedStorage = new OptimizedStorage();

// Hook do używania w komponentach
export const useOptimizedStorage = () => {
  return optimizedStorage;
};

// Klucze localStorage dla lepszej organizacji
export const storageKeys = {
  auth: {
    user: "auth-storage-user",
    token: "auth-storage-token",
    legacyToken: "token",
  },
  preferences: {
    theme: "user-theme",
    language: "user-language",
    dashboardLayout: "dashboard-layout",
  },
  cache: {
    competitions: "cache-competitions",
    athletes: "cache-athletes",
  },
} as const;
