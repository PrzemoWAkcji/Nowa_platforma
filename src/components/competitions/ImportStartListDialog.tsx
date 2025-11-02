"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImportStartListResult,
  useImportStartList,
} from "@/hooks/useStartListImport";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Info,
  Upload,
  UserCheck,
  X,
  XCircle,
  SkipForward,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImportStartListHelp } from "./ImportStartListHelp";

interface ImportStartListDialogProps {
  competitionId: string;
  trigger?: React.ReactNode;
  onImportSuccess?: () => void;
}

export function ImportStartListDialog({
  competitionId,
  trigger,
  onImportSuccess,
}: ImportStartListDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<
    "PZLA" | "ROSTER" | "AUTO"
  >("AUTO");
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] =
    useState<ImportStartListResult | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");

  const importMutation = useImportStartList(competitionId);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Sprawdź czy zawiera polskie znaki - jeśli nie, spróbuj Windows-1250
      if (!/[ąćęłńóśźż]/i.test(content) && content.includes("�")) {
        // Prawdopodobnie błędne kodowanie, spróbuj ponownie z Windows-1250
        const reader2 = new FileReader();
        reader2.onload = (e2) => {
          const content2 = e2.target?.result as string;
          setCsvData(content2);
          setStep("preview");
        };
        reader2.readAsText(file, "windows-1250");
        return;
      }

      setCsvData(content);
      setStep("preview");
    };
    reader.readAsText(file, "utf-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(
      (file) =>
        file.type === "text/csv" ||
        file.name.endsWith(".csv") ||
        file.type === "application/vnd.ms-excel"
    );

    if (csvFile) {
      handleFileUpload(csvFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleImport = async () => {
    try {
      const result = await importMutation.mutateAsync({
        csvData,
        format: selectedFormat,
      });
      setImportResult(result);
      setStep("result");

      // Wywołaj callback po udanym imporcie
      if (result.success) {
        toast.success(
          `Pomyślnie zaimportowano ${result.importedCount} zawodników`
        );
        onImportSuccess?.();
      } else {
        toast.error("Błąd podczas importu");
      }
    } catch (error) {}
  };

  const resetDialog = () => {
    setStep("upload");
    setCsvData("");
    setImportResult(null);
    setSelectedFormat("AUTO");
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(resetDialog, 300); // Reset after dialog closes
  };

  const getPreviewData = () => {
    if (!csvData) return [];

    const lines = csvData.trim().split("\n");
    const separator = csvData.includes(";") ? ";" : ",";

    return lines
      .slice(0, 6)
      .map((line: string) =>
        line
          .split(separator)
          .map((cell: string) => cell.trim().replace(/"/g, ""))
      );
  };

  const previewData = getPreviewData();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Importuj listę startową
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Import listy startowej</DialogTitle>
            <ImportStartListHelp />
          </div>
          <DialogDescription>
            Importuj listę startową z pliku PZLA lub Roster Athletics.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Obsługiwane formaty: PZLA (starter.pzla.pl) i Roster Athletics.
                Aplikacja automatycznie rozpozna format pliku.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Format pliku (opcjonalnie)
                </label>
                <Select
                  value={selectedFormat}
                  onValueChange={(value: string) =>
                    setSelectedFormat(value as "PZLA" | "ROSTER" | "AUTO")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO">
                      Automatyczne rozpoznawanie
                    </SelectItem>
                    <SelectItem value="PZLA">PZLA (starter.pzla.pl)</SelectItem>
                    <SelectItem value="ROSTER">Roster Athletics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Przeciągnij plik CSV tutaj
                </p>
                <p className="text-gray-600 mb-4">lub</p>
                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Wybierz plik</span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Podgląd danych</h3>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Wstecz
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending ? "Importowanie..." : "Importuj"}
                </Button>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Wybrany format: <strong>{selectedFormat}</strong>
                {selectedFormat === "AUTO" &&
                  " (zostanie automatycznie wykryty)"}
              </AlertDescription>
            </Alert>

            {previewData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pierwsze wiersze pliku</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={
                              rowIndex === 0 ? "font-medium bg-gray-50" : ""
                            }
                          >
                            {row.slice(0, 8).map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border px-2 py-1 max-w-32 truncate"
                              >
                                {cell}
                              </td>
                            ))}
                            {row.length > 8 && (
                              <td className="border px-2 py-1 text-gray-500">
                                ... i {row.length - 8} więcej kolumn
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Pokazano {Math.min(previewData.length, 6)} z{" "}
                    {csvData.split("\n").length} wierszy
                  </p>
                </CardContent>
              </Card>
            )}

            {importMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Importowanie danych...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}
          </div>
        )}

        {step === "result" && importResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Wyniki importu</h3>
              <div className="flex gap-2">
                {importResult.success && (
                  <Button onClick={closeDialog} variant="default">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Kontynuuj
                  </Button>
                )}
                <Button onClick={closeDialog} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Zamknij
                </Button>
              </div>
            </div>

            <Alert
              className={
                importResult.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  importResult.success ? "text-green-800" : "text-red-800"
                }
              >
                {importResult.message}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <UserCheck className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-600">
                      {importResult.importedCount}
                    </div>
                    <div className="text-xs text-gray-600">Zaimportowano</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <SkipForward className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-600">
                      {importResult.skippedCount}
                    </div>
                    <div className="text-xs text-gray-600">Pominięto</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <RefreshCw className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-purple-600">
                      {importResult.updatedCount}
                    </div>
                    <div className="text-xs text-gray-600">Zaktualizowano</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-red-600">
                      {importResult.errors.length}
                    </div>
                    <div className="text-xs text-gray-600">Błędów</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-yellow-600">
                      {importResult.warnings.length}
                    </div>
                    <div className="text-xs text-gray-600">Ostrzeżeń</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Wykryty format:</span>
              <Badge variant="outline">{importResult.detectedFormat}</Badge>
            </div>

            {importResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Błędy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-700 bg-red-50 p-2 rounded"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {importResult.warnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Ostrzeżenia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResult.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
