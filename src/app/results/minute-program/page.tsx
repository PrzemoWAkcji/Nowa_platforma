'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import MinuteProgramView from '@/components/organization/MinuteProgramView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Calendar,
    Download,
    Pause,
    Play,
    Printer,
    Share2,
    Trophy
} from 'lucide-react';
import { useState } from 'react';
// import { pl } from 'date-fns/locale'; // Obecnie nieużywane
import { toast } from 'sonner';

interface Competition {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ResultsMinuteProgramPage() {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Pobierz listę zawodów
  const { data: competitions } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const response = await fetch('/api/competitions');
      if (!response.ok) throw new Error('Failed to fetch competitions');
      return response.json() as Promise<Competition[]>;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Program minutowy',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link skopiowany do schowka');
    }
  };

  const handleExport = () => {
    // TODO: Implementacja eksportu do PDF
    toast.info('Funkcja eksportu będzie dostępna wkrótce');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 print:space-y-4">
        <PageHeader 
          title="Program minutowy - Wyniki online" 
          description="Aktualny program minutowy zawodów z informacjami o statusie"
          className="print:hidden"
        >
          {selectedCompetitionId && (
            <>
              <Button 
                variant={autoRefresh ? "default" : "outline"} 
                size="sm" 
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {autoRefresh ? 'Zatrzymaj odświeżanie' : 'Włącz odświeżanie'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Drukuj
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Udostępnij
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Eksportuj PDF
              </Button>
            </>
          )}
        </PageHeader>

        {/* Selektor zawodów */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Wybierz zawody
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Select value={selectedCompetitionId} onValueChange={setSelectedCompetitionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz zawody..." />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions?.map((competition) => (
                      <SelectItem key={competition.id} value={competition.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{competition.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {format(new Date(competition.startDate), 'dd.MM.yyyy')}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {autoRefresh && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Na żywo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Komunikaty o błędach */}
        {!selectedCompetitionId && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Wybierz zawody
              </h3>
              <p className="text-gray-600 mb-4">
                Aby wyświetlić program minutowy, wybierz zawody z listy powyżej.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Wskazówka:</p>
                <p>
                  Program minutowy jest automatycznie aktualizowany co 30 sekund, 
                  aby pokazać aktualny status konkurencji.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Program minutowy */}
        {selectedCompetitionId && (
          <MinuteProgramView competitionId={selectedCompetitionId} />
        )}
      </div>
    </DashboardLayout>
  );
}