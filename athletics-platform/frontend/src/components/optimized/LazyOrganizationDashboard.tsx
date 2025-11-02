'use client';

import { lazy, Suspense } from 'react';

// Lazy load heavy components
const OrganizationDashboard = lazy(() => import('../organization/OrganizationDashboard'));

interface LazyOrganizationDashboardProps {
  competitionId: string;
}

export default function LazyOrganizationDashboard({ competitionId }: LazyOrganizationDashboardProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie panelu organizacji...</p>
        </div>
      </div>
    }>
      <OrganizationDashboard competitionId={competitionId} />
    </Suspense>
  );
}