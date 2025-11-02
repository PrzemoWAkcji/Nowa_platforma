import { lazy } from 'react';

// Lazy loading komponentów dla lepszej wydajności
export const LazyDashboard = lazy(() => import('@/app/dashboard/page'));
export const LazyCompetitions = lazy(() => import('@/app/competitions/page'));
export const LazyAthletes = lazy(() => import('@/app/athletes/page'));
export const LazyRegistrations = lazy(() => import('@/app/registrations/page'));

// Komponenty UI z lazy loading - dodaj gdy będą potrzebne
// export const LazyDataTable = lazy(() => import('@/components/ui/data-table'));
// export const LazyChart = lazy(() => import('@/components/ui/chart'));

// Fallback component dla loading
export const ComponentLoader = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);