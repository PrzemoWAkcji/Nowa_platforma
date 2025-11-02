"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  Crown,
  Layers,
  Play,
  RotateCcw,
  Settings,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// interface Athlete { // Obecnie nieużywane
//   id: string;
//   firstName: string;
//   lastName: string;
//   gender: string;
//   category: string;
// }

// Nieużywany interface Registration
// interface Registration {
//   id: string;
//   athlete: Athlete;
//   seedTime?: string;
//   bibNumber?: string;
// }

interface Event {
  id: string;
  name: string;
  type: string;
  gender: string;
  category: string;
  distance?: string;
}

interface AdvancedHeatManagerProps {
  competitionId: string;
}

// Metody podziału na serie zgodne z Roster Athletics
const seriesMethods = {
  ALPHABETICAL_NUMBER: "Alfanumerycznie (po numerze)",
  ALPHABETICAL_NAME: "Alfabetycznie (po nazwisku)",
  ROUND_ROBIN: "Koło (round robin)",
  ZIGZAG: "Zygzak",
  BY_RESULT: "Według czasu/wyniku",
  BY_RESULT_INDOOR: "Według czasu (hala)",
  SEED_TIME: "Według czasów zgłoszeniowych",
  RANDOM: "Losowo",
};

// Metody przypisania torów zgodne z Roster Athletics
const laneMethods = {
  BEST_TO_WORST: "Od najlepszego do najgorszego",
  WORST_TO_BEST: "Od najgorszego do najlepszego",
  HALF_AND_HALF: "Pół na pół",
  PAIRS: "Pary",
  PAIRS_INDOOR: "Pary (hala)",
  STANDARD_OUTSIDE: "Standardowo od zewnątrz",
  STANDARD_INSIDE: "Standardowo od wewnątrz",
  WATERFALL: "Wodospad",
  WATERFALL_REVERSE: "Wodospad odwrócony",
  WA_HALVES_AND_PAIRS: "WA - Połówki i pary",
  WA_SPRINTS_STRAIGHT: "WA - Sprinty (prosta)",
  WA_200M: "WA - 200m",
  WA_400M_800M: "WA - 400m/800m",
  WA_9_LANES: "WA - 9 torów",
  RANDOM: "Losowo",
  SEED_TIME: "Według czasów (finał)",
};

const roundLabels = {
  QUALIFICATION: "Eliminacje",
  SEMIFINAL: "Półfinał",
  FINAL: "Finał",
  QUALIFICATION_A: "Elim. A",
  QUALIFICATION_B: "Elim. B",
  QUALIFICATION_C: "Elim. C",
};

export default function AdvancedHeatManager({
  competitionId,
}: AdvancedHeatManagerProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("FINAL");
  const [seriesMethod, setSeriesMethod] = useState<string>("BY_RESULT");
  const [laneMethod, setLaneMethod] = useState<string>("WA_SPRINTS_STRAIGHT");
  const [maxLanes, setMaxLanes] = useState<number>(20);
  const [heatsCount, setHeatsCount] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Pobierz wydarzenia dla zawodów
  const { data: events } = useQuery({
    queryKey: ["events", competitionId],
    queryFn: async () => {
      const response = await fetch(
        `/api/events?competitionId=${competitionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json() as Promise<Event[]>;
    },
  });

  // Pobierz serie dla wybranego wydarzenia
  const { data: heats } = useQuery({
    queryKey: ["heats", selectedEvent],
    queryFn: async () => {
      if (!selectedEvent) return [];
      const response = await fetch(
        `/api/organization/heats/event/${selectedEvent}`
      );
      if (!response.ok) throw new Error("Failed to fetch heats");
      return response.json();
    },
    enabled: !!selectedEvent,
  });

  // Pobierz uczestników wydarzenia
  const { data: participants } = useQuery({
    queryKey: ["event-participants", selectedEvent],
    queryFn: async () => {
      if (!selectedEvent) return null;
      const response = await fetch(
        `/api/organization/schedules/events/${selectedEvent}/participants`
      );
      if (!response.ok) throw new Error("Failed to fetch participants");
      return response.json();
    },
    enabled: !!selectedEvent,
  });

  // Zaawansowane automatyczne rozstawienie
  const advancedAutoAssignMutation = useMutation({
    mutationFn: async (data: {
      eventId: string;
      round: string;
      seriesMethod: string;
      laneMethod: string;
      maxLanes?: number;
      heatsCount?: number;
    }) => {
      const response = await fetch(
        "/api/organization/heats/advanced-auto-assign",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to auto-assign");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["heats", selectedEvent] });
      toast.success(
        `Zawodnicy zostali rozstawieni! Utworzono ${data.heats} serii dla ${data.participants} zawodników.`
      );
    },
    onError: (error: Error) => {
      toast.error(`Błąd podczas rozstawiania: ${error.message}`);
    },
  });

  const formatEventName = (event: Event) => {
    const parts = [];
    if (event.distance) {
      parts.push(event.distance);
    } else {
      parts.push(event.name);
    }
    parts.push(
      event.gender === "MALE" ? "M" : event.gender === "FEMALE" ? "K" : "MIX"
    );
    return parts.join(" ");
  };

  const handleAdvancedAssign = () => {
    if (!selectedEvent) {
      toast.error("Wybierz wydarzenie");
      return;
    }

    advancedAutoAssignMutation.mutate({
      eventId: selectedEvent,
      round: selectedRound,
      seriesMethod,
      laneMethod,
      maxLanes,
      heatsCount,
    });
  };

  const getMethodDescription = (seriesMethod: string, laneMethod: string) => {
    const seriesDesc =
      seriesMethods[seriesMethod as keyof typeof seriesMethods];
    const laneDesc = laneMethods[laneMethod as keyof typeof laneMethods];
    return `Podział na serie: ${seriesDesc} • Przypisanie torów: ${laneDesc}`;
  };

  const currentEvent = events?.find((e) => e.id === selectedEvent);
  const currentHeats =
    heats?.filter((h: { round: string }) => h.round === selectedRound) || [];

  // Predefiniowane kombinacje dla różnych typów konkurencji
  const getRecommendedMethods = (eventType: string, distance?: string) => {
    if (eventType === "TRACK") {
      if (distance?.includes("100m") || distance?.includes("200m")) {
        return {
          series: "BY_RESULT",
          lane: "WA_SPRINTS_STRAIGHT",
          description: "Zalecane dla sprintów",
        };
      } else if (distance?.includes("400m") || distance?.includes("800m")) {
        return {
          series: "BY_RESULT",
          lane: "WA_400M_800M",
          description: "Zalecane dla 400m/800m",
        };
      } else if (distance?.includes("1500m") || distance?.includes("5000m")) {
        return {
          series: "BY_RESULT",
          lane: "WATERFALL",
          description: "Zalecane dla biegów długich",
        };
      }
    } else if (eventType === "FIELD") {
      return {
        series: "BY_RESULT",
        lane: "BEST_TO_WORST",
        description: "Zalecane dla konkurencji technicznych",
      };
    }

    return {
      series: "BY_RESULT",
      lane: "WA_SPRINTS_STRAIGHT",
      description: "Ustawienia domyślne",
    };
  };

  const recommended = currentEvent
    ? getRecommendedMethods(currentEvent.type, currentEvent.distance)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Zaawansowane rozstawienie zawodników
          </h2>
          <p className="text-gray-600">
            Profesjonalne metody rozstawiania zgodne ze standardami World
            Athletics
          </p>
        </div>
      </div>

      {/* Wybór wydarzenia i rundy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Podstawowe ustawienia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-select">Wydarzenie</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger id="event-select">
                  <SelectValue placeholder="Wybierz wydarzenie" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {formatEventName(event)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="round-select">Runda</Label>
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger id="round-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roundLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEvent && participants && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">
                      {participants.totalParticipants} zawodników
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    w wydarzeniu: {formatEventName(currentEvent!)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metody rozstawiania */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Metody rozstawiania
            </CardTitle>
            {recommended && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Crown className="w-4 h-4" />
                {recommended.description}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Zalecane ustawienia */}
            {recommended && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">
                      Zalecane ustawienia dla tej konkurencji
                    </h4>
                    <p className="text-sm text-green-600 mt-1">
                      {getMethodDescription(
                        recommended.series,
                        recommended.lane
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSeriesMethod(recommended.series);
                      setLaneMethod(recommended.lane);
                    }}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Użyj zalecanych
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Podział na serie */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    1. Podział na serie/grupy
                  </h3>
                </div>

                <div>
                  <Label htmlFor="series-method">Metoda podziału</Label>
                  <Select value={seriesMethod} onValueChange={setSeriesMethod}>
                    <SelectTrigger id="series-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(seriesMethods).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  <strong>Opis:</strong>{" "}
                  {getSeriesMethodDescription(seriesMethod)}
                </div>
              </div>

              {/* Przypisanie torów */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold">
                    2. Przypisanie torów
                  </h3>
                </div>

                <div>
                  <Label htmlFor="lane-method">Metoda przypisania</Label>
                  <Select value={laneMethod} onValueChange={setLaneMethod}>
                    <SelectTrigger id="lane-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(laneMethods).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  <strong>Opis:</strong> {getLaneMethodDescription(laneMethod)}
                </div>
              </div>
            </div>

            {/* Dodatkowe opcje */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mb-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showAdvanced ? "Ukryj" : "Pokaż"} opcje zaawansowane
              </Button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="max-lanes">Liczba torów</Label>
                    <Input
                      id="max-lanes"
                      type="number"
                      value={maxLanes}
                      onChange={(e) =>
                        setMaxLanes(parseInt(e.target.value) || 8)
                      }
                      min={4}
                      max={10}
                    />
                  </div>

                  <div>
                    <Label htmlFor="heats-count">
                      Liczba serii (opcjonalnie)
                    </Label>
                    <Input
                      id="heats-count"
                      type="number"
                      value={heatsCount || ""}
                      onChange={(e) =>
                        setHeatsCount(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="Auto"
                      min={1}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMaxLanes(8);
                        setHeatsCount(undefined);
                      }}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Przycisk rozstawienia */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAdvancedAssign}
                disabled={
                  advancedAutoAssignMutation.isPending || !selectedEvent
                }
                size="lg"
                className="px-8"
              >
                {advancedAutoAssignMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rozstawianie...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Rozstaw zawodników
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podgląd wyników */}
      {currentHeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Utworzone serie -{" "}
              {roundLabels[selectedRound as keyof typeof roundLabels]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {currentHeats.map(
                (heat: {
                  id: string;
                  heatNumber: number;
                  assignments: Array<{
                    lane: number;
                    athlete: { firstName: string; lastName: string };
                    seedTime?: string;
                  }>;
                }) => (
                  <div key={heat.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Seria {heat.heatNumber}</h4>
                      <Badge variant="outline">
                        {heat.assignments.length}/8 torów
                      </Badge>
                    </div>

                    <div className="grid grid-cols-8 gap-2">
                      {Array.from({ length: 8 }, (_: any, index: number) => {
                        const lane = index + 1;
                        const assignment = heat.assignments.find(
                          (a) => a.lane === lane
                        );

                        return (
                          <div
                            key={lane}
                            className={`p-2 rounded text-center text-xs ${
                              assignment
                                ? "bg-blue-100 border border-blue-300"
                                : "bg-gray-100 border border-gray-300"
                            }`}
                          >
                            <div className="font-bold">Tor {lane}</div>
                            {assignment ? (
                              <div className="mt-1">
                                <div className="font-medium">
                                  {assignment.athlete.firstName.charAt(0)}.{" "}
                                  {assignment.athlete.lastName}
                                </div>
                                {assignment.seedTime && (
                                  <div className="text-gray-600">
                                    {assignment.seedTime}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 mt-1">Pusty</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Funkcje pomocnicze do opisów metod
function getSeriesMethodDescription(method: string): string {
  const descriptions: Record<string, string> = {
    ALPHABETICAL_NUMBER:
      "Zawodnicy są dzieleni na serie według numerów startowych w kolejności rosnącej.",
    ALPHABETICAL_NAME:
      "Zawodnicy są dzieleni na serie alfabetycznie według nazwisk.",
    ROUND_ROBIN:
      "Zawodnicy są przypisywani do serii po kolei (1→2→3→1→2→3...).",
    ZIGZAG: "Najlepsi zawodnicy są rozdzielani metodą zygzaka między serie.",
    BY_RESULT:
      "Zawodnicy są dzieleni na serie według czasów/wyników (najlepsi w ostatniej serii).",
    BY_RESULT_INDOOR:
      "Specjalna metoda dla zawodów halowych - pary najlepszych w różnych seriach.",
    SEED_TIME: "Standardowy podział według czasów zgłoszeniowych.",
    RANDOM: "Losowy podział na serie.",
  };

  return descriptions[method] || "Opis niedostępny.";
}

function getLaneMethodDescription(method: string): string {
  const descriptions: Record<string, string> = {
    BEST_TO_WORST: "Najlepszy zawodnik na torze 1, drugi na torze 2, itd.",
    WORST_TO_BEST:
      "Najgorszy zawodnik na torze 1, najlepszy na ostatnim torze.",
    HALF_AND_HALF:
      "Najlepsi 4 na torach środkowych (3-6), pozostali na zewnętrznych (1-2, 7-8).",
    PAIRS:
      "Zawodnicy w parach: najlepsza para na torach 4-5, druga na 3-6, itd.",
    PAIRS_INDOOR:
      "Specjalne pary dla hali - najlepsza para na zewnętrznych torach.",
    STANDARD_OUTSIDE: "Najlepszy na torze 1, kolejni na torach 2, 3, 4...",
    STANDARD_INSIDE: "Najlepszy na torze 8, kolejni na torach 7, 6, 5...",
    WATERFALL: "Najlepszy najbliżej wewnętrznej strony bieżni (tor 1).",
    WATERFALL_REVERSE: "Najlepszy najbliżej zewnętrznej strony bieżni (tor 8).",
    WA_HALVES_AND_PAIRS:
      "World Athletics: najlepsi 1-4 na torach 3-6, 5-6 na 7-8, 7-8 na 1-2.",
    WA_SPRINTS_STRAIGHT:
      "World Athletics dla sprintów: najlepsi 1-4 na torach 3-6, pary na 2,7 i 1,8.",
    WA_200M:
      "World Athletics dla 200m: najlepsi 1-3 na torach 5-7, 4-6 na 3,4,8, 7-8 na 1-2.",
    WA_400M_800M:
      "World Athletics dla 400m/800m: najlepsi 1-4 na torach 4-7, pary na 3,8 i 1,2.",
    WA_9_LANES:
      "World Athletics dla 9 torów: najlepsi 1-3 na torach 4-6, pary na kolejnych.",
    RANDOM: "Losowe przypisanie torów.",
    SEED_TIME: "Standardowe rozstawienie finałowe (najlepszy w środku).",
  };

  return descriptions[method] || "Opis niedostępny.";
}
