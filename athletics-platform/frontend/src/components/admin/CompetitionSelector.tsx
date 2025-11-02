'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Obecnie nieużywane
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompetitions } from '@/hooks/useCompetitions';
import { Competition, CompetitionStatus } from '@/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    Calendar,
    Eye,
    Filter,
    MapPin,
    Plus,
    Search,
    Settings,
    Trophy,
    Users
} from 'lucide-react';
import Link from 'next/link';

interface CompetitionSelectorProps {
  onSelectCompetition: (competition: Competition) => void;
}

export function CompetitionSelector({ onSelectCompetition }: CompetitionSelectorProps) {
  const { data: competitions, isLoading } = useCompetitions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // const router = useRouter(); // Obecnie nieużywane

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.DRAFT:
        return <Badge variant="secondary">Szkic</Badge>;
      case CompetitionStatus.PUBLISHED:
        return <Badge variant="outline">Opublikowane</Badge>;
      case CompetitionStatus.REGISTRATION_OPEN:
        return <Badge className="bg-green-500">Rejestracja otwarta</Badge>;
      case CompetitionStatus.REGISTRATION_CLOSED:
        return <Badge className="bg-orange-500">Rejestracja zamknięta</Badge>;
      case CompetitionStatus.ONGOING:
        return <Badge className="bg-blue-500">W trakcie</Badge>;
      case CompetitionStatus.COMPLETED:
        return <Badge className="bg-gray-500">Zakończone</Badge>;
      case CompetitionStatus.CANCELLED:
        return <Badge variant="destructive">Anulowane</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCompetitions = competitions?.filter(competition => {
    const matchesSearch = competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competition.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || competition.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Ładowanie zawodów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Administratora</h1>
          <p className="text-gray-600 mt-1">Wybierz zawody, które chcesz administrować</p>
        </div>
        <Button asChild>
          <Link href="/competitions/create">
            <Plus className="h-4 w-4 mr-2" />
            Nowe zawody
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Szukaj zawodów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value={CompetitionStatus.DRAFT}>Szkice</SelectItem>
                  <SelectItem value={CompetitionStatus.PUBLISHED}>Opublikowane</SelectItem>
                  <SelectItem value={CompetitionStatus.REGISTRATION_OPEN}>Rejestracja otwarta</SelectItem>
                  <SelectItem value={CompetitionStatus.REGISTRATION_CLOSED}>Rejestracja zamknięta</SelectItem>
                  <SelectItem value={CompetitionStatus.ONGOING}>W trakcie</SelectItem>
                  <SelectItem value={CompetitionStatus.COMPLETED}>Zakończone</SelectItem>
                  <SelectItem value={CompetitionStatus.CANCELLED}>Anulowane</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Wszystkich zawodów</p>
                <p className="text-2xl font-bold">{competitions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Aktywnych</p>
                <p className="text-2xl font-bold">
                  {competitions?.filter(c => 
                    c.status === CompetitionStatus.REGISTRATION_OPEN || 
                    c.status === CompetitionStatus.ONGOING
                  ).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rejestracji</p>
                <p className="text-2xl font-bold">
                  {competitions?.reduce((sum, comp) => sum + (comp._count?.registrations || 0), 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitions List */}
      <div className="space-y-4">
        {filteredCompetitions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Brak zawodów</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nie znaleziono zawodów spełniających kryteria wyszukiwania.'
                  : 'Nie masz jeszcze żadnych zawodów.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/competitions/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Utwórz pierwsze zawody
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCompetitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {competition.name}
                      </h3>
                      {getStatusBadge(competition.status)}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(competition.startDate), 'dd MMM yyyy', { locale: pl })}
                        {competition.endDate && competition.startDate !== competition.endDate && (
                          <span> - {format(new Date(competition.endDate), 'dd MMM yyyy', { locale: pl })}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {competition.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {competition._count?.registrations || 0} rejestracji
                      </div>
                    </div>

                    {competition.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {competition.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/competitions/${competition.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Podgląd
                      </Link>
                    </Button>
                    <Button
                      onClick={() => onSelectCompetition(competition)}
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Zarządzaj
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}