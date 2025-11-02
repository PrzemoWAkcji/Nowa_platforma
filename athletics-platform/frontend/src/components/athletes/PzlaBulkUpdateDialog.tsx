"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface BulkUpdateResult {
  processed: number;
  updated: number;
  errors: string[];
}

interface PzlaBulkUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PzlaBulkUpdateDialog({
  isOpen,
  onClose,
}: PzlaBulkUpdateDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<BulkUpdateResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { showSuccess, showError } = useToast();

  const handleClose = () => {
    if (!isUpdating) {
      setResult(null);
      setProgress(0);
      onClose();
    }
  };

  const handleBulkUpdate = async () => {
    setIsUpdating(true);
    setResult(null);
    setProgress(0);

    try {
      // Symulacja postępu - w rzeczywistości można by dodać endpoint do śledzenia postępu
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await api.post("/athletes/update-all-from-pzla");

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data);

      if (response.data.updated > 0) {
        showSuccess(
          `Zaktualizowano ${response.data.updated} z ${response.data.processed} zawodników`
        );
      } else {
        showError("Nie znaleziono nowych danych do aktualizacji");
      }
    } catch (error) {
      console.error("Error bulk updating from PZLA:", error);
      setProgress(0);
      showError("Wystąpił błąd podczas masowej aktualizacji z PZLA");
    } finally {
      setIsUpdating(false);
    }
  };

  const getSuccessRate = () => {
    if (!result || result.processed === 0) return 0;
    return Math.round((result.updated / result.processed) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Masowa aktualizacja z PZLA</DialogTitle>
          <DialogDescription>
            Automatycznie pobierz i zaktualizuj rekordy wszystkich zawodników,
            którzy nie mają jeszcze rekordów w systemie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Uwaga</p>
                  <p className="text-orange-700 mt-1">
                    Ta operacja może potrwać kilka minut. System będzie
                    wyszukiwał zawodników na stronie PZLA po numerze licencji
                    lub imieniu i nazwisku. Między requestami jest opóźnienie,
                    aby nie przeciążyć serwera PZLA.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {isUpdating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Postęp aktualizacji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={progress} className="w-full" />
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">
                      Aktualizowanie rekordów... {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !isUpdating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wyniki aktualizacji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.processed}
                      </div>
                      <div className="text-sm text-blue-800">
                        Przetworzonych
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.updated}
                      </div>
                      <div className="text-sm text-green-800">
                        Zaktualizowanych
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {result.errors.length}
                      </div>
                      <div className="text-sm text-red-800">Błędów</div>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div className="flex items-center justify-center space-x-2">
                    {getSuccessRate() > 50 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      Skuteczność: {getSuccessRate()}%
                    </span>
                  </div>

                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">
                        Błędy ({result.errors.length}):
                      </h4>
                      <div className="max-h-32 overflow-y-auto bg-red-50 rounded p-3">
                        <div className="space-y-1">
                          {result.errors.slice(0, 10).map((error, index) => (
                            <div key={index} className="text-sm text-red-700">
                              • {error}
                            </div>
                          ))}
                          {result.errors.length > 10 && (
                            <div className="text-sm text-red-600 font-medium">
                              i {result.errors.length - 10} więcej...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          {!result && !isUpdating && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Kliknij poniżej, aby rozpocząć masową aktualizację rekordów
                    wszystkich zawodników bez danych z PZLA.
                  </p>
                  <Button
                    onClick={handleBulkUpdate}
                    disabled={isUpdating}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Rozpocznij aktualizację
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            {isUpdating ? "Anuluj" : "Zamknij"}
          </Button>
          {result?.updated && result.updated > 0 && (
            <Button onClick={() => window.location.reload()}>
              Odśwież stronę
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
