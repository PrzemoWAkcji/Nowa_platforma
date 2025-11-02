'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Users, Search, Calendar, Trophy, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { Athlete, UserRole } from '@/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {athlete.firstName} {athlete.lastName}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>Kategoria: {athlete.category}</span>
              <span>Płeć: {athlete.gender === 'MALE' ? 'M' : 'K'}</span>
            </div>
          </div>
          <Badge variant="outline">
            {athlete.club || 'Brak klubu'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            Data urodzenia: {format(new Date(athlete.dateOfBirth), 'dd.MM.yyyy', { locale: pl })}
          </div>
          {athlete.nationality && (
            <div>Narodowość: {athlete.nationality}</div>
          )}
          {athlete._count && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{athlete._count.registrations} rejestracji</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{athlete._count.results} wyników</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Link href={`/athletes/${athlete.id}`}>
            <Button variant="outline" size="sm">
              Zobacz profil
            </Button>
          </Link>
          <Link href={`/registrations/create?athleteId=${athlete.id}`}>
            <Button size="sm">
              Zgłoś na zawody
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyAthletesPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Pobierz zawodników trenera
  const { data: athletes, isLoading } = useQuery({
    queryKey: ['my-athletes', user?.id],
    queryFn: async () => {
      const { api } = await import('@/lib/api');
      const response = await api.get(`/athletes/coach/${user?.id}`);
      return response.data as Athlete[];
    },
    enabled: !!user?.id && user?.role === UserRole.COACH,
  });

  // Filtrowanie zawodników
  const filteredAthletes = athletes?.filter(athlete => {
    const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           athlete.club?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (user?.role !== UserRole.COACH) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Brak dostępu
          </h3>
          <p className="text-gray-600">
            Ta strona jest dostępna tylko dla trenerów.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Moi zawodnicy" 
          description="Zarządzaj swoimi zawodnikami i ich rejestracje"
        >
          <Link href="/athletes/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj zawodnika
            </Button>
          </Link>
        </PageHeader>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Szukaj zawodników..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Zawodników</p>
                  <p className="text-2xl font-bold text-gray-900">{athletes?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejestracji</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {athletes?.reduce((sum, athlete) => sum + (athlete._count?.registrations || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wyników</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {athletes?.reduce((sum, athlete) => sum + (athlete._count?.results || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Athletes Grid */}
        {!isLoading && (
          <>
            {filteredAthletes.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {athletes?.length === 0 ? 'Brak zawodników' : 'Brak wyników wyszukiwania'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {athletes?.length === 0 
                    ? 'Nie masz jeszcze żadnych zawodników. Dodaj pierwszego zawodnika.' 
                    : 'Spróbuj zmienić kryteria wyszukiwania.'}
                </p>
                {athletes?.length === 0 && (
                  <Link href="/athletes/create">
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Dodaj pierwszego zawodnika
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAthletes.map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}