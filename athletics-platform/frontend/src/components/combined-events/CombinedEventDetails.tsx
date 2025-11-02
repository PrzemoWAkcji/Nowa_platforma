'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CombinedEvent } from '@/hooks/useCombinedEvents';
import { Calendar, CheckCircle, Edit, Target, Trophy, User, Wind, XCircle } from 'lucide-react';
import { useState } from 'react';
import { EditResultDialog } from './EditResultDialog';

interface CombinedEventDetailsProps {
  combinedEvent: CombinedEvent;
  onResultUpdate?: (discipline: string, result: { performance: string; wind?: string }) => void;
  canEdit?: boolean;
}

const EVENT_TYPE_LABELS = {
  DECATHLON: '10-bój (Dziesięciobój)',
  HEPTATHLON: '7-bój (Siedmiobój)',
  PENTATHLON: '5-bój (Pięciobój)',
  PENTATHLON_U16_MALE: '5-bój U16 chłopcy',
  PENTATHLON_U16_FEMALE: '5-bój U16 dziewczęta'
};

const DISCIPLINE_LABELS: Record<string, string> = {
  '100M': '100m',
  '110MH': '110m przez płotki',
  '100MH': '100m przez płotki',
  '80MH': '80m przez płotki',
  '200M': '200m',
  '400M': '400m',
  '600M': '600m',
  '800M': '800m',
  '1000M': '1000m',
  '1500M': '1500m',
  '60M': '60m',
  '60MH': '60m przez płotki',
  'HJ': 'Skok wzwyż',
  'LJ': 'Skok w dal',
  'PV': 'Skok o tyczce',
  'SP': 'Pchnięcie kulą',
  'SP3': 'Pchnięcie kulą 3kg',
  'SP5': 'Pchnięcie kulą 5kg',
  'DT': 'Rzut dyskiem',
  'JT': 'Rzut oszczepem'
};

export function CombinedEventDetails({ 
  combinedEvent, 
  onResultUpdate, 
  canEdit = false 
}: CombinedEventDetailsProps) {
  const [editingDiscipline, setEditingDiscipline] = useState<string | null>(null);

  const completedDisciplines = combinedEvent.results.filter(r => r.isValid).length;
  const totalDisciplines = combinedEvent.results.length;
  const progressPercentage = (completedDisciplines / totalDisciplines) * 100;

  const getPointsColor = (points: number) => {
    if (points >= 1000) return 'text-green-600 font-bold';
    if (points >= 800) return 'text-blue-600 font-semibold';
    if (points >= 600) return 'text-orange-600';
    return 'text-gray-600';
  };

  const formatPerformance = (performance: string | null, discipline: string) => {
    if (!performance) return '-';
    
    // Sprawdź czy to czas czy odległość/wysokość
    if (discipline.includes('M') && !['HJ', 'LJ', 'PV', 'SP', 'DT', 'JT'].includes(discipline)) {
      // To jest bieg - formatuj czas
      if (performance.includes(':')) {
        return performance; // Już sformatowany
      } else {
        const seconds = parseFloat(performance);
        if (seconds >= 60) {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = (seconds % 60).toFixed(2);
          return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
        }
        return `${seconds}s`;
      }
    } else {
      // To jest skok lub rzut
      return `${performance}m`;
    }
  };

  const handleEditResult = (discipline: string) => {
    setEditingDiscipline(discipline);
  };

  const handleResultSave = (discipline: string, result: { performance: string; wind?: string }) => {
    setEditingDiscipline(null);
    if (onResultUpdate) {
      onResultUpdate(discipline, result);
    }
  };

  // Sortuj wyniki według kolejności dnia
  const sortedResults = [...combinedEvent.results].sort((a, b) => a.dayOrder - b.dayOrder);

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Trophy className="h-6 w-6" />
              {EVENT_TYPE_LABELS[combinedEvent.eventType]}
            </CardTitle>
            <Badge 
              variant={combinedEvent.isComplete ? "default" : "secondary"}
              className="text-sm"
            >
              {combinedEvent.isComplete ? 'Ukończony' : 'W trakcie'}
            </Badge>
          </div>
          
          {combinedEvent.athlete && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-5 w-5" />
              <span className="text-lg">
                {combinedEvent.athlete.firstName} {combinedEvent.athlete.lastName}
                {combinedEvent.athlete.club && (
                  <span className="text-gray-500"> • {combinedEvent.athlete.club}</span>
                )}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Statystyki */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">Łączne punkty</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {combinedEvent.totalPoints.toLocaleString()}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">Ukończone dyscypliny</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {completedDisciplines}/{totalDisciplines}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-600">Średnia punktów</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {completedDisciplines > 0 ? Math.round(combinedEvent.totalPoints / completedDisciplines) : 0}
              </div>
            </div>
          </div>

          {/* Pasek postępu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Postęp wieloboju:</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tabela wyników */}
      <Card>
        <CardHeader>
          <CardTitle>Wyniki dyscyplin</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Dyscyplina</TableHead>
                <TableHead>Wynik</TableHead>
                <TableHead>Wiatr</TableHead>
                <TableHead className="text-right">Punkty</TableHead>
                <TableHead className="w-20">Status</TableHead>
                {canEdit && <TableHead className="w-20">Akcje</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">
                    {result.dayOrder}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {DISCIPLINE_LABELS[result.discipline] || result.discipline}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.discipline}
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.performance ? (
                      <span className="font-mono">
                        {formatPerformance(result.performance, result.discipline)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {result.wind ? (
                      <div className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        <span className="font-mono text-sm">{result.wind}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={getPointsColor(result.points)}>
                      {result.points}
                    </span>
                  </TableCell>
                  <TableCell>
                    {result.isValid ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ważny
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Brak
                      </Badge>
                    )}
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditResult(result.discipline)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog edycji wyniku */}
      {editingDiscipline && (
        <EditResultDialog
          discipline={editingDiscipline}
          disciplineLabel={DISCIPLINE_LABELS[editingDiscipline] || editingDiscipline}
          currentResult={sortedResults.find(r => r.discipline === editingDiscipline)}
          gender={combinedEvent.gender}
          open={!!editingDiscipline}
          onClose={() => setEditingDiscipline(null)}
          onSave={handleResultSave}
        />
      )}
    </div>
  );
}