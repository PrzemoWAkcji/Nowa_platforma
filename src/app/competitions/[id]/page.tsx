'use client';

import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Trophy, Edit, Trash2, Plus, Clock, Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { ImportStartListDialog } from '@/components/competitions/ImportStartListDialog';
import { useCompetition, useDeleteCompetition } from '@/hooks/useCompetitions';
import { CompetitionStatus, CompetitionType, UserRole } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'sonner';

// Funkcja do wykrywania konkurencji sztafetowych po nazwie
const isRelayEvent = (eventName: string): boolean => {
  const relayKeywords = ['4x100', '4x400', '4x200', '4x800', '4x1500', 'sztafeta', 'relay'];
  return relayKeywords.some(keyword => 
    eventName.toLowerCase().includes(keyword.toLowerCase())
  );
};

const statusColors = {
  [CompetitionStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [CompetitionStatus.PUBLISHED]: 'bg-blue-100 text-blue-800',
  [CompetitionStatus.REGISTRATION_OPEN]: 'bg-green-100 text-green-800',
  [CompetitionStatus.REGISTRATION_CLOSED]: 'bg-yellow-100 text-yellow-800',
  [CompetitionStatus.ONGOING]: 'bg-purple-100 text-purple-800',
  [CompetitionStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
  [CompetitionStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

const statusLabels = {
  [CompetitionStatus.DRAFT]: 'Szkic',
  [CompetitionStatus.PUBLISHED]: 'Opublikowane',
  [CompetitionStatus.REGISTRATION_OPEN]: 'Rejestracja otwarta',
  [CompetitionStatus.REGISTRATION_CLOSED]: 'Rejestracja zamknięta',
  [CompetitionStatus.ONGOING]: 'W trakcie',
  [CompetitionStatus.COMPLETED]: 'Zakończone',
  [CompetitionStatus.CANCELLED]: 'Anulowane',
};

const typeLabels = {
  [CompetitionType.OUTDOOR]: 'Stadion (outdoor)',
  [CompetitionType.INDOOR]: 'Hala (indoor)',
  [CompetitionType.ROAD]: 'Bieg uliczny',
  [CompetitionType.CROSS_COUNTRY]: 'Przełaj',
  [CompetitionType.TRAIL]: 'Bieg górski',
  [CompetitionType.DUATHLON]: 'Duathlon',
  [CompetitionType.TRIATHLON]: 'Triathlon',
  [CompetitionType.MULTI_EVENT]: 'Wielobój',
};

export default function CompetitionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  
  const { data: competition, isLoading, error } = useCompetition(competitionId);
  const deleteCompetition = useDeleteCompetition();
  const { user } = useAuthStore();

  // Funkcje obsługi przycisków
  const handleEdit = () => {
    router.push(`/competitions/${competitionId}/edit`);
  };

  const handleDelete = async () => {
    if (!competition) return;
    
    // Sprawdź uprawnienia
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.ORGANIZER)) {
      toast.error('Nie masz uprawnień do usuwania zawodów');
      return;
    }

    // Sprawdź czy zawody mają rejestracje lub wyniki
    const hasRegistrations = competition.registrations && competition.registrations.length > 0;
    const hasEvents = competition.events && competition.events.length > 0;
    
    if (hasRegistrations) {
      toast.error('Nie można usunąć zawodów, które mają rejestracje. Usuń najpierw wszystkie rejestracje.');
      return;
    }

    if (hasEvents) {
      const hasResults = competition.events?.some(event => 
        event._count && (event._count.results > 0 || (event._count.relayTeamRegistrations && event._count.relayTeamRegistrations > 0))
      ) || false;
      
      if (hasResults) {
        toast.error('Nie można usunąć zawodów, które mają wyniki lub zespoły sztafetowe. Usuń najpierw wszystkie wyniki i zespoły.');
        return;
      }
    }

    if (confirm('Czy na pewno chcesz usunąć te zawody? Ta operacja jest nieodwracalna.')) {
      try {
        await deleteCompetition.mutateAsync(competitionId);
        toast.success('Zawody zostały usunięte');
        router.push('/competitions');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Błąd podczas usuwania zawodów');
      }
    }
  };

  const handleAddEvent = () => {
    router.push(`/competitions/${competitionId}/events/create`);
  };

  const handleViewAllRegistrations = () => {
    router.push(`/competitions/${competitionId}/registrations`);
  };

  const handleManageEvents = () => {
    router.push(`/competitions/${competitionId}/events`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie zawodów...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !competition) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Błąd podczas ładowania zawodów</p>
            <Button variant="outline" className="mt-2" onClick={() => router.back()}>
              Wróć
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title="" 
          showBackButton={true}
          backButtonFallback="/competitions"
        />
        
        {/* Competition Header */}
        <div className="flex items-start justify-between -mt-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{competition.name}</h1>
              <Badge className={statusColors[competition.status]}>
                {statusLabels[competition.status]}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(competition.startDate), 'dd MMM yyyy', { locale: pl })}
                {competition.startDate !== competition.endDate && (
                  <span> - {format(new Date(competition.endDate), 'dd MMM yyyy', { locale: pl })}</span>
                )}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {competition.location}
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                {typeLabels[competition.type]}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/competitions/${competitionId}/settings`)}>
              <Settings className="h-4 w-4 mr-2" />
              Ustawienia
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
            {user && (user.role === UserRole.ADMIN || user.role === UserRole.ORGANIZER) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={handleDelete}
                disabled={deleteCompetition.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteCompetition.isPending ? 'Usuwanie...' : 'Usuń'}
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Competition Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Management Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Listy startowe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Listy startowe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Zarządzanie listami startowymi</p>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push(`/competitions/${competitionId}/startlists`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Otwórz listy startowe
                  </Button>
                </CardContent>
              </Card>

              {/* Wyniki */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Wyniki
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Wprowadzanie i zarządzanie wynikami</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push('/results')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj wyniki
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push('/results/import')}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Import wyników
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Program minutowy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Program minutowy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Harmonogram zawodów i konkurencji</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push(`/competitions/${competitionId}/minute-program`)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Edytuj program
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push('/minute-program')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Eksport PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Numery startowe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Numery startowe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Przydzielanie numerów startowych</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push(`/competitions/${competitionId}/startlists`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Przydział numery
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push(`/competitions/${competitionId}/startlists`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Lista numerów
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {competition.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Opis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{competition.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Konkurencje</CardTitle>
                  <div className="flex space-x-2">
                    <ImportStartListDialog 
                      competitionId={competitionId}
                      trigger={
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Importuj listę startową
                        </Button>
                      }
                    />
                    <Button size="sm" onClick={handleAddEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj konkurencję
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {competition.events && competition.events.length > 0 ? (
                  <div className="space-y-3">
                    {competition.events.map((event) => {
                      const isRelay = event.type === 'RELAY' || isRelayEvent(event.name);
                      return (
                        <div 
                          key={event.id} 
                          className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
                            isRelay ? 'cursor-pointer hover:bg-gray-100' : ''
                          }`}
                          onClick={() => {
                            if (isRelay) {
                              router.push(`/competitions/${competitionId}/relay-events/${event.id}`);
                            }
                          }}
                        >
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                          <p className="text-sm text-gray-600">
                            {event.gender} • {event.category}
                            {event._count && (
                              <span> • {
                                isRelay 
                                  ? `${event._count.relayTeamRegistrations || 0} zespołów`
                                  : `${event._count.registrationEvents || 0} rejestracji`
                              }</span>
                            )}
                          </p>
                        </div>
                        <Badge variant="outline">{isRelay ? 'RELAY' : event.type}</Badge>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Brak konkurencji</p>
                    <Button onClick={handleAddEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj pierwszą konkurencję
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>Rejestracje</CardTitle>
              </CardHeader>
              <CardContent>
                {competition.registrations && competition.registrations.length > 0 ? (
                  <div className="space-y-3">
                    {competition.registrations.slice(0, 5).map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">
                            {registration.athlete?.firstName} {registration.athlete?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {registration.athlete?.club || 'Brak klubu'}
                          </p>
                        </div>
                        <Badge variant="outline">{registration.status}</Badge>
                      </div>
                    ))}
                    {competition.registrations.length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        i {competition.registrations.length - 5} więcej...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Brak rejestracji</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statystyki</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejestracje:</span>
                  <span className="font-medium">{competition._count?.registrations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Konkurencje:</span>
                  <span className="font-medium">{competition.events?.length || 0}</span>
                </div>
                {competition.maxParticipants && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Limit miejsc:</span>
                    <span className="font-medium">{competition.maxParticipants}</span>
                  </div>
                )}
                {competition.registrationFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Opłata startowa:</span>
                    <span className="font-medium">{competition.registrationFee} PLN</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registration Dates */}
            {(competition.registrationStartDate || competition.registrationEndDate) && (
              <Card>
                <CardHeader>
                  <CardTitle>Terminy rejestracji</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {competition.registrationStartDate && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Początek</p>
                        <p className="font-medium">
                          {format(new Date(competition.registrationStartDate), 'dd MMM yyyy, HH:mm', { locale: pl })}
                        </p>
                      </div>
                    </div>
                  )}
                  {competition.registrationEndDate && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Koniec</p>
                        <p className="font-medium">
                          {format(new Date(competition.registrationEndDate), 'dd MMM yyyy, HH:mm', { locale: pl })}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Venue Details */}
            {competition.venue && (
              <Card>
                <CardHeader>
                  <CardTitle>Obiekt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{competition.venue}</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Akcje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => router.push(`/competitions/${competitionId}/organization`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Organizacja zawodów
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => router.push(`/competitions/${competitionId}/minute-program`)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Program minutowy
                </Button>
                <ImportStartListDialog 
                  competitionId={competitionId}
                  trigger={
                    <Button variant="outline" className="w-full" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Importuj listę startową
                    </Button>
                  }
                />
                <Button 
                  className="w-full" 
                  size="sm" 
                  variant="outline"
                  onClick={handleViewAllRegistrations}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Zobacz wszystkie rejestracje
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => router.push(`/competitions/${competitionId}/relay-teams`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Zespoły sztafetowe
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={handleManageEvents}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Zarządzaj konkurencjami
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj zawody
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}