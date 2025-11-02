"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useImportAthletes } from "@/hooks/useAthletes";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { ImportResultsDialog } from "./ImportResultsDialog";

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export function AthleteImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"auto" | "pzla" | "international">(
    "auto"
  );
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportAthletes();

  const detectFormatFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split("\n")[0];

        // Sprawdź charakterystyczne kolumny dla każdego formatu
        const pzlaColumns = ["Nazwisko", "Imię", "DataUr", "NazwaPZLA", "Klub"];
        const internationalColumns = [
          "FirstName",
          "LastName",
          "DateOfBirth",
          "Gender",
          "ClubName",
        ];

        const hasPZLAColumns = pzlaColumns.some((col) =>
          firstLine.includes(col)
        );
        const hasInternationalColumns = internationalColumns.some((col) =>
          firstLine.includes(col)
        );

        if (hasPZLAColumns) {
          resolve("PZLA");
        } else if (hasInternationalColumns) {
          resolve("Międzynarodowy");
        } else {
          resolve("Nieznany");
        }
      };
      reader.readAsText(file, "utf-8");
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setImportResult(null);

      // Automatyczne wykrywanie formatu
      if (format === "auto") {
        const detected = await detectFormatFromFile(file);
        setDetectedFormat(detected);
      }
    } else {
      alert("Proszę wybrać plik CSV");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      // Jeśli format to 'auto', użyj 'pzla' jako domyślnego
      const finalFormat = format === "auto" ? "pzla" : format;

      const result = await importMutation.mutateAsync({
        file: selectedFile,
        format: finalFormat as "pzla" | "international",
        updateExisting,
      });
      setImportResult(result);
      setShowResultsDialog(true);
    } catch (error) {}
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImportResult(null);
    setShowResultsDialog(false);
    setDetectedFormat(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Import zawodników z CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Wybierz plik CSV</Label>
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              aria-describedby="file-upload-description"
              title="Wybierz plik CSV do importu zawodników"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
              aria-label="Wybierz plik CSV do importu zawodników"
            >
              <FileText className="h-4 w-4 mr-2" />
              Wybierz plik
            </Button>
            {selectedFile && (
              <span
                className="text-sm text-gray-600"
                id="file-upload-description"
              >
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </span>
            )}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <Label>Format pliku CSV</Label>
          <RadioGroup
            value={format}
            onValueChange={(value: string) =>
              setFormat(value as "auto" | "pzla" | "international")
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="cursor-pointer">
                Automatyczne wykrywanie
                <div className="text-xs text-gray-500 mt-1">
                  System automatycznie rozpozna format na podstawie nagłówków
                  {detectedFormat && (
                    <span className="text-blue-600 font-medium">
                      {" "}
                      • Wykryto: {detectedFormat}
                    </span>
                  )}
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pzla" id="pzla" />
              <Label htmlFor="pzla" className="cursor-pointer">
                Format PZLA (starter.csv)
                <div className="text-xs text-gray-500 mt-1">
                  Kolumny: Imię, Nazwisko, DataUr, Klub, NazwaPZLA, itp.
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="international" id="international" />
              <Label htmlFor="international" className="cursor-pointer">
                Format międzynarodowy (roster.csv)
                <div className="text-xs text-gray-500 mt-1">
                  Kolumny: FirstName, LastName, DateOfBirth, Gender, ClubName,
                  itp.
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Opcje importu</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="update-existing"
              checked={updateExisting}
              onCheckedChange={(checked) =>
                setUpdateExisting(checked as boolean)
              }
            />
            <Label htmlFor="update-existing" className="cursor-pointer">
              Aktualizuj istniejących zawodników
              <div className="text-xs text-gray-500 mt-1">
                Jeśli zawodnik już istnieje, zaktualizuj jego dane
              </div>
            </Label>
          </div>
        </div>

        {/* Import Button */}
        <div className="flex space-x-2">
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importMutation.isPending}
            className="flex-1"
          >
            {importMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importowanie...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importuj zawodników
              </>
            )}
          </Button>
          {(selectedFile || importResult) && (
            <Button variant="outline" onClick={resetForm}>
              Resetuj
            </Button>
          )}
        </div>

        {/* Progress */}
        {importMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Przetwarzanie pliku CSV...</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Results */}
        {importResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-green-700">
                  {importResult.imported}
                </div>
                <div className="text-xs text-green-600">Zaimportowano</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-blue-700">
                  {importResult.updated}
                </div>
                <div className="text-xs text-blue-600">Zaktualizowano</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-gray-700">
                  {importResult.skipped}
                </div>
                <div className="text-xs text-gray-600">Pominięto</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    Wystąpiły błędy podczas importu:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>
                        ... i {importResult.errors.length - 5} więcej błędów
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Import zakończony pomyślnie!
                {importResult.imported > 0 &&
                  ` Zaimportowano ${importResult.imported} nowych zawodników.`}
                {importResult.updated > 0 &&
                  ` Zaktualizowano ${importResult.updated} zawodników.`}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Format Examples */}
        <div className="space-y-3 pt-4 border-t">
          <Label>Przykłady formatów CSV:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium mb-2">Format PZLA:</div>
              <code className="text-xs">
                Imię;Nazwisko;DataUr;Klub;NazwaPZLA
                <br />
                Jan;Kowalski;1995-05-15;AZS Warszawa;100m mężczyzn
              </code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium mb-2">Format międzynarodowy:</div>
              <code className="text-xs">
                FirstName,LastName,DateOfBirth,Gender,ClubName
                <br />
                John,Smith,1995-05-15,Male,Warsaw Athletics
              </code>
            </div>
          </div>
        </div>

        {/* Results Dialog */}
        <ImportResultsDialog
          isOpen={showResultsDialog}
          onClose={() => setShowResultsDialog(false)}
          result={importResult}
        />
      </CardContent>
    </Card>
  );
}
