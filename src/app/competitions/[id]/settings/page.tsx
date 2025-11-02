'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompetitionLogoManager } from '@/components/competitions/CompetitionLogoManager';
import { useCompetition } from '@/hooks/useCompetitions';

export default function CompetitionSettingsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  
  const { data: competition, isLoading, error } = useCompetition(competitionId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie ustawień...</p>
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
            <p className="text-red-600">Błąd podczas ładowania ustawień zawodów</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title={`Ustawienia: ${competition.name}`}
          showBackButton={true}
          backButtonFallback={`/competitions/${competitionId}`}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Zarządzanie Logo</CardTitle>
              <p className="text-sm text-gray-600">
                Dodaj do 5 logo, które będą wyświetlane w programie minutowym, wynikach i listach startowych.
                Zalecane wymiary: kwadratowe lub prostokątne, maksymalnie 5MB na plik.
              </p>
            </CardHeader>
            <CardContent>
              <CompetitionLogoManager competitionId={competitionId} />
            </CardContent>
          </Card>

          {/* Other Settings - placeholder for future features */}
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia ogólne</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Dodatkowe ustawienia zawodów będą dostępne wkrótce.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ustawienia rejestracji</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Zarządzanie ustawieniami rejestracji będzie dostępne wkrótce.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}