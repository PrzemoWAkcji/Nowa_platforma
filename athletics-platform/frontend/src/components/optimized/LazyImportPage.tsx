'use client';

import { lazy, Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Lazy load heavy components
const ImportFinishlynxContent = lazy(() => import('./ImportFinishlynxContent'));

export default function LazyImportPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie importu wyników...</p>
          </div>
        </div>
      }>
        <ImportFinishlynxContent />
      </Suspense>
    </DashboardLayout>
  );
}