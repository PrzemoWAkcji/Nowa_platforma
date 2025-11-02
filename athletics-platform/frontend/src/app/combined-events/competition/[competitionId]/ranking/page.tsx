'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CombinedEventRanking } from '@/components/combined-events/CombinedEventRanking';
import { ArrowLeft } from 'lucide-react';

export default function CombinedEventRankingPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.competitionId as string;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Nawigacja */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do wielobojów
        </Button>
      </div>

      {/* Ranking */}
      <CombinedEventRanking competitionId={competitionId} />
    </div>
  );
}