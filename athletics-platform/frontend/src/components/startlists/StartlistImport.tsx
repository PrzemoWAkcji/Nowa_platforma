"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useImportStartlist } from "@/hooks/useStartlists";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";

interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  skippedCount: number;
  updatedCount: number;
  errors: string[];
  warnings: string[];
  detectedFormat: string;
  entries: any[];
}

interface StartlistImportProps {
  competitionId: string;
}

export function StartlistImport({ competitionId }: StartlistImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"pzla" | "international">("pzla");
  const [updateExisting, setUpdateExisting] = useState(false);
  const [createMissingAthletes, setCreateMissingAthletes] = useState(true);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportStartlist();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      alert("Proszę wybrać plik CSV");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await importMutation.mutateAsync({
        competitionId,
        file: selectedFile,
        format,
        updateExisting,
        createMissingAthletes,
      });
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: "Błąd podczas importu",
        importedCount: 0,
        skippedCount: 0,
        updatedCount: 0,
        errors: [error?.message || "Nieznany błąd"],
        warnings: [],
        detectedFormat: "PZLA",
        entries: [],
      });
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Import listy startowej z CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Wybierz plik CSV z listą startową</Label>
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Wybierz plik CSV z listą startową"
              title="Wybierz plik CSV z listą startową"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Wybierz plik
            </Button>
            {selectedFile && (
              <span className="text-sm text-gray-600">
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
            onValueChange={(value) =>
              setFormat(value as "pzla" | "international")
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pzla" id="pzla-startlist" />
              <Label htmlFor="pzla-startlist" className="cursor-pointer">
                Format PZLA (starter.csv)
                <div className="text-xs text-gray-500 mt-1">
                  Kolumny: Imię, Nazwisko, DataUr, Klub, NazwaPZLA,
                  NumerStartowy
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="international"
                id="international-startlist"
              />
              <Label
                htmlFor="international-startlist"
                className="cursor-pointer"
              >
                Format międzynarodowy (startlist.csv)
                <div className="text-xs text-gray-500 mt-1">
                  Kolumny: FirstName, LastName, DateOfBirth, Gender, ClubName,
                  EventName, StartNumber
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Opcje importu</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="update-existing"
                checked={updateExisting}
                onCheckedChange={(checked) =>
                  setUpdateExisting(checked as boolean)
                }
              />
              <Label htmlFor="update-existing" className="cursor-pointer">
                Aktualizuj istniejące rejestracje
                <div className="text-xs text-gray-500 mt-1">
                  Jeśli zawodnik już jest zarejestrowany, zaktualizuj jego dane
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-missing"
                checked={createMissingAthletes}
                onCheckedChange={(checked) =>
                  setCreateMissingAthletes(checked as boolean)
                }
              />
              <Label htmlFor="create-missing" className="cursor-pointer">
                Utwórz brakujących zawodników
                <div className="text-xs text-gray-500 mt-1">
                  Automatycznie dodaj zawodników, którzy nie istnieją w bazie
                </div>
              </Label>
            </div>
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
                Importuj listę startową
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
              <span>Przetwarzanie listy startowej...</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Results */}
        {importResult && (
          <div className="space-y-4">
            {!importResult.success && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium text-red-700">
                    {importResult.message}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-green-700">
                  {importResult.importedCount || 0}
                </div>
                <div className="text-xs text-green-600">Zarejestrowano</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-blue-700">
                  {importResult.updatedCount || 0}
                </div>
                <div className="text-xs text-blue-600">Zaktualizowano</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                <div className="text-lg font-semibold text-gray-700">
                  {importResult.skippedCount || 0}
                </div>
                <div className="text-xs text-gray-600">Pominięto</div>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
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

            {importResult.warnings && importResult.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Ostrzeżenia:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {importResult.warnings.slice(0, 5).map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                    {importResult.warnings.length > 5 && (
                      <li>
                        ... i {importResult.warnings.length - 5} więcej
                        ostrzeżeń
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {importResult.success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import listy startowej zakończony!
                  {importResult.importedCount > 0 &&
                    ` Zarejestrowano ${importResult.importedCount} zawodników.`}
                  {importResult.updatedCount > 0 &&
                    ` Zaktualizowano ${importResult.updatedCount} rejestracji.`}
                  {importResult.detectedFormat &&
                    ` Wykryto format: ${importResult.detectedFormat}.`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Format Examples */}
        <div className="space-y-3 pt-4 border-t">
          <Label>Przykłady formatów CSV dla list startowych:</Label>
          <div className="grid grid-cols-1 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium mb-2">Format PZLA (starter.csv):</div>
              <code className="text-xs">
                Imię;Nazwisko;DataUr;Klub;NazwaPZLA;NumerStartowy
                <br />
                Jan;Kowalski;1995-05-15;AZS Warszawa;100m mężczyzn;101
                <br />
                Anna;Nowak;1998-03-22;Legia Warszawa;100m kobiet;201
              </code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium mb-2">
                Format międzynarodowy (startlist.csv):
              </div>
              <code className="text-xs">
                FirstName,LastName,DateOfBirth,Gender,ClubName,EventName,StartNumber
                <br />
                John,Smith,1995-05-15,Male,Warsaw Athletics,100m Men,101
                <br />
                Sarah,Johnson,1998-03-22,Female,Krakow Running Club,100m
                Women,201
              </code>
            </div>
          </div>
        </div>

        {/* Info */}
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">
              Informacje o imporcie list startowych:
            </div>
            <ul className="text-sm space-y-1">
              <li>
                • Lista startowa automatycznie rejestruje zawodników na
                konkurencje
              </li>
              <li>• Numery startowe są przydzielane zgodnie z plikiem CSV</li>
              <li>• Brakujący zawodnicy mogą być automatycznie utworzeni</li>
              <li>
                • System sprawdza duplikaty na podstawie imienia, nazwiska i
                daty urodzenia
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
