'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EditResultDialog } from '@/components/combined-events/EditResultDialog';
import { useCombinedEvent } from '@/hooks/useCombinedEvents';
import { ArrowLeft, Edit, Save, CheckCircle, XCircle, Target, AlertCircle } from 'lucide-react';

const DISCIPLINE_LABELS: Record<string, string> = {
  '100M': '100m',
  '110MH': '110m przez płotki',
  '100MH': '100m przez płotki',
  '80MH': '80m przez płotki',
  '200M': '200m',
  '400M': '400m',
  '800M': '800m',
  '1500M': '1500m',
  '60M': '60m',
  '60MH': '60m przez płotki',
  'HJ': 'Skok wzwyż',
  'LJ': 'Skok w dal',
  'PV': 'Skok o tyczce',
  'SP': 'Pchnięcie kulą',
  'DT': 'Rzut dyskiem',
  'JT': 'Rzut oszczepem'
};

export default function EditCombinedEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { combinedEvent, loading, error, updateResult, reload } = useCombinedEvent(id);
  const [editingDiscipline, setEditingDiscipline] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Ostrzeżenie przed opuszczeniem strony z niezapisanymi zmianami
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleResultUpdate = async (discipline: string, resultData: Record<string, unknown>) => {
    try {
      await updateResult(discipline, resultData as any);
      setEditingDiscipline(null);
      setHasUnsavedChanges(false);
      // Opcjonalnie: pokaż powiadomienie o sukcesie
    } catch (err) {
      
    }
  };

  const handleEditClick = (discipline: string) => {
    setEditingDiscipline(discipline);
    setHasUnsavedChanges(true);
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

  const getPointsColor = (points: number) => {
    if (points >= 1000) return 'text-green-600 font-bold';
    if (points >= 800) return 'text-blue-600 font-semibold';
    if (points >= 600) return 'text-orange-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie wieloboju...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć
          </Button>
        </div>
      </div>
    );
  }

  if (!combinedEvent) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Wielobój nie został znaleziony</p>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (combinedEvent.isComplete) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ten wielobój jest już ukończony i nie może być edytowany.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do szczegółów
          </Button>
        </div>
      </div>
    );
  }

  const completedDisciplines = combinedEvent.results.filter(r => r.isValid).length;
  const totalDisciplines = combinedEvent.results.length;
  const progressPercentage = (completedDisciplines / totalDisciplines) * 100;

  // Sortuj wyniki według kolejności dnia
  const sortedResults = [...combinedEvent.results].sort((a, b) => a.dayOrder - b.dayOrder);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Nawigacja */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do szczegółów
        </Button>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={reload} disabled={loading}>
            Odśwież
          </Button>
          
          <Button onClick={() => router.push(`/combined-events/${id}`)}>
            <Save className="h-4 w-4 mr-2" />
            Zakończ edycję
          </Button>
        </div>
      </div>

      {/* Nagłówek */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Edit className="h-6 w-6" />
            Edycja wyników wieloboju
          </CardTitle>
          
          {combinedEvent.athlete && (
            <div className="text-gray-600">
              {combinedEvent.athlete.firstName} {combinedEvent.athlete.lastName}
              {combinedEvent.athlete.club && ` • ${combinedEvent.athlete.club}`}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Postęp */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Postęp wieloboju:</span>
              <span className="text-sm text-gray-600">
                {completedDisciplines}/{totalDisciplines} dyscyplin
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Łączne punkty */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Łączne punkty:</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {combinedEvent.totalPoints.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lista dyscyplin do edycji */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedResults.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {DISCIPLINE_LABELS[result.discipline] || result.discipline}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    Dyscyplina #{result.dayOrder}
                  </div>
                </div>
                <Badge variant={result.isValid ? "default" : "secondary"}>
                  {result.isValid ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {result.isValid ? 'Ważny' : 'Brak'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Aktualny wynik */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Wynik:</span>
                  <span className="font-mono">
                    {result.performance ? 
                      formatPerformance(result.performance, result.discipline) : 
                      'Brak wyniku'
                    }
                  </span>
                </div>
                
                {result.wind && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Wiatr:</span>
                    <span className="font-mono">{result.wind}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Punkty:</span>
                  <span className={getPointsColor(result.points)}>
                    {result.points}
                  </span>
                </div>
              </div>

              {/* Przycisk edycji */}
              <Button 
                onClick={() => handleEditClick(result.discipline)}
                className="w-full"
                variant={result.isValid ? "outline" : "default"}
              >
                <Edit className="h-4 w-4 mr-2" />
                {result.isValid ? 'Edytuj wynik' : 'Dodaj wynik'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instrukcje */}
      <Card>
        <CardHeader>
          <CardTitle>Instrukcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Kliknij na dyscyplinę, aby dodać lub edytować wynik</p>
            <p>• Wyniki są automatycznie przeliczane na punkty według tabel IAAF</p>
            <p>• Dla biegów wprowadź czas (np. 10.50 lub 4:15.30)</p>
            <p>• Dla skoków i rzutów wprowadź odległość/wysokość w metrach (np. 7.45)</p>
            <p>• Wiatr jest opcjonalny i dotyczy tylko niektórych dyscyplin</p>
            <p>• Wielobój zostanie automatycznie oznaczony jako ukończony po wprowadzeniu wszystkich wyników</p>
          </div>
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
          onClose={() => {
            setEditingDiscipline(null);
            setHasUnsavedChanges(false);
          }}
          onSave={handleResultUpdate}
        />
      )}
    </div>
  );
}