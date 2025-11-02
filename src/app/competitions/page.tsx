'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCompetitions } from '@/hooks/useCompetitions';
import { Competition, CompetitionStatus } from '@/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

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

function CompetitionCard({ competition }: { competition: Competition }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{competition.name}</CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(competition.startDate), 'dd MMM yyyy', { locale: pl })}
            </div>
          </div>
          <Badge className={statusColors[competition.status]}>
            {statusLabels[competition.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {competition.location}
          </div>
          {competition._count && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {competition._count.registrations} rejestracji
            </div>
          )}
          {competition.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {competition.description}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <Badge variant="outline">
            {competition.type.replace('_', ' ')}
          </Badge>
          <Link href={`/competitions/${competition.id}`}>
            <Button variant="outline" size="sm">
              Zobacz szczegóły
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompetitionsPage() {
  const { data: competitions, isLoading, error } = useCompetitions();
  const [filter, setFilter] = useState<CompetitionStatus | 'ALL'>('ALL');

  const filteredCompetitions = competitions?.filter(
    competition => filter === 'ALL' || competition.status === filter
  ) || [];

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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Błąd podczas ładowania zawodów</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Spróbuj ponownie
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
          title="Zawody" 
          description="Zarządzaj zawodami lekkoatletycznymi"
        >
          <Link href="/competitions/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nowe zawody
            </Button>
          </Link>
        </PageHeader>

        {/* Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
          >
            Wszystkie
          </Button>
          {Object.values(CompetitionStatus).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {statusLabels[status]}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {competitions?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Wszystkich zawodów</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {competitions?.filter(c => c.status === CompetitionStatus.REGISTRATION_OPEN).length || 0}
              </div>
              <p className="text-sm text-gray-600">Otwarte rejestracje</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {competitions?.filter(c => c.status === CompetitionStatus.ONGOING).length || 0}
              </div>
              <p className="text-sm text-gray-600">W trakcie</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {competitions?.filter(c => c.status === CompetitionStatus.COMPLETED).length || 0}
              </div>
              <p className="text-sm text-gray-600">Zakończone</p>
            </CardContent>
          </Card>
        </div>

        {/* Competitions Grid */}
        {filteredCompetitions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Brak zawodów
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'ALL' 
                  ? 'Nie ma jeszcze żadnych zawodów. Utwórz pierwsze zawody.'
                  : `Brak zawodów o statusie "${statusLabels[filter as CompetitionStatus]}".`
                }
              </p>
              <Link href="/competitions/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Utwórz zawody
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}