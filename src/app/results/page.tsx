'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useResults } from '@/hooks/useResults';
import { Result } from '@/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

function ResultCard({ result }: { result: Result }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {result.athlete?.firstName} {result.athlete?.lastName}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {result.event?.name} • {result.event?.competition?.name}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {result.position && (
                <Badge variant="outline">
                  Miejsce: {result.position}
                </Badge>
              )}
              {result.isPersonalBest && (
                <Badge className="bg-blue-100 text-blue-800">PB</Badge>
              )}
              {result.isSeasonBest && (
                <Badge className="bg-green-100 text-green-800">SB</Badge>
              )}
              {result.isNationalRecord && (
                <Badge className="bg-yellow-100 text-yellow-800">NR</Badge>
              )}
              {result.isWorldRecord && (
                <Badge className="bg-red-100 text-red-800">WR</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {result.result}
            </div>
            {result.points && (
              <div className="text-sm text-gray-600">
                {result.points} pkt
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Zawody:</span>
            <span>{result.event?.competition?.location}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Data:</span>
            <span>{format(new Date(result.createdAt), 'dd MMM yyyy', { locale: pl })}</span>
          </div>
          {result.wind && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Wiatr:</span>
              <span>{result.wind} m/s</span>
            </div>
          )}
          {result.reaction && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Reakcja:</span>
              <span>{result.reaction} s</span>
            </div>
          )}
          {result.athlete?.club && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Klub:</span>
              <span>{result.athlete.club}</span>
            </div>
          )}
          
          {/* Status indicators */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            {result.isDNF && (
              <Badge variant="outline" className="text-red-600">DNF</Badge>
            )}
            {result.isDNS && (
              <Badge variant="outline" className="text-red-600">DNS</Badge>
            )}
            {result.isDQ && (
              <Badge variant="outline" className="text-red-600">DQ</Badge>
            )}
            {!result.isValid && (
              <Badge variant="outline" className="text-orange-600">Nieważny</Badge>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Link href={`/results/${result.id}`}>
            <Button variant="outline" size="sm">
              Zobacz szczegóły
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: results, isLoading, error } = useResults();

  const filteredResults = results?.filter(result => {
    const matchesSearch = searchTerm === '' || 
      `${result.athlete?.firstName} ${result.athlete?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.event?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.event?.competition?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.athlete?.club?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie wyników...</p>
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
            <p className="text-red-600">Błąd podczas ładowania wyników</p>
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
          title="Wyniki" 
          description="Przeglądaj wyniki zawodów lekkoatletycznych"
        >
          <Link href="/results/minute-program">
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Program minutowy
            </Button>
          </Link>
          <Link href="/results/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj wynik
            </Button>
          </Link>
        </PageHeader>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Szukaj wyników..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {results?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Wszystkich wyników</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {results?.filter(r => r.isPersonalBest).length || 0}
              </div>
              <p className="text-sm text-gray-600">Rekordów życiowych</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {results?.filter(r => r.isSeasonBest).length || 0}
              </div>
              <p className="text-sm text-gray-600">Rekordów sezonu</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {results?.filter(r => r.isNationalRecord).length || 0}
              </div>
              <p className="text-sm text-gray-600">Rekordów kraju</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {results?.filter(r => r.isWorldRecord).length || 0}
              </div>
              <p className="text-sm text-gray-600">Rekordów świata</p>
            </CardContent>
          </Card>
        </div>

        {/* Results Grid */}
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Brak wyników' : 'Brak wyników'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Spróbuj zmienić kryteria wyszukiwania.'
                  : 'Nie ma jeszcze żadnych wyników. Dodaj pierwszy wynik.'
                }
              </p>
              {!searchTerm && (
                <Link href="/results/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj wynik
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}