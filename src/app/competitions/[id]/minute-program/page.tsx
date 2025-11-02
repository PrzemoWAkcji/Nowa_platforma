'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import MinuteProgramManager from '@/components/organization/MinuteProgramManager';
import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState } from 'react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CompetitionMinuteProgramPage({ params }: PageProps) {
  const [competitionId, setCompetitionId] = useState<string>('');

  // Rozwiąż params
  React.useEffect(() => {
    params.then(({ id }) => setCompetitionId(id));
  }, [params]);

  if (!competitionId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Program minutowy" 
          description="Zarządzaj programami minutowymi zawodów"
          backButtonFallback={`/competitions/${competitionId}`}
        />
        
        <MinuteProgramManager competitionId={competitionId} />
      </div>
    </DashboardLayout>
  );
}