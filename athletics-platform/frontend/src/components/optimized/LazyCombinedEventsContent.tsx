'use client';

import { lazy, Suspense } from 'react';

// Lazy load heavy components
const CombinedEventsContent = lazy(() => import('./CombinedEventsContent'));

export default function LazyCombinedEventsContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie wielobojów...</p>
        </div>
      </div>
    }>
      <CombinedEventsContent />
    </Suspense>
  );
}