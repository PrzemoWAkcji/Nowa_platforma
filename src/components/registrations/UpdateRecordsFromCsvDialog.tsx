"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateRecordsFromCsv } from "@/hooks/useRegistrations";
import { useToast } from "@/hooks/useToast";
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react";
import { useState } from "react";

interface UpdateRecordsFromCsvDialogProps {
  competitionId: string;
  trigger?: React.ReactNode;
}

export function UpdateRecordsFromCsvDialog({
  competitionId,
  trigger,
}: UpdateRecordsFromCsvDialogProps) {
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const updateRecordsMutation = useUpdateRecordsFromCsv();
  const { showSuccess, showError } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(selectedFile, "UTF-8");
    }
  };

  const handleSubmit = async () => {
    if (!csvData.trim()) {
      showError("Proszę wczytać plik CSV lub wkleić dane");
      return;
    }

    try {
      const result = await updateRecordsMutation.mutateAsync({
        competitionId,
        csvData,
      });

      showSuccess(result.message);

      // Pokaż szczegóły jeśli są błędy lub nie znaleziono zawodników
      if (
        result.details.errors.length > 0 ||
        result.details.notFound.length > 0
      ) {
        let detailsMessage = "";

        if (result.details.notFound.length > 0) {
          detailsMessage += `Nie znaleziono zawodników: ${result.details.notFound.slice(0, 5).join(", ")}`;
          if (result.details.notFound.length > 5) {
            detailsMessage += ` i ${result.details.notFound.length - 5} innych`;
          }
          detailsMessage += "\n";
        }

        if (result.details.errors.length > 0) {
          detailsMessage += `Błędy: ${result.details.errors.slice(0, 3).join(", ")}`;
          if (result.details.errors.length > 3) {
            detailsMessage += ` i ${result.details.errors.length - 3} innych`;
          }
        }

        if (detailsMessage) {
          showError(`Szczegóły aktualizacji: ${detailsMessage}`);
        }
      }

      setOpen(false);
      setCsvData("");
      setFile(null);
    } catch (error: any) {
      showError(
        error.response?.data?.message ||
          "Wystąpił błąd podczas aktualizacji rekordów"
      );
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="text-blue-600">
      <Upload className="h-4 w-4 mr-2" />
      Aktualizuj rekordy z CSV
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Aktualizacja rekordów PB i SB z pliku CSV
          </DialogTitle>
          <DialogDescription>
            Wczytaj plik CSV z rekordami zawodników, aby zaktualizować ich
            Personal Best (PB) i Season Best (SB).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instrukcje */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Format pliku CSV:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Separator: średnik (;)</li>
              <li>
                • Wymagane kolumny: Nazwisko, Imię, Pełna nazwa (konkurencja)
              </li>
              <li>
                • Opcjonalne kolumny: SB (Season Best), PB (Personal Best)
              </li>
              <li>• Kodowanie: UTF-8</li>
            </ul>
          </div>

          {/* Upload pliku */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Wybierz plik CSV</Label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Wczytano: {file.name}
              </p>
            )}
          </div>

          {/* Lub wklej dane */}
          <div className="space-y-2">
            <Label htmlFor="csv-data">Lub wklej dane CSV</Label>
            <Textarea
              id="csv-data"
              placeholder="Wklej tutaj zawartość pliku CSV..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* Ostrzeżenie */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Uwaga:</p>
                <p>
                  Ta operacja zastąpi istniejące rekordy PB i SB nowymi
                  wartościami z pliku CSV. Jeśli zawodnik nie zostanie
                  znaleziony, zostanie pominięty.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={updateRecordsMutation.isPending}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateRecordsMutation.isPending || !csvData.trim()}
          >
            {updateRecordsMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Aktualizuję...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Aktualizuj rekordy
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
