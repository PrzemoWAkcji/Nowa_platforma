"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heat, HeatLane } from "@/types";
import React, { useState } from "react";
// import { DragDropContext, Droppable } from '@hello-pangea/dnd'; // Obecnie nieużywane
import {
  ArrowUpDown,
  Clock,
  Maximize2,
  Minimize2,
  Settings,
  Trophy,
  Users,
} from "lucide-react";

interface Registration {
  id: string;
  bibNumber?: string;
  seedTime?: string;
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
    club?: string;
  };
}

// Używamy globalnych typów Heat i HeatLane z @/types

interface SeedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: Registration[];
  heats: Heat[];
  isFieldEvent: boolean;
  onSeed: (config: SeedingConfig) => void;
}

interface SeedingConfig {
  numberOfHeats: number;
  lanesPerHeat: number;
  sortBy: "seedTime" | "name" | "bibNumber" | "club";
  seedingMethod: "zigzag" | "circle" | "random" | "manual" | "byTime";
  laneAssignment: "standard" | "random" | "manual" | "pairs" | "waterfall";
  preferredLanes: "default" | "inner" | "outer";
  skipLane1: boolean;
  autoCalculate: boolean;
  maxLanes?: number;
  customLanesPerHeat?: number[]; // Różna liczba torów dla każdej serii
}

export const SeedingModal: React.FC<SeedingModalProps> = ({
  isOpen,
  onClose,
  registrations,
  heats: _heats, // Obecnie nieużywane
  isFieldEvent,
  onSeed,
}) => {
  const [config, setConfig] = useState<SeedingConfig>({
    numberOfHeats: Math.max(1, Math.ceil(registrations.length / 8)),
    lanesPerHeat: isFieldEvent ? registrations.length : 8,
    sortBy: "seedTime",
    seedingMethod: "zigzag",
    laneAssignment: "standard",
    preferredLanes: "default",
    skipLane1: true,
    autoCalculate: false,
    maxLanes: 10,
  });

  const [_sortedRegistrations, setSortedRegistrations] = useState<
    Registration[]
  >([]); // Obecnie nieużywane
  const [previewHeats, setPreviewHeats] = useState<Heat[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Funkcja automatycznego obliczania optymalnej liczby serii (zgodnie z przepisami World Athletics TR 16.3-16.4)
  // Przykład: 84 zawodników → 11 serii: 4×7 + 7×8 zawodników (tory 2-8)
  // Najlepsi zawodnicy w ostatniej serii, rozstawianie od środka, tor 1 pomijany w niepełnych seriach
  const calculateOptimalHeats = (
    athleteCount: number,
    maxLanes: number = 10,
    skipLane1: boolean = true
  ) => {
    const maxAthletesPerHeat = skipLane1 ? maxLanes - 1 : maxLanes; // -1 bo pomijamy tor 1

    // Jeśli wszyscy zawodnicy zmieszczą się w jednej serii
    if (athleteCount <= maxAthletesPerHeat) {
      return {
        heats: 1,
        lanesPerHeat: skipLane1 ? athleteCount + 1 : athleteCount,
      }; // +1 żeby uwzględnić pominięty tor 1
    }

    // Znajdź optymalny podział - MINIMALIZUJ LICZBĘ SERII (zgodnie z TR 16.3)
    let bestConfig = {
      heats: Math.ceil(athleteCount / maxAthletesPerHeat),
      lanesPerHeat: maxLanes,
    };

    // Sprawdź czy można zmieścić w mniejszej liczbie serii
    for (let heats = 1; heats <= Math.ceil(athleteCount / 2); heats++) {
      const avgAthletesPerHeat = Math.ceil(athleteCount / heats);

      // Sprawdź czy ta konfiguracja jest możliwa
      if (avgAthletesPerHeat <= maxAthletesPerHeat) {
        const lanesNeeded = skipLane1
          ? avgAthletesPerHeat + 1
          : avgAthletesPerHeat; // +1 dla pominiętego toru 1

        if (lanesNeeded <= maxLanes) {
          bestConfig = { heats, lanesPerHeat: lanesNeeded };
          break; // Znaleźliśmy minimalną liczbę serii
        }
      }
    }

    return bestConfig;
  };

  // Automatyczne obliczanie przy zmianie liczby zawodników lub ustawień torów
  React.useEffect(() => {
    if (config.autoCalculate && !isFieldEvent) {
      const optimal = calculateOptimalHeats(
        registrations.length,
        config.maxLanes || 10,
        config.skipLane1
      );
      setConfig((prev) => ({
        ...prev,
        numberOfHeats: optimal.heats,
        lanesPerHeat: optimal.lanesPerHeat,
      }));
    }
  }, [
    registrations.length,
    config.autoCalculate,
    config.maxLanes,
    config.skipLane1,
    isFieldEvent,
  ]);

  // Sortowanie zawodników (zgodnie z przepisami World Athletics)
  const sortRegistrations = (registrations: Registration[], sortBy: string) => {
    return [...registrations].sort((a, b) => {
      switch (sortBy) {
        case "seedTime":
          // Zawodnicy bez czasu kwalifikacyjnego traktowani jako najsłabsi
          // Najsłabsi w pierwszych seriach, najlepsi w ostatniej serii
          if (!a.seedTime && !b.seedTime) return 0;
          if (!a.seedTime) return 1; // a bez czasu = słabszy (idzie wcześniej)
          if (!b.seedTime) return -1; // b bez czasu = słabszy (idzie wcześniej)

          // Parsuj czasy - najszybsi na końcu (ostatnia seria)
          const timeA = parseFloat(a.seedTime) || 999999;
          const timeB = parseFloat(b.seedTime) || 999999;
          return timeA - timeB;
        case "name":
          const nameA = `${a.athlete?.lastName} ${a.athlete?.firstName}`;
          const nameB = `${b.athlete?.lastName} ${b.athlete?.firstName}`;
          return nameA.localeCompare(nameB);
        case "bibNumber":
          const bibA = parseInt(a.bibNumber || "999");
          const bibB = parseInt(b.bibNumber || "999");
          return bibA - bibB;
        case "club":
          return (a.athlete?.club || "").localeCompare(b.athlete?.club || "");
        default:
          return 0;
      }
    });
  };

  // Generowanie podglądu rozstawienia
  const generatePreview = () => {
    const sorted = sortRegistrations(registrations, config.sortBy);
    setSortedRegistrations(sorted);

    // Generowanie serii według wybranej metody
    const newHeats: Heat[] = [];

    if (isFieldEvent) {
      // Dla konkurencji technicznych - jeden finał
      const lanes: HeatLane[] = [];
      sorted.forEach((reg, index) => {
        lanes.push({
          id: `final-${index + 1}`,
          heatId: "final",
          laneNumber: index + 1,
          athleteId: reg.athlete?.id,
          registrationId: reg.id,
          athlete: reg.athlete as Partial<any>,
          registration: reg as Partial<any>,
          seedTime: reg.seedTime,
        });
      });

      newHeats.push({
        id: "preview-heat-1",
        eventId: "",
        heatNumber: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lanes,
      });
    } else {
      // Dla biegów - podział na serie (zgodnie z przepisami World Athletics - najlepsi w ostatniej serii)
      const numberOfHeats = config.numberOfHeats;

      // Oblicz rozkład zawodników na serie
      const baseAthletesPerHeat = Math.floor(sorted.length / numberOfHeats);
      const extraAthletes = sorted.length % numberOfHeats;

      // Najpierw utwórz wszystkie serie
      const heatsData: Array<{
        heatNum: number;
        lanesForThisHeat: number;
        athletesInThisHeat: number;
      }> = [];

      for (let heatNum = 1; heatNum <= numberOfHeats; heatNum++) {
        const lanesForThisHeat = config.customLanesPerHeat
          ? config.customLanesPerHeat[heatNum - 1] || config.lanesPerHeat
          : config.lanesPerHeat;

        const athletesInThisHeat =
          baseAthletesPerHeat + (heatNum <= extraAthletes ? 1 : 0);

        heatsData.push({
          heatNum,
          lanesForThisHeat,
          athletesInThisHeat,
        });
      }

      // Przypisuj zawodników od ostatniej serii do pierwszej (najlepsi w ostatniej)
      let athleteIndex = 0;

      for (let i = heatsData.length - 1; i >= 0; i--) {
        const { heatNum, lanesForThisHeat, athletesInThisHeat } = heatsData[i];
        const lanes: HeatLane[] = [];

        const endIndex = Math.min(
          athleteIndex + athletesInThisHeat,
          sorted.length
        );
        const heatAthletes = sorted.slice(athleteIndex, endIndex);

        if (config.seedingMethod === "zigzag") {
          // Metoda zygzak - najlepsi w środku
          const arranged = arrangeZigzag(
            heatAthletes,
            lanesForThisHeat,
            config.skipLane1
          );
          arranged.forEach((reg, laneIndex) => {
            const laneNumber = config.skipLane1 ? laneIndex + 2 : laneIndex + 1;
            if (
              reg &&
              laneNumber <= lanesForThisHeat + (config.skipLane1 ? 1 : 0)
            ) {
              lanes.push({
                id: `${heatNum}-${laneNumber}`,
                heatId: `heat-${heatNum}`,
                laneNumber: laneNumber,
                athleteId: reg.athlete?.id,
                registrationId: reg.id,
                athlete: reg.athlete as Partial<any>,
                registration: reg as Partial<any>,
                seedTime: reg.seedTime,
              });
            }
          });
        } else {
          // Standardowe rozstawienie
          heatAthletes.forEach((reg, index) => {
            const laneNumber = config.skipLane1 ? index + 2 : index + 1;
            if (laneNumber <= lanesForThisHeat + (config.skipLane1 ? 1 : 0)) {
              lanes.push({
                id: `${heatNum}-${laneNumber}`,
                heatId: `heat-${heatNum}`,
                laneNumber: laneNumber,
                athleteId: reg.athlete?.id,
                registrationId: reg.id,
                athlete: reg.athlete as Partial<any>,
                registration: reg as Partial<any>,
                seedTime: reg.seedTime,
              });
            }
          });
        }

        athleteIndex = endIndex;

        // Dodaj serię w odpowiedniej kolejności (numeracja pozostaje 1, 2, 3...)
        newHeats.unshift({
          id: `preview-heat-${heatNum}`,
          eventId: "",
          heatNumber: heatNum,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lanes,
        });
      }
    }

    setPreviewHeats(newHeats);
    setShowPreview(true);
  };

  // Funkcja rozstawiania zygzak
  const arrangeZigzag = (
    athletes: Registration[],
    totalLanes: number,
    skipLane1: boolean = false
  ): (Registration | null)[] => {
    const availableLanes = skipLane1 ? totalLanes - 1 : totalLanes;
    const result: (Registration | null)[] = new Array(availableLanes).fill(
      null
    );
    const centerLane = Math.ceil(availableLanes / 2);

    athletes.forEach((athlete, index) => {
      let laneIndex;
      if (index === 0) {
        laneIndex = centerLane - 1; // Najlepszy w środku
      } else if (index % 2 === 1) {
        laneIndex = centerLane - 1 + Math.ceil(index / 2);
      } else {
        laneIndex = centerLane - 1 - index / 2;
      }

      if (laneIndex >= 0 && laneIndex < availableLanes) {
        result[laneIndex] = athlete;
      }
    });

    return result;
  };

  const handleSeed = () => {
    onSeed(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-[90vw] h-[85vh] overflow-hidden sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw]"
        style={{
          resize: "both",
          minWidth: "320px",
          minHeight: "400px",
        }}
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center text-lg">
                <Settings className="h-5 w-5 mr-2" />
                Rozstawianie - {isFieldEvent ? "Finał" : "Serie"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1 hidden md:block">
                Przeciągnij prawy dolny róg, aby zmienić rozmiar okna
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:flex"
              title={isFullscreen ? "Zmniejsz okno" : "Powiększ okno"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden pt-4">
          <div
            className={`grid gap-4 md:gap-6 h-full ${
              isFullscreen
                ? "grid-cols-1 2xl:grid-cols-2"
                : "grid-cols-1 lg:grid-cols-2"
            }`}
          >
            {/* Konfiguracja */}
            <div className="flex flex-col space-y-4 overflow-hidden">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Parametry rozstawiania
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Zgodnie z przepisami World Athletics TR 16.3-16.4: najlepsi
                    zawodnicy w ostatniej serii, zawodnicy bez czasu
                    kwalifikacyjnego traktowani jako najsłabsi (pierwsze serie).
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isFieldEvent && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Liczba serii</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={config.numberOfHeats}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                numberOfHeats: parseInt(e.target.value) || 1,
                              })
                            }
                            disabled={config.autoCalculate}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tory na serię</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={config.lanesPerHeat}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                lanesPerHeat: parseInt(e.target.value) || 8,
                              })
                            }
                            disabled={config.autoCalculate}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Maks. tory stadion</Label>
                          <Input
                            type="number"
                            min="6"
                            max="20"
                            value={config.maxLanes || 20}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                maxLanes: parseInt(e.target.value) || 20,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="autoCalculate"
                            checked={config.autoCalculate}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                autoCalculate: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300"
                            aria-label="Automatyczne obliczanie serii"
                          />
                          <Label htmlFor="autoCalculate" className="text-sm">
                            Automatyczne obliczanie serii
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="skipLane1"
                            checked={config.skipLane1}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                skipLane1: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300"
                            aria-label="Pomiń tor 1 (rozstawiaj od toru 2)"
                          />
                          <Label htmlFor="skipLane1" className="text-sm">
                            Pomiń tor 1 (rozstawiaj od toru 2)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="customLanes"
                            checked={!!config.customLanesPerHeat}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Inicjalizuj tablicę z domyślnymi wartościami
                                const customLanes = Array(
                                  config.numberOfHeats
                                ).fill(config.lanesPerHeat);
                                setConfig({
                                  ...config,
                                  customLanesPerHeat: customLanes,
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  customLanesPerHeat: undefined,
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                            aria-label="Różna liczba torów dla każdej serii"
                          />
                          <Label htmlFor="customLanes" className="text-sm">
                            Różna liczba torów dla każdej serii
                          </Label>
                        </div>
                      </div>

                      {/* Niestandardowa konfiguracja torów dla każdej serii */}
                      {config.customLanesPerHeat && (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                          <Label className="text-sm font-medium">
                            Liczba torów dla każdej serii:
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            {Array.from(
                              { length: config.numberOfHeats },
                              (_, index) => (
                                <div key={index} className="space-y-1">
                                  <Label className="text-xs">
                                    Seria {index + 1}
                                  </Label>
                                  <Input
                                    type="number"
                                    min="4"
                                    max="20"
                                    value={
                                      config.customLanesPerHeat?.[index] ||
                                      config.lanesPerHeat
                                    }
                                    onChange={(e) => {
                                      const newCustomLanes = [
                                        ...(config.customLanesPerHeat || []),
                                      ];
                                      newCustomLanes[index] =
                                        parseInt(e.target.value) ||
                                        config.lanesPerHeat;
                                      setConfig({
                                        ...config,
                                        customLanesPerHeat: newCustomLanes,
                                      });
                                    }}
                                    className="h-8"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Sortowanie</Label>
                    <Select
                      value={config.sortBy}
                      onValueChange={(
                        value: "seedTime" | "name" | "bibNumber" | "club"
                      ) => setConfig({ ...config, sortBy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seedTime">
                          Wynik kwalifikacyjny (bez czasu = najsłabsi)
                        </SelectItem>
                        <SelectItem value="name">Nazwisko</SelectItem>
                        <SelectItem value="bibNumber">
                          Numer startowy
                        </SelectItem>
                        <SelectItem value="club">Klub</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Metoda rozstawiania</Label>
                    <Select
                      value={config.seedingMethod}
                      onValueChange={(
                        value:
                          | "zigzag"
                          | "circle"
                          | "random"
                          | "manual"
                          | "byTime"
                      ) => setConfig({ ...config, seedingMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zigzag">
                          Zygzak (World Athletics)
                        </SelectItem>
                        <SelectItem value="circle">Koło</SelectItem>
                        <SelectItem value="byTime">
                          Według czasu/wyniku
                        </SelectItem>
                        <SelectItem value="random">Losowo</SelectItem>
                        <SelectItem value="manual">Ręcznie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!isFieldEvent && (
                    <div className="space-y-2">
                      <Label>Przydział torów</Label>
                      <Select
                        value={config.laneAssignment}
                        onValueChange={(
                          value:
                            | "standard"
                            | "random"
                            | "manual"
                            | "pairs"
                            | "waterfall"
                        ) => setConfig({ ...config, laneAssignment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">
                            Standardowo od zewnątrz
                          </SelectItem>
                          <SelectItem value="pairs">Pary</SelectItem>
                          <SelectItem value="waterfall">Wodospad</SelectItem>
                          <SelectItem value="random">Losowo</SelectItem>
                          <SelectItem value="manual">Ręcznie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={generatePreview}
                      variant="outline"
                      className="flex-1"
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Podgląd
                    </Button>
                    <Button onClick={handleSeed} className="flex-1">
                      <Trophy className="h-4 w-4 mr-2" />
                      Rozstaw
                    </Button>
                  </div>

                  {config.autoCalculate && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>
                          Automatyczne rozstawienie (World Athletics):
                        </strong>
                        <br />
                        {(() => {
                          // Oblicz rzeczywisty rozkład zawodników
                          const baseAthletesPerHeat = Math.floor(
                            registrations.length / config.numberOfHeats
                          );
                          const extraAthletes =
                            registrations.length % config.numberOfHeats;

                          if (config.numberOfHeats === 1) {
                            return `${registrations.length} zawodników → 1 seria po ${registrations.length} zawodników (tory 2-${config.lanesPerHeat})`;
                          } else {
                            // Niektóre serie będą miały +1 zawodnika
                            const fullHeats = extraAthletes; // serie z +1 zawodnikiem
                            const normalHeats =
                              config.numberOfHeats - extraAthletes; // serie ze standardową liczbą

                            let description = `${registrations.length} zawodników → ${config.numberOfHeats} serie: `;
                            if (normalHeats > 0) {
                              description += `${normalHeats}×${baseAthletesPerHeat}`;
                            }
                            if (fullHeats > 0) {
                              if (normalHeats > 0) description += " + ";
                              description += `${fullHeats}×${baseAthletesPerHeat + 1}`;
                            }
                            description += ` zawodników (tory 2-${config.lanesPerHeat})`;

                            return description;
                          }
                        })()}
                        {config.skipLane1 && " - tor 1 pominięty"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Zgodnie z przepisami WA TR 16.3-16.4: najlepsi w
                        ostatniej serii, rozstawianie od środka, tor 1 pomijany
                        w niepełnych seriach
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lista zawodników */}
              <Card className="flex-1 min-h-0 overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Zawodnicy ({registrations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                  <div className="space-y-2 h-full overflow-y-auto pr-2 custom-scrollbar">
                    {registrations.map((reg, index) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-2 border rounded text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center font-medium">
                            {index + 1}.
                          </span>
                          <span>
                            {reg.athlete?.firstName} {reg.athlete?.lastName}
                          </span>
                          {reg.bibNumber && (
                            <Badge variant="outline" className="text-xs">
                              #{reg.bibNumber}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {reg.athlete?.club && <span>{reg.athlete.club}</span>}
                          {reg.seedTime && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {reg.seedTime}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Podgląd rozstawienia */}
            <div className="flex flex-col h-full overflow-hidden">
              {showPreview && previewHeats.length > 0 && (
                <Card className="flex-1 overflow-hidden">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      Podgląd rozstawienia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-4">
                    <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                      {previewHeats.map((heat) => (
                        <div key={heat.id} className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">
                            {isFieldEvent
                              ? "Finał"
                              : `Seria ${heat.heatNumber}`}
                          </h4>
                          <div className="space-y-2">
                            {heat.lanes
                              .filter((lane) => lane.athlete) // Pokazuj tylko zajęte tory
                              .sort((a, b) => a.laneNumber - b.laneNumber) // Sortuj według numeru toru
                              .map((lane) => (
                                <div
                                  key={lane.laneNumber}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-8 text-center font-medium">
                                      {isFieldEvent
                                        ? `${lane.laneNumber}.`
                                        : `T${lane.laneNumber}`}
                                    </span>
                                    <span>
                                      {lane.athlete?.firstName}{" "}
                                      {lane.athlete?.lastName}
                                    </span>
                                    {lane.registration?.bibNumber && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        #{lane.registration.bibNumber}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    {lane.athlete?.club && (
                                      <span>{lane.athlete.club}</span>
                                    )}
                                    {(lane.registration?.seedTime ||
                                      lane.seedTime) && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {lane.registration?.seedTime ||
                                          lane.seedTime}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {!showPreview && (
                <Card className="flex-1 flex items-center justify-center">
                  <CardContent className="text-center text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Brak podglądu</p>
                    <p className="text-sm">
                      Kliknij &quot;Podgląd&quot;, aby zobaczyć rozstawienie
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
