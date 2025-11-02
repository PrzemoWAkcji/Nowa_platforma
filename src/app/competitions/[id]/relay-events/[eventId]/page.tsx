'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Trophy, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RelayEventStartList } from '@/components/relay-teams/RelayEventStartList';
import { useEvent } from '@/hooks/useEvents';
import { useCompetition } from '@/hooks/useCompetitions';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

// Funkcja do wykrywania konkurencji sztafetowych po nazwie
const isRelayEvent = (eventName: string): boolean => {
  const relayKeywords = ['4x100', '4x400', '4x200', '4x800', '4x1500', 'sztafeta', 'relay'];
  return relayKeywords.some(keyword => 
    eventName.toLowerCase().includes(keyword.toLowerCase())
  );
};

export default function RelayEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const competitionId = params.id as string;
  
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { data: competition, isLoading: competitionLoading } = useCompetition(competitionId);

  const handleBack = () => {
    router.push(`/competitions/${competitionId}`);
  };

  const isLoading = eventLoading || competitionLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie konkurencji...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (eventError || !event) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Błąd podczas ładowania konkurencji</p>
            <Button variant="outline" className="mt-2" onClick={handleBack}>
              Wróć do zawodów
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isRelay = event.type === 'RELAY' || isRelayEvent(event.name);
  
  if (!isRelay) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Ta strona jest przeznaczona tylko dla konkurencji sztafetowych</p>
            <p className="text-sm text-gray-600 mt-2">
              Typ konkurencji: {event.type} | Nazwa: {event.name}
            </p>
            <Button variant="outline" className="mt-2" onClick={handleBack}>
              Wróć do zawodów
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wróć do zawodów
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mt-2">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {event.gender}
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                {event.category}
              </div>
              {competition && (
                <>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(competition.startDate), 'dd MMM yyyy', { locale: pl })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {competition.location}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <RelayEventStartList event={event} />
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Informacje o konkurencji sztafetowej
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Każdy zespół musi mieć co najmniej 4 podstawowych członków</li>
                <li>• Zespoły mogą mieć dodatkowo do 2 rezerwowych</li>
                <li>• Lista startowa jest sortowana według czasów zgłoszeniowych</li>
                <li>• Wyniki można wprowadzać po zakończeniu konkurencji</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}