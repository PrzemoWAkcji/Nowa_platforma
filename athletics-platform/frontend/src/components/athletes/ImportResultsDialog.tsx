'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface ImportResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: ImportResult | null;
}

export function ImportResultsDialog({ isOpen, onClose, result }: ImportResultsDialogProps) {
  if (!result) return null;

  const hasErrors = result.errors.length > 0;
  const totalProcessed = result.imported + result.updated + result.skipped;

  const downloadErrorReport = () => {
    if (result.errors.length === 0) return;

    const errorReport = [
      'Raport błędów importu CSV',
      '========================',
      `Data: ${new Date().toLocaleString('pl-PL')}`,
      `Łącznie przetworzono: ${totalProcessed} rekordów`,
      `Błędów: ${result.errors.length}`,
      '',
      'Szczegóły błędów:',
      ...result.errors.map((error, index) => `${index + 1}. ${error}`)
    ].join('\n');

    const blob = new Blob([errorReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import-errors-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {hasErrors ? (
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            )}
            Wyniki importu CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {result.imported}
              </div>
              <div className="text-sm text-green-600">Zaimportowano</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {result.updated}
              </div>
              <div className="text-sm text-blue-600">Zaktualizowano</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg border">
              <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-700">
                {result.skipped}
              </div>
              <div className="text-sm text-gray-600">Pominięto</div>
            </div>
          </div>

          {/* Summary Text */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">
                Import zakończony {hasErrors ? 'z błędami' : 'pomyślnie'}!
              </div>
              <div className="text-sm">
                Przetworzono łącznie <strong>{totalProcessed}</strong> rekordów.
                {result.imported > 0 && ` Dodano ${result.imported} nowych zawodników.`}
                {result.updated > 0 && ` Zaktualizowano ${result.updated} zawodników.`}
                {result.skipped > 0 && ` Pominięto ${result.skipped} rekordów.`}
              </div>
            </AlertDescription>
          </Alert>

          {/* Errors Section */}
          {hasErrors && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-red-700">
                  Błędy ({result.errors.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadErrorReport}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Pobierz raport
                </Button>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {result.errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="text-red-700">
                          {error}
                        </li>
                      ))}
                      {result.errors.length > 10 && (
                        <li className="text-red-600 font-medium">
                          ... i {result.errors.length - 10} więcej błędów
                        </li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Success Tips */}
          {!hasErrors && (result.imported > 0 || result.updated > 0) && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Co dalej?</div>
                <ul className="text-sm space-y-1">
                  <li>• Sprawdź listę zawodników w zakładce &quot;Lista zawodników&quot;</li>
                  <li>• Możesz teraz rejestrować zawodników na zawody</li>
                  <li>• Dane zawodników można edytować w ich profilach</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
            {(result.imported > 0 || result.updated > 0) && (
              <Button onClick={() => {
                onClose();
                window.location.reload(); // Odśwież stronę, żeby pokazać nowych zawodników
              }}>
                Zobacz zawodników
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}