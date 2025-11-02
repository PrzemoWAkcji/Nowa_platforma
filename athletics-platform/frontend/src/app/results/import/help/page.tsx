'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImportHelpPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pomoc - Import z Finishlynx</h1>
            <p className="text-gray-600">Przewodnik po importowaniu wyników z systemu photofinish</p>
          </div>
        </div>

        {/* Podstawowe informacje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" />
              Podstawowe informacje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                System automatycznie rozpoznaje konkurencje na podstawie nazw z plików Finishlynx 
                i mapuje je do konkurencji utworzonych w zawodach.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Pliki .lif</h4>
                <p className="text-sm text-green-700">
                  Każdy bieg = osobny plik. Zawiera szczegółowe wyniki z czasami, 
                  reakcjami i informacjami o wietrze.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Pliki .evt</h4>
                <p className="text-sm text-blue-700">
                  Wyniki całych zawodów. Zawiera listę zawodników i ich pozycje 
                  w poszczególnych konkurencjach.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Pliki .sch</h4>
                <p className="text-sm text-purple-700">
                  Harmonogram zawodów. Zawiera informacje o kolejności 
                  konkurencji i serii.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mapowanie konkurencji */}
        <Card>
          <CardHeader>
            <CardTitle>Automatyczne mapowanie konkurencji</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              System rozpoznaje konkurencje na podstawie następujących elementów w nazwie:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Dystanse biegowe</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sprint:</span>
                    <span className="text-gray-600">25m, 30m, 40m, 50m, 55m, 60m, 75m, 80m, 100m, 120m, 150m, 200m, 250m, 300m, 350m, 400m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wytrzymałość:</span>
                    <span className="text-gray-600">500m, 600m, 800m, 1000m, 1200m, 1500m, 1600m, 2000m, 3000m, 3200m, 5000m, 10000m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Specjalne:</span>
                    <span className="text-gray-600">1 Mila, 2 Mile</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Dyscypliny techniczne</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Płotki:</span>
                    <span className="text-gray-600">40m pł, 50m pł, 60m pł, 80m pł, 100m pł, 110m pł, 200m pł, 300m pł, 400m pł</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Przeszkody:</span>
                    <span className="text-gray-600">600m prz, 800m prz, 1000m prz, 1500m prz, 2000m prz, 3000m prz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skoki:</span>
                    <span className="text-gray-600">Skok wzwyż, Skok o tyczce, Skok w dal, Trójskok</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rzuty:</span>
                    <span className="text-gray-600">Pchnięcie kulą, Rzut dyskiem, Rzut młotem, Rzut oszczepem</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-medium mb-3">Kategorie wiekowe</h4>
                <div className="flex flex-wrap gap-2">
                  {['U14', 'U16', 'U18', 'U20', 'U23', 'Senior', 'Master', 'Żak', 'Młodzik', 'Junior'].map(cat => (
                    <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">{cat}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Płeć i oznaczenia specjalne</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Płeć:</span>
                    <span className="text-gray-600">K (kobiety), M (mężczyźni)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Specjalne:</span>
                    <span className="text-gray-600">sh (short track), OT (oversized track), KM (mixed team)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Przykłady mapowania */}
        <Card>
          <CardHeader>
            <CardTitle>Przykłady mapowania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✅ Poprawne mapowanie</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono">100m M U18</span>
                      <span>→ 100m Mężczyźni U18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">400m pł K Senior</span>
                      <span>→ 400m płotki Kobiety Senior</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">Skok wzwyż M U20</span>
                      <span>→ Skok wzwyż Mężczyźni U20</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">4x100m K U16</span>
                      <span>→ 4x100m Kobiety U16</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">❌ Problematyczne nazwy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono">Bieg 1</span>
                      <span>→ Brak informacji o dystansie</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">Sprint</span>
                      <span>→ Zbyt ogólna nazwa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">Konkurencja A</span>
                      <span>→ Brak szczegółów</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rozwiązywanie problemów */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Rozwiązywanie problemów
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Jeśli system nie może automatycznie zmapować konkurencji, sprawdź poniższe punkty:
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-blue-900">1. Sprawdź nazwy konkurencji</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Upewnij się, że nazwy konkurencji w zawodach zawierają kluczowe słowa 
                  (dystans, dyscyplina, kategoria, płeć).
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-green-900">2. Użyj funkcji podglądu</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Przed importem użyj funkcji &quot;Podgląd pliku&quot; aby zobaczyć sugerowane mapowania 
                  i sprawdzić czy zawodnicy zostali znalezieni w bazie.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-purple-900">3. Sprawdź rejestracje</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Zawodnicy muszą być zarejestrowani w odpowiednich konkurencjach przed importem wyników.
                  System sprawdza numery licencji z pliku Finishlynx.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium text-red-900">4. Ręczne mapowanie</h4>
                <p className="text-sm text-gray-600 mt-1">
                  W przypadku problemów z automatycznym mapowaniem, możesz użyć funkcji 
                  ręcznego mapowania konkurencji w podglądzie pliku.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Najczęstsze błędy */}
        <Card>
          <CardHeader>
            <CardTitle>Najczęstsze błędy i ich rozwiązania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">
                  &quot;Nie znaleziono zawodnika z numerem licencji: XXXXX&quot;
                </h4>
                <p className="text-sm text-yellow-800">
                  <strong>Rozwiązanie:</strong> Sprawdź czy zawodnik został dodany do bazy danych 
                  z poprawnym numerem licencji. Numery licencji muszą się dokładnie zgadzać.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">
                  &quot;Nie znaleziono konkurencji dla: Nazwa konkurencji&quot;
                </h4>
                <p className="text-sm text-red-800">
                  <strong>Rozwiązanie:</strong> Utwórz konkurencję w zawodach z nazwą zawierającą 
                  kluczowe słowa lub użyj funkcji ręcznego mapowania.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">
                  &quot;Nie znaleziono rejestracji dla zawodnika X w konkurencji Y&quot;
                </h4>
                <p className="text-sm text-orange-800">
                  <strong>Rozwiązanie:</strong> Zarejestruj zawodnika w odpowiedniej konkurencji 
                  przed importem wyników.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}