'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart3,
    Calendar,
    Eye,
    Users
} from 'lucide-react';
import { useState } from 'react';
import HeatManager from './HeatManager';
import MinuteProgramManager from './MinuteProgramManager';
import MinuteProgramView from './MinuteProgramView';

interface Competition {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface OrganizationDashboardProps {
  competitionId: string;
}

export default function OrganizationDashboard({ competitionId }: OrganizationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Pobierz informacje o zawodach
  const { data: competition } = useQuery({
    queryKey: ['competition', competitionId],
    queryFn: async () => {
      const response = await fetch(`/api/competitions/${competitionId}`);
      if (!response.ok) throw new Error('Failed to fetch competition');
      return response.json() as Promise<Competition>;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organizacja zawodów"
        description={competition ? `${competition.name} • ${competition.location}` : undefined}
        backButtonFallback={`/competitions/${competitionId}`}
      >
        <Badge variant={competition?.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {competition?.status === 'ACTIVE' ? 'Aktywne' : 'Planowane'}
        </Badge>
      </PageHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Przegląd
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Program minutowy
          </TabsTrigger>
          <TabsTrigger value="heats" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Rozstawienie
          </TabsTrigger>
          <TabsTrigger value="program" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Podgląd programu
          </TabsTrigger>
        </TabsList>

        {/* Przegląd */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Przegląd organizacji
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Sekcja przeglądu jest w trakcie przygotowania. 
                Użyj pozostałych zakładek do zarządzania zawodami.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Program minutowy */}
        <TabsContent value="schedule">
          <MinuteProgramManager competitionId={competitionId} />
        </TabsContent>

        {/* Rozstawienie */}
        <TabsContent value="heats">
          <HeatManager competitionId={competitionId} />
        </TabsContent>

        {/* Podgląd programu */}
        <TabsContent value="program">
          <MinuteProgramView competitionId={competitionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}