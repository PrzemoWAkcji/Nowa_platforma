import { api } from '@/lib/api';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export interface CombinedEventResult {
  id: string;
  discipline: string;
  dayOrder: number;
  performance: string | null;
  points: number;
  wind?: string;
  isValid: boolean;
}

export interface CombinedEvent {
  id: string;
  eventType: 'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON' | 'PENTATHLON_U16_MALE' | 'PENTATHLON_U16_FEMALE';
  athleteId: string;
  competitionId: string;
  gender: 'MALE' | 'FEMALE';
  totalPoints: number;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
    club?: string;
  };
  results: CombinedEventResult[];
}

export interface CreateCombinedEventData {
  eventType: 'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON' | 'PENTATHLON_U16_MALE' | 'PENTATHLON_U16_FEMALE';
  athleteId: string;
  competitionId: string;
  gender: 'MALE' | 'FEMALE';
}

export interface UpdateResultData {
  performance: string;
  wind?: string;
}

export interface CombinedEventStatistics {
  totalEvents: number;
  completedEvents: number;
  averagePoints: number;
  bestPerformance: CombinedEvent | null;
  eventTypeBreakdown: Record<string, number>;
}

export function useCombinedEvents() {
  const [combinedEvents, setCombinedEvents] = useState<CombinedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCombinedEvent = async (data: CreateCombinedEventData): Promise<CombinedEvent> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/combined-events', data);
      const newEvent = response.data;
      setCombinedEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas tworzenia wieloboju';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCombinedEvent = async (id: string): Promise<CombinedEvent> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/combined-events/${id}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas pobierania wieloboju';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCombinedEventsByCompetition = async (competitionId: string): Promise<CombinedEvent[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/combined-events/competition/${competitionId}`);
      const events = response.data;
      setCombinedEvents(events);
      return events;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas pobierania wielobojów';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateEventResult = async (
    combinedEventId: string,
    discipline: string,
    data: UpdateResultData
  ): Promise<CombinedEventResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/combined-events/${combinedEventId}/discipline/${discipline}`, data);
      
      // Aktualizuj lokalny stan
      setCombinedEvents(prev => prev.map(event => {
        if (event.id === combinedEventId) {
          const updatedResults = event.results.map(result => 
            result.discipline === discipline ? response.data : result
          );
          return { ...event, results: updatedResults };
        }
        return event;
      }));
      
      return response.data;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas aktualizacji wyniku';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRanking = async (
    competitionId: string,
    eventType: 'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON' | 'PENTATHLON_U16_MALE' | 'PENTATHLON_U16_FEMALE'
  ): Promise<(CombinedEvent & { position: number })[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/combined-events/competition/${competitionId}/ranking`, {
        params: { eventType }
      });
      return response.data;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas pobierania rankingu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = async (competitionId: string): Promise<CombinedEventStatistics> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/combined-events/competition/${competitionId}/statistics`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas pobierania statystyk';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = async (
    discipline: string,
    performance: string,
    gender: 'MALE' | 'FEMALE' = 'MALE'
  ): Promise<number> => {
    try {
      const response = await api.post('/combined-events/calculate-points', {
        discipline,
        performance,
        gender
      });
      return response.data.points;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas obliczania punktów';
      throw new Error(errorMessage);
    }
  };

  const validatePerformance = async (
    discipline: string,
    performance: string
  ): Promise<boolean> => {
    try {
      const response = await api.post('/combined-events/validate-performance', {
        discipline,
        performance
      });
      return response.data.isValid;
    } catch {
      return false;
    }
  };

  const deleteCombinedEvent = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/combined-events/${id}`);
      setCombinedEvents(prev => prev.filter(event => event.id !== id));
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Błąd podczas usuwania wieloboju';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    combinedEvents,
    loading,
    error,
    createCombinedEvent,
    getCombinedEvent,
    getCombinedEventsByCompetition,
    updateEventResult,
    getRanking,
    getStatistics,
    calculatePoints,
    validatePerformance,
    deleteCombinedEvent,
    setError
  };
}

// Hook do obsługi pojedynczego wieloboju
export function useCombinedEvent(id: string | null) {
  const [combinedEvent, setCombinedEvent] = useState<CombinedEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getCombinedEvent, updateEventResult } = useCombinedEvents();

  const loadCombinedEvent = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const event = await getCombinedEvent(id);
      setCombinedEvent(event);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, getCombinedEvent]);

  useEffect(() => {
    if (id) {
      loadCombinedEvent();
    }
  }, [id, loadCombinedEvent]);

  const updateResult = async (discipline: string, data: UpdateResultData) => {
    if (!id) return;
    
    try {
      const updatedResult = await updateEventResult(id, discipline, data);
      
      // Aktualizuj lokalny stan
      setCombinedEvent(prev => {
        if (!prev) return null;
        
        const updatedResults = prev.results.map(result => 
          result.discipline === discipline ? updatedResult : result
        );
        
        // Przelicz całkowitą liczbę punktów
        const totalPoints = updatedResults
          .filter(r => r.isValid)
          .reduce((sum, r) => sum + r.points, 0);
        
        const isComplete = updatedResults.every(r => r.isValid);
        
        return {
          ...prev,
          results: updatedResults,
          totalPoints,
          isComplete
        };
      });
      
      return updatedResult;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    combinedEvent,
    loading,
    error,
    updateResult,
    reload: loadCombinedEvent,
    setError
  };
}