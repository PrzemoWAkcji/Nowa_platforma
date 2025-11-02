'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CombinedEventCard } from '@/components/combined-events/CombinedEventCard';
import { CreateCombinedEventForm } from '@/components/combined-events/CreateCombinedEventForm';
import { QuickCombinedEventRegistration } from '@/components/combined-events/QuickCombinedEventRegistration';
import { useCombinedEvents } from '@/hooks/useCombinedEvents';
import { useCompetitions } from '@/hooks/useCompetitions';
import { useDebounce } from '@/hooks/useDebounce';
import { Trophy, Plus, Search, Filter, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CombinedEventsContent() {
  const { combinedEvents, getCombinedEventsByCompetition, loading, error } = useCombinedEvents();
  const { data: competitions, refetch: getCompetitions } = useCompetitions();
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQuickRegistration, setShowQuickRegistration] = useState(false);
  
  // Debounce search term dla lepszej wydajności
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    getCompetitions();
  }, [getCompetitions]);

  useEffect(() => {
    if (selectedCompetition) {
      getCombinedEventsByCompetition(selectedCompetition);
    }
  }, [selectedCompetition, getCombinedEventsByCompetition]);

  // Filtrowanie wielobojów z debounced search
  const filteredEvents = combinedEvents.filter(event => {
    const matchesSearch = !debouncedSearchTerm || 
      (event.athlete?.firstName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
       event.athlete?.lastName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
       event.athlete?.club?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    
    const matchesEventType = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && event.isComplete) ||
      (statusFilter === 'in-progress' && !event.isComplete);

    return matchesSearch && matchesEventType && matchesStatus;
  });

  // Statystyki
  const stats = {
    total: combinedEvents.length,
    completed: combinedEvents.filter(e => e.isComplete).length,
    inProgress: combinedEvents.filter(e => !e.isComplete).length,
    averagePoints: combinedEvents.length > 0 
      ? Math.round(combinedEvents.reduce((sum, e) => sum + e.totalPoints, 0) / combinedEvents.length)
      : 0
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    if (selectedCompetition) {
      getCombinedEventsByCompetition(selectedCompetition);
    }
  };

  const handleQuickRegistrationSuccess = () => {
    setShowQuickRegistration(false);
    if (selectedCompetition) {
      getCombinedEventsByCompetition(selectedCompetition);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            Wieloboje
          </h1>
          <p className="text-gray-600 mt-2">
            Zarządzaj dziesięciobojami, siedmiobojami i pięciobojami
          </p>
        </div>
        
        <div className="flex gap-3">
          {selectedCompetition && (
            <Button asChild variant="outline">
              <Link href={`/combined-events/competition/${selectedCompetition}/ranking`}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Ranking
              </Link>
            </Button>
          )}
          
          <Dialog open={showQuickRegistration} onOpenChange={setShowQuickRegistration}>
            <DialogTrigger asChild>
              <Button disabled={!selectedCompetition} variant="default">
                <Zap className="h-4 w-4 mr-2" />
                Szybka rejestracja
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Szybka rejestracja na wielobój</DialogTitle>
              </DialogHeader>
              {selectedCompetition && (
                <QuickCombinedEventRegistration
                  competitionId={selectedCompetition}
                  onSuccess={handleQuickRegistrationSuccess}
                  onCancel={() => setShowQuickRegistration(false)}
                />
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button disabled={!selectedCompetition} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Pojedynczy wielobój
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Utwórz nowy wielobój</DialogTitle>
              </DialogHeader>
              {selectedCompetition && (
                <CreateCombinedEventForm
                  competitionId={selectedCompetition}
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setShowCreateForm(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Wybór zawodów */}
      <Card>
        <CardHeader>
          <CardTitle>Wybierz zawody</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz zawody..." />
            </SelectTrigger>
            <SelectContent>
              {competitions?.map((competition) => (
                <SelectItem key={competition.id} value={competition.id}>
                  {competition.name} - {new Date(competition.startDate).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCompetition && (
        <>
          {/* Statystyki */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Łącznie</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ukończone</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <Badge className="bg-green-500">✓</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">W trakcie</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
                  </div>
                  <Badge variant="secondary">⏳</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Średnia punktów</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.averagePoints}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Szukaj zawodnika</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Imię, nazwisko lub klub..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Typ wieloboju</label>
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="DECATHLON">10-bój</SelectItem>
                      <SelectItem value="HEPTATHLON">7-bój</SelectItem>
                      <SelectItem value="PENTATHLON">5-bój (indoor)</SelectItem>
                      <SelectItem value="PENTATHLON_U16_MALE">5-bój U16 chłopcy</SelectItem>
                      <SelectItem value="PENTATHLON_U16_FEMALE">5-bój U16 dziewczęta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="completed">Ukończone</SelectItem>
                      <SelectItem value="in-progress">W trakcie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista wielobojów */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Ładowanie wielobojów...</p>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  {combinedEvents.length === 0 
                    ? 'Brak wielobojów w wybranych zawodach'
                    : 'Brak wielobojów spełniających kryteria filtrowania'
                  }
                </p>
                {combinedEvents.length === 0 && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Utwórz pierwszy wielobój
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((combinedEvent) => (
                <CombinedEventCard
                  key={combinedEvent.id}
                  combinedEvent={combinedEvent}
                  showAthlete={true}
                  showActions={true}
                  onUpdate={() => {
                    if (selectedCompetition) {
                      getCombinedEventsByCompetition(selectedCompetition);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}