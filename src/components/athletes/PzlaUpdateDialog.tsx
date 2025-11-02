"use client";

import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";
import { CheckCircle, Download, Loader2, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface PzlaUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
}

interface PzlaResult {
  event: string;
  result: string;
  date: string;
  competition: string;
  wind?: string;
}

interface PzlaData {
  firstName: string;
  lastName: string;
  club?: string;
  licenseNumber?: string;
  results: PzlaResult[];
}

interface SearchResult {
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    licenseNumber?: string;
  };
  pzlaData: PzlaData | null;
  error?: string;
}

interface UpdateResult {
  success: boolean;
  updated: boolean;
  personalBests: any;
  seasonBests: any;
  errors: string[];
}

export function PzlaUpdateDialog({
  isOpen,
  onClose,
  athleteId,
}: PzlaUpdateDialogProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const { showSuccess, showError } = useToast();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchResult(null);
      setUpdateResult(null);
      setIsSearching(false);
      setIsUpdating(false);
      // Automatycznie rozpocznij wyszukiwanie
      handleSearch();
    }
  }, [isOpen, athleteId]);

  const handleSearch = async () => {
    if (!athleteId) return;

    setIsSearching(true);
    setSearchResult(null);
    setUpdateResult(null);

    try {
      const response = await api.get(`/athletes/${athleteId}/search-pzla`);
      setSearchResult(response.data);
    } catch (error: any) {
      console.error("PZLA search error:", error);
      const errorMessage =
        error.response?.status === 401
          ? "Brak autoryzacji. Zaloguj się ponownie."
          : error.response?.data?.message || "Błąd podczas wyszukiwania w PZLA";

      setSearchResult({
        athlete: {
          id: athleteId,
          firstName: "Nieznany",
          lastName: "Zawodnik",
        },
        pzlaData: null,
        error: errorMessage,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdate = async () => {
    if (!searchResult?.pzlaData) return;

    setIsUpdating(true);
    setUpdateResult(null);

    try {
      const response = await api.post(
        `/athletes/${athleteId}/update-from-pzla`
      );

      setUpdateResult(response.data);

      if (response.data.success) {
        showSuccess("Rekordy zawodnika zostały zaktualizowane");
      } else {
        showError("Aktualizacja zakończona z błędami");
      }
    } catch (error: any) {
      console.error("PZLA update error:", error);
      setUpdateResult({
        success: false,
        updated: false,
        personalBests: {},
        seasonBests: {},
        errors: [error.response?.data?.message || "Błąd podczas aktualizacji"],
      });

      showError("Nie udało się zaktualizować rekordów");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSearchResult(null);
    setUpdateResult(null);
    setIsSearching(false);
    setIsUpdating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Integracja z PZLA
          </DialogTitle>
          <DialogDescription>
            Pobierz najnowsze rekordy zawodnika z bazy danych PZLA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status wyszukiwania */}
          {isSearching && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Wyszukiwanie w bazie PZLA...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wyniki wyszukiwania */}
          {searchResult && !isSearching && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Wyniki wyszukiwania
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Zawodnik:</h4>
                    <p>
                      {searchResult.athlete.firstName}{" "}
                      {searchResult.athlete.lastName}
                    </p>
                    {searchResult.athlete.licenseNumber && (
                      <p className="text-sm text-gray-600">
                        Nr licencji: {searchResult.athlete.licenseNumber}
                      </p>
                    )}
                  </div>

                  {searchResult.error && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>{searchResult.error}</span>
                    </div>
                  )}

                  {searchResult.pzlaData && (
                    <div>
                      <h4 className="font-medium mb-2">Dane z PZLA:</h4>
                      <div className="space-y-2">
                        <p>
                          <strong>Imię i nazwisko:</strong>{" "}
                          {searchResult.pzlaData.firstName}{" "}
                          {searchResult.pzlaData.lastName}
                        </p>
                        {searchResult.pzlaData.club && (
                          <p>
                            <strong>Klub:</strong> {searchResult.pzlaData.club}
                          </p>
                        )}
                        {searchResult.pzlaData.licenseNumber && (
                          <p>
                            <strong>Nr licencji:</strong>{" "}
                            {searchResult.pzlaData.licenseNumber}
                          </p>
                        )}
                        <p>
                          <strong>Liczba wyników:</strong>{" "}
                          {searchResult.pzlaData.results.length}
                        </p>
                      </div>

                      {searchResult.pzlaData.results.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">
                            Najnowsze wyniki:
                          </h5>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {searchResult.pzlaData.results
                              .slice(0, 10)
                              .map((result, index) => (
                                <div
                                  key={index}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {result.event}
                                  </span>
                                  : {result.result}
                                  {result.wind && ` (${result.wind})`}
                                  <span className="text-gray-600 ml-2">
                                    {result.date} - {result.competition}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status aktualizacji */}
          {isUpdating && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Aktualizowanie rekordów...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wyniki aktualizacji */}
          {updateResult && !isUpdating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {updateResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  Wyniki aktualizacji
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={updateResult.success ? "default" : "destructive"}
                    >
                      {updateResult.success ? "Sukces" : "Błąd"}
                    </Badge>
                    {updateResult.updated && (
                      <Badge variant="outline">Zaktualizowano rekordy</Badge>
                    )}
                  </div>

                  {updateResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Błędy:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {updateResult.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-600">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {updateResult.success && updateResult.updated && (
                    <div className="text-sm text-green-600">
                      Rekordy osobiste i sezonowe zostały pomyślnie
                      zaktualizowane.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Zamknij
          </Button>

          {searchResult && !searchResult.error && (
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              variant="outline"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wyszukiwanie...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Wyszukaj ponownie
                </>
              )}
            </Button>
          )}

          {searchResult?.pzlaData && !isUpdating && (
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aktualizowanie...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Zaktualizuj rekordy
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
