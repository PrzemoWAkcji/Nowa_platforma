'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CombinedEventDetails } from '@/components/combined-events/CombinedEventDetails';
import { useCombinedEvent } from '@/hooks/useCombinedEvents';
import { ArrowLeft, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function CombinedEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { combinedEvent, loading, error, updateResult, reload, setError } = useCombinedEvent(id);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleResultUpdate = async (discipline: string, resultData: Record<string, unknown>) => {
    try {
      await updateResult(discipline, resultData as any);
      // Opcjonalnie: pokaż powiadomienie o sukcesie
    } catch (err) {
      
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Tu będzie logika usuwania wieloboju
      // await deleteCombinedEvent(id);
      router.push('/combined-events');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Nawigacja */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do listy
        </Button>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
          
          {!combinedEvent.isComplete && (
            <Button asChild>
              <Link href={`/combined-events/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edytuj wyniki
              </Link>
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy na pewno chcesz usunąć ten wielobój?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta akcja jest nieodwracalna. Wszystkie wyniki i dane wieloboju zostaną trwale usunięte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Usuwanie...' : 'Usuń wielobój'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Szczegóły wieloboju */}
      <CombinedEventDetails
        combinedEvent={combinedEvent}
        onResultUpdate={handleResultUpdate}
        canEdit={!combinedEvent.isComplete}
      />

      {/* Informacje dodatkowe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Historia aktualizacji */}
        <Card>
          <CardHeader>
            <CardTitle>Informacje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Utworzony:</span>
              <span>{new Date(combinedEvent.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ostatnia aktualizacja:</span>
              <span>{new Date(combinedEvent.updatedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID wieloboju:</span>
              <span className="font-mono text-sm">{combinedEvent.id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Najlepsze dyscypliny */}
        <Card>
          <CardHeader>
            <CardTitle>Najlepsze dyscypliny</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {combinedEvent.results
                .filter(r => r.isValid)
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((result, index) => (
                  <div key={result.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span>{result.discipline}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{result.points} pkt</div>
                      {result.performance && (
                        <div className="text-sm text-gray-600">{result.performance}</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Akcje szybkie */}
      <Card>
        <CardHeader>
          <CardTitle>Akcje szybkie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/combined-events/competition/${combinedEvent.competitionId}/ranking`}>
                Zobacz ranking
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href={`/athletes/${combinedEvent.athleteId}`}>
                Profil zawodnika
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href={`/competitions/${combinedEvent.competitionId}`}>
                Szczegóły zawodów
              </Link>
            </Button>
            
            {combinedEvent.isComplete && (
              <Button variant="outline">
                Eksportuj wyniki
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}