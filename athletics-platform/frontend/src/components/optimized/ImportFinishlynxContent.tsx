"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCompetitions } from "@/hooks/useCompetitions";
import {
  FinishlynxImportResult,
  FinishlynxValidationResult,
  useImportFinishlynxFile,
  useManualImportFinishlynx,
  usePreviewFinishlynxFile,
  useValidateFinishlynxFile,
} from "@/hooks/useFinishlynx";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  HelpCircle,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ImportFinishlynxContent() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [manualContent, setManualContent] = useState("");
  const [manualFileType, setManualFileType] = useState<"evt" | "lif" | "sch">(
    "evt"
  );
  const [validationResult, setValidationResult] =
    useState<FinishlynxValidationResult | null>(null);
  const [importResult, setImportResult] =
    useState<FinishlynxImportResult | null>(null);
  const [previewData, setPreviewData] = useState<{
    events: Record<string, unknown>[];
    athletes: Record<string, unknown>[];
  } | null>(null);

  const { data: competitions } = useCompetitions();
  const importMutation = useImportFinishlynxFile();
  const validateMutation = useValidateFinishlynxFile();
  const manualImportMutation = useManualImportFinishlynx();
  const previewMutation = usePreviewFinishlynxFile();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setValidationResult(null);
        setImportResult(null);
        setPreviewData(null);

        // Automatyczna walidacja po wybraniu pliku
        validateMutation.mutate(file, {
          onSuccess: (result) => {
            setValidationResult(result);
          },
          onError: (error) => {
            },
        });
      }
    },
    [validateMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".evt", ".lif", ".sch"],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!selectedFile) return;

    importMutation.mutate(
      { file: selectedFile, competitionId: selectedCompetition },
      {
        onSuccess: (result) => {
          setImportResult(result);
        },
        onError: (error) => {
          },
      }
    );
  };

  const handleManualImport = async () => {
    if (!manualContent.trim()) return;

    manualImportMutation.mutate(
      {
        fileContent: manualContent,
        fileType: manualFileType,
        competitionId: selectedCompetition,
      },
      {
        onSuccess: (result) => {
          setImportResult(result);
        },
        onError: (error) => {
          },
      }
    );
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    previewMutation.mutate(
      { file: selectedFile, competitionId: selectedCompetition },
      {
        onSuccess: (result) => {
          setPreviewData(
            result as {
              events: Record<string, unknown>[];
              athletes: Record<string, unknown>[];
            }
          );
        },
        onError: (error) => {
          },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Import wyników FinishLynx
          </h1>
          <p className="text-gray-600 mt-2">
            Importuj wyniki z plików FinishLynx (.evt, .lif, .sch) lub wprowadź
            dane ręcznie
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/results/import/help")}
          className="flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          Pomoc
        </Button>
      </div>

      <Tabs defaultValue="file" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Import z pliku</TabsTrigger>
          <TabsTrigger value="manual">Import ręczny</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Wybierz plik FinishLynx
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-indigo-600">Upuść plik tutaj...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Przeciągnij i upuść plik lub kliknij, aby wybrać
                    </p>
                    <p className="text-sm text-gray-500">
                      Obsługiwane formaty: .evt, .lif, .sch
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-sm text-gray-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setValidationResult(null);
                        setImportResult(null);
                        setPreviewData(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competition Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Wybierz zawody</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="competition">Zawody</Label>
                  <Select
                    value={selectedCompetition}
                    onValueChange={setSelectedCompetition}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz zawody..." />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions?.map((competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          {competition.name} -{" "}
                          {new Date(competition.startDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Wynik walidacji
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult.valid ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Plik jest poprawny i gotowy do importu.
                      {(validationResult.eventCount ||
                        validationResult.resultCount) && (
                        <div className="mt-2">
                          <strong>Podsumowanie:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {validationResult.eventCount && (
                              <li>
                                Konkurencje: {validationResult.eventCount}
                              </li>
                            )}
                            {validationResult.resultCount && (
                              <li>Wyniki: {validationResult.resultCount}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div>
                        <strong>Błędy w pliku:</strong>
                        <div className="mt-1">{validationResult.message}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview and Import Actions */}
          {selectedFile && selectedCompetition && (
            <Card>
              <CardHeader>
                <CardTitle>Akcje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={handlePreview}
                    disabled={previewMutation.isPending}
                    variant="outline"
                  >
                    {previewMutation.isPending ? "Ładowanie..." : "Podgląd"}
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={
                      importMutation.isPending || !validationResult?.valid
                    }
                  >
                    {importMutation.isPending ? "Importowanie..." : "Importuj"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Data */}
          {previewData && (
            <Card>
              <CardHeader>
                <CardTitle>Podgląd danych</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previewData.events && (
                    <div>
                      <h4 className="font-medium mb-2">Konkurencje:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {previewData.events.map(
                          (event: Record<string, unknown>, index: number) => (
                            <div key={index} className="mb-1">
                              {String(event.name)} - {String(event.date)}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {previewData.athletes && (
                    <div>
                      <h4 className="font-medium mb-2">Zawodnicy:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                        {previewData.athletes.map(
                          (athlete: Record<string, unknown>, index: number) => (
                            <div key={index} className="mb-1">
                              {String(athlete.name)} - {String(athlete.club)}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          {/* Manual Import Section */}
          <Card>
            <CardHeader>
              <CardTitle>Import ręczny</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileType">Typ pliku</Label>
                  <Select
                    value={manualFileType}
                    onValueChange={(value: "evt" | "lif" | "sch") =>
                      setManualFileType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evt">Event (.evt)</SelectItem>
                      <SelectItem value="lif">Lynx Interface (.lif)</SelectItem>
                      <SelectItem value="sch">Schedule (.sch)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="competition">Zawody</Label>
                  <Select
                    value={selectedCompetition}
                    onValueChange={setSelectedCompetition}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz zawody..." />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions?.map((competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          {competition.name} -{" "}
                          {new Date(competition.startDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Zawartość pliku</Label>
                  <Textarea
                    id="content"
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Wklej tutaj zawartość pliku FinishLynx..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleManualImport}
                  disabled={
                    manualImportMutation.isPending ||
                    !manualContent.trim() ||
                    !selectedCompetition
                  }
                >
                  {manualImportMutation.isPending
                    ? "Importowanie..."
                    : "Importuj"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Progress */}
      {(importMutation.isPending || manualImportMutation.isPending) && (
        <Card>
          <CardHeader>
            <CardTitle>Postęp importu</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={50} className="mb-2" />
            <p className="text-sm text-gray-600">Przetwarzanie danych...</p>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Wynik importu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importResult.errors.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <strong>Import zakończony pomyślnie!</strong>
                    <div className="mt-2">
                      <ul className="list-disc list-inside">
                        <li>
                          Przetworzono wyników: {importResult.processedResults}{" "}
                          z {importResult.totalResults}
                        </li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <strong>Błąd podczas importu:</strong>
                    <div className="mt-1">
                      {importResult.errors.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
