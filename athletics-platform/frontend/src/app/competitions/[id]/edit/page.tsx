'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCompetition } from '@/hooks/useCompetitions';
import { EditCompetitionForm } from '@/components/forms/EditCompetitionForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditCompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const { data: competition, isLoading, error } = useCompetition(competitionId);

  const handleSuccess = () => {
    router.push(`/competitions/${competitionId}`);
  };

  const handleCancel = () => {
    router.push(`/competitions/${competitionId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie zawodów...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Zawody nie zostały znalezione
          </h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'Nie można załadować danych zawodów.'}
          </p>
          <Button onClick={() => router.push('/competitions')}>
            Powrót do listy zawodów
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edytuj zawody</h1>
            <p className="text-gray-600 mt-2">{competition.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <EditCompetitionForm
          competition={competition}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}