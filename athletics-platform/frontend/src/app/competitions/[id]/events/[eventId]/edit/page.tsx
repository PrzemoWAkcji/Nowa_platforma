'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useCompetition } from '@/hooks/useCompetitions';
import { EditEventForm } from '@/components/forms/EditEventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CreateEventForm as CreateEventFormType } from '@/types';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const eventId = params.eventId as string;

  const { data: competition, isLoading: competitionLoading } = useCompetition(competitionId);
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const updateEvent = useUpdateEvent();

  const handleSubmit = async (data: CreateEventFormType) => {
    try {
      await updateEvent.mutateAsync({
        id: eventId,
        data: {
          ...data,
          competitionId,
        },
      });
      toast.success('Konkurencja została zaktualizowana');
      router.push(`/competitions/${competitionId}/events`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd podczas aktualizacji konkurencji');
    }
  };

  const handleCancel = () => {
    router.push(`/competitions/${competitionId}/events`);
  };

  if (competitionLoading || eventLoading) {
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

  if (!competition || !event) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {!competition ? 'Zawody nie zostały znalezione' : 'Konkurencja nie została znaleziona'}
          </h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Edytuj konkurencję</h1>
            <p className="text-gray-600 mt-2">{competition.name} - {event.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edycja konkurencji</CardTitle>
          </CardHeader>
          <CardContent>
            <EditEventForm
              event={event}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={updateEvent.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}