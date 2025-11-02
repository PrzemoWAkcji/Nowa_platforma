'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCompetition } from '@/hooks/useCompetitions';
import { useCreateEvent } from '@/hooks/useEvents';
import { CreateEventForm } from '@/components/forms/CreateEventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CreateEventForm as CreateEventFormType } from '@/types';

export default function CreateEventPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const { data: competition, isLoading: competitionLoading } = useCompetition(competitionId);
  const createEvent = useCreateEvent();

  const handleSubmit = async (data: CreateEventFormType) => {
    try {
      await createEvent.mutateAsync({
        ...data,
        competitionId,
      });
      toast.success('Konkurencja została utworzona');
      router.push(`/competitions/${competitionId}/events`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd podczas tworzenia konkurencji');
    }
  };

  const handleCancel = () => {
    router.push(`/competitions/${competitionId}/events`);
  };

  if (competitionLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Zawody nie zostały znalezione</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Dodaj konkurencję</h1>
            <p className="text-gray-600 mt-2">{competition.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Nowa konkurencja</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateEventForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={createEvent.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}