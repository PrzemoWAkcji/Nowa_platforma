"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface UpdateRecordsFromCsvModalProps {
  competitionId: string;
}

export function UpdateRecordsFromCsvModal({
  competitionId,
}: UpdateRecordsFromCsvModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { showSuccess, showError } = useToast();

  const openModal = () => {
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    setIsOpen(false);
    dialogRef.current?.close();
    setCsvData("");
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(selectedFile, "UTF-8");
    }
  };

  const handleSubmit = async () => {
    if (!csvData.trim()) {
      showError("Proszę wczytać plik CSV lub wprowadzić dane");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/registrations/update-records-from-csv/${competitionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ csvData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd");
      }

      const result = await response.json();
      showSuccess(result.message);

      // Pokaż szczegóły jeśli są błędy lub nie znaleziono zawodników
      if (result.details) {
        let detailsMessage = "";

        if (result.details.notFound?.length > 0) {
          const notFoundList = result.details.notFound.slice(0, 3).join(", ");
          detailsMessage += `Nie znaleziono zawodników: ${notFoundList}`;
          if (result.details.notFound.length > 3) {
            detailsMessage += ` i ${result.details.notFound.length - 3} innych`;
          }
        }

        if (result.details.errors?.length > 0) {
          if (detailsMessage) detailsMessage += ". ";
          const errorsList = result.details.errors.slice(0, 3).join(", ");
          detailsMessage += `Błędy: ${errorsList}`;
          if (result.details.errors.length > 3) {
            detailsMessage += ` i ${result.details.errors.length - 3} innych`;
          }
        }

        if (detailsMessage) {
          showError(`Szczegóły aktualizacji: ${detailsMessage}`);
        }
      }

      closeModal();
    } catch (error: any) {
      showError(error.message || "Wystąpił błąd podczas aktualizacji rekordów");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="text-blue-600" onClick={openModal}>
        <Upload className="h-4 w-4 mr-2" />
        Aktualizuj rekordy z CSV
      </Button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/50 bg-white rounded-lg shadow-xl border-0 p-0 max-w-2xl w-full"
        onClose={closeModal}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">
                Aktualizacja rekordów PB i SB z pliku CSV
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Wczytaj plik CSV z rekordami zawodników, aby zaktualizować ich
            Personal Best (PB) i Season Best (SB).
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Wybierz plik CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1"
              />
              {file && (
                <p className="text-sm text-gray-500 mt-1">
                  Wybrany plik: {file.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="csv-data">
                Lub wklej dane CSV (oddzielone średnikami)
              </Label>
              <Textarea
                id="csv-data"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;...&#10;33;2;K100 m;100 metrów kobiet;..."
                rows={8}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Wymagane kolumny w pliku CSV:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>Nazwisko</strong> - nazwisko zawodnika
                </li>
                <li>
                  • <strong>Imię</strong> - imię zawodnika
                </li>
                <li>
                  • <strong>Pełna nazwa</strong> - nazwa konkurencji
                </li>
                <li>
                  • <strong>SB</strong> - Season Best (opcjonalne)
                </li>
                <li>
                  • <strong>PB</strong> - Personal Best (opcjonalne)
                </li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                Plik powinien używać średnika (;) jako separatora kolumn.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={closeModal} disabled={isLoading}>
              Anuluj
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !csvData.trim()}
            >
              {isLoading ? "Aktualizuję..." : "Aktualizuj rekordy"}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
