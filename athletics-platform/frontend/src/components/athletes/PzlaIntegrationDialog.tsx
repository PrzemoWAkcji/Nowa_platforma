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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";
import { CheckCircle, Download, Loader2, Search, XCircle } from "lucide-react";
import { useState } from "react";

interface PzlaIntegrationDialogProps {
  athleteId: string;
  athleteName: string;
  licenseNumber?: string;
  trigger?: React.ReactNode;
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
  found: boolean;
}

interface UpdateResult {
  updated: boolean;
  personalBests: any;
  seasonBests: any;
  errors: string[];
}

export function PzlaIntegrationDialog({
  athleteId,
  athleteName,
  licenseNumber,
  trigger,
}: PzlaIntegrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResult(null);
    setUpdateResult(null);

    try {
      const response = await api.get(`/athletes/${athleteId}/search-pzla`);
      setSearchResult(response.data);

      if (response.data.found) {
        toast({
          title: "Znaleziono zawodnika",
          description: `Znaleziono ${response.data.pzlaData.results.length} wyników na stronie PZLA`,
        });
      } else {
        toast({
          title: "Nie znaleziono zawodnika",
          description: "Zawodnik nie został znaleziony na stronie PZLA",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching PZLA:", error);
      toast({
        title: "Błąd wyszukiwania",
        description: "Wystąpił błąd podczas wyszukiwania na stronie PZLA",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateResult(null);

    try {
      const response = await api.post(
        `/athletes/${athleteId}/update-from-pzla`
      );
      setUpdateResult(response.data);

      if (response.data.updated) {
        toast({
          title: "Rekordy zaktualizowane",
          description: "Pomyślnie zaktualizowano rekordy zawodnika z PZLA",
        });
      } else {
        toast({
          title: "Brak aktualizacji",
          description: response.data.errors.join(", "),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating from PZLA:", error);
      toast({
        title: "Błąd aktualizacji",
        description: "Wystąpił błąd podczas aktualizacji rekordów z PZLA",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatResult = (result: string, event: string) => {
    // Sprawdź czy to konkurencja czasowa
    const timeEvents = [
      "100M",
      "200M",
      "400M",
      "800M",
      "1500M",
      "5000M",
      "10000M",
      "110MH",
      "100MH",
      "400MH",
    ];
    const isTimeEvent = timeEvents.some((e) => event.toUpperCase().includes(e));

    if (isTimeEvent) {
      return `${result}s`;
    } else {
      return `${result}m`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Pobierz z PZLA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Integracja z PZLA</DialogTitle>
          <DialogDescription>
            Wyszukaj i pobierz wyniki zawodnika {athleteName} ze strony
            statystyka.pzla.pl
            {licenseNumber && ` (Licencja: ${licenseNumber})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wyszukiwanie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex items-center"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {isSearching ? "Wyszukiwanie..." : "Wyszukaj na PZLA"}
                </Button>

                {searchResult && (
                  <Badge
                    variant={searchResult.found ? "default" : "destructive"}
                  >
                    {searchResult.found ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {searchResult.found ? "Znaleziono" : "Nie znaleziono"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResult?.found && searchResult.pzlaData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wyniki z PZLA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Imię i nazwisko:</span>{" "}
                      {searchResult.pzlaData.firstName}{" "}
                      {searchResult.pzlaData.lastName}
                    </div>
                    {searchResult.pzlaData.club && (
                      <div>
                        <span className="font-medium">Klub:</span>{" "}
                        {searchResult.pzlaData.club}
                      </div>
                    )}
                    {searchResult.pzlaData.licenseNumber && (
                      <div>
                        <span className="font-medium">Licencja:</span>{" "}
                        {searchResult.pzlaData.licenseNumber}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Liczba wyników:</span>{" "}
                      {searchResult.pzlaData.results.length}
                    </div>
                  </div>

                  {searchResult.pzlaData.results.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Najlepsze wyniki:</h4>
                      <div className="max-h-40 overflow-y-auto">
                        <div className="space-y-2">
                          {searchResult.pzlaData.results
                            .slice(0, 10)
                            .map((result, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                              >
                                <div>
                                  <span className="font-medium">
                                    {result.event}
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {result.competition}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {formatResult(result.result, result.event)}
                                  </div>
                                  <div className="text-gray-600">
                                    {result.date}
                                  </div>
                                </div>
                              </div>
                            ))}
                          {searchResult.pzlaData.results.length > 10 && (
                            <div className="text-center text-gray-600 text-sm">
                              i {searchResult.pzlaData.results.length - 10}{" "}
                              więcej...
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

          {/* Update Section */}
          {searchResult?.found && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktualizacja rekordów</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Kliknij poniżej, aby zaktualizować rekordy życiowe (PB) i
                    sezonowe (SB) zawodnika na podstawie danych z PZLA.
                  </p>

                  <Button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex items-center"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isUpdating ? "Aktualizowanie..." : "Aktualizuj rekordy"}
                  </Button>

                  {updateResult && (
                    <div className="mt-4">
                      <Badge
                        variant={
                          updateResult.updated ? "default" : "destructive"
                        }
                      >
                        {updateResult.updated ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {updateResult.updated
                          ? "Zaktualizowano"
                          : "Błąd aktualizacji"}
                      </Badge>

                      {updateResult.errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          <p className="font-medium">Błędy:</p>
                          <ul className="list-disc list-inside">
                            {updateResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Zamknij
          </Button>
          {updateResult?.updated && (
            <Button onClick={() => window.location.reload()}>
              Odśwież stronę
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
