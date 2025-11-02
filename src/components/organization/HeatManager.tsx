"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heat } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Settings,
  Shuffle,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AdvancedHeatManager from "./AdvancedHeatManager";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  category: string;
}

interface Registration {
  id: string;
  athlete: Athlete;
  seedTime?: string;
  bibNumber?: string;
}

interface HeatAssignment {
  id: string;
  lane?: number;
  seedTime?: string;
  seedRank?: number;
  assignmentMethod: string;
  isPresent: boolean;
  isDNS: boolean;
  registration: Registration;
}

// Używamy globalnego typu Heat z @/types

interface Event {
  id: string;
  name: string;
  type: string;
  gender: string;
  category: string;
  distance?: string;
}

interface HeatManagerProps {
  competitionId: string;
}

const roundLabels = {
  QUALIFICATION: "Eliminacje",
  SEMIFINAL: "Półfinał",
  FINAL: "Finał",
  QUALIFICATION_A: "Elim. A",
  QUALIFICATION_B: "Elim. B",
  QUALIFICATION_C: "Elim. C",
};

const assignmentMethodLabels = {
  MANUAL: "Ręczne",
  SEED_TIME: "Według czasów",
  RANDOM: "Losowe",
  SERPENTINE: "Serpentynowe",
  STRAIGHT_FINAL: "Finał bezpośredni",
};

export default function HeatManager({ competitionId }: HeatManagerProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("FINAL");
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
  const { data: heats, isLoading: heatsLoading } = useQuery({
    queryKey: ["heats", selectedEvent],
    queryFn: async () => {
      if (!selectedEvent) return [];
      const response = await fetch(
        `/api/organization/heats/event/${selectedEvent}`
      );
      if (!response.ok) throw new Error("Failed to fetch heats");
      return response.json() as Promise<Heat[]>;
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

  // Automatyczne rozstawienie
  const autoAssignMutation = useMutation({
    mutationFn: async (data: {
      eventId: string;
      round: string;
      method: string;
      maxLanes?: number;
      heatsCount?: number;
    }) => {
      const response = await fetch("/api/organization/heats/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to auto-assign");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heats", selectedEvent] });
      toast.success("Zawodnicy zostali rozstawieni automatycznie");
    },
    onError: () => {
      toast.error("Błąd podczas automatycznego rozstawiania");
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

  const formatAthleteTime = (seedTime?: string) => {
    if (!seedTime) return "Brak czasu";
    return seedTime;
  };

  const handleAutoAssign = (method: string) => {
    if (!selectedEvent) return;

    autoAssignMutation.mutate({
      eventId: selectedEvent,
      round: selectedRound,
      method,
      maxLanes: 20,
    });
  };

  const currentEvent = events?.find((e) => e.id === selectedEvent);
  const currentHeats = heats?.filter((h) => h.round === selectedRound) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Rozstawienie zawodników
          </h2>
          <p className="text-gray-600">
            Zarządzaj seriami i rozstawieniem zawodników
          </p>
        </div>
      </div>

      {/* Tabs dla różnych trybów rozstawiania */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Podstawowe rozstawienie
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Zaawansowane rozstawienie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          {/* Wybór wydarzenia i rundy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Ustawienia rozstawienia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Wydarzenie
                  </label>
                  <Select
                    value={selectedEvent}
                    onValueChange={setSelectedEvent}
                  >
                    <SelectTrigger>
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
                  <label className="block text-sm font-medium mb-2">
                    Runda
                  </label>
                  <Select
                    value={selectedRound}
                    onValueChange={setSelectedRound}
                  >
                    <SelectTrigger>
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
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
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

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoAssign("SEED_TIME")}
                      disabled={autoAssignMutation.isPending}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Według czasów
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoAssign("SERPENTINE")}
                      disabled={autoAssignMutation.isPending}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Serpentynowo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoAssign("RANDOM")}
                      disabled={autoAssignMutation.isPending}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Losowo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Serie */}
          {selectedEvent && (
            <div className="space-y-4">
              {heatsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : currentHeats.length > 0 ? (
                <div className="grid gap-4">
                  {currentHeats.map((heat) => (
                    <Card key={heat.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Seria {heat.heatNumber} -{" "}
                            {
                              roundLabels[
                                heat.round as keyof typeof roundLabels
                              ]
                            }
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {heat.assignments?.length || 0}/
                              {heat.maxLanes || 8} torów
                            </Badge>
                            {heat.isCompleted && (
                              <Badge variant="secondary">Zakończona</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {/* Nagłówek tabeli */}
                          <div className="grid grid-cols-6 gap-4 p-2 bg-gray-50 rounded text-sm font-medium">
                            <div>Tor</div>
                            <div>Zawodnik</div>
                            <div>Klub</div>
                            <div>Czas zgł.</div>
                            <div>Ranking</div>
                            <div>Status</div>
                          </div>

                          {/* Zawodnicy */}
                          {Array.from(
                            { length: heat.maxLanes || 8 },
                            (_, index) => {
                              const lane = index + 1;
                              const assignment = heat.assignments?.find(
                                (a: any) => a.lane === lane
                              );

                              return (
                                <div
                                  key={lane}
                                  className="grid grid-cols-6 gap-4 p-2 border rounded hover:bg-gray-50"
                                >
                                  <div className="font-mono font-semibold">
                                    {lane}
                                  </div>
                                  <div>
                                    {assignment ? (
                                      <div>
                                        <div className="font-medium">
                                          {
                                            assignment.registration.athlete
                                              .firstName
                                          }{" "}
                                          {
                                            assignment.registration.athlete
                                              .lastName
                                          }
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {assignment.registration.bibNumber &&
                                            `#${assignment.registration.bibNumber}`}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic">
                                        Pusty tor
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {assignment && "-"}
                                  </div>
                                  <div className="text-sm">
                                    {assignment &&
                                      formatAthleteTime(assignment.seedTime)}
                                  </div>
                                  <div className="text-sm">
                                    {assignment?.seedRank &&
                                      `#${assignment.seedRank}`}
                                  </div>
                                  <div>
                                    {assignment && (
                                      <div className="flex items-center gap-2">
                                        {assignment.isDNS ? (
                                          <Badge
                                            variant="destructive"
                                            className="text-xs"
                                          >
                                            DNS
                                          </Badge>
                                        ) : assignment.isPresent ? (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Obecny
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            Nieobecny
                                          </Badge>
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {
                                            assignmentMethodLabels[
                                              assignment.assignmentMethod as keyof typeof assignmentMethodLabels
                                            ]
                                          }
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        {heat.notes && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>Uwagi:</strong> {heat.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Brak serii dla wybranej rundy
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Użyj automatycznego rozstawienia lub utwórz serie ręcznie.
                    </p>
                    {participants && participants.totalParticipants > 0 && (
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => handleAutoAssign("SEED_TIME")}>
                          <Target className="w-4 h-4 mr-2" />
                          Rozstaw według czasów
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAutoAssign("SERPENTINE")}
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Rozstaw serpentynowo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!selectedEvent && (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Wybierz wydarzenie
                </h3>
                <p className="text-gray-600">
                  Wybierz wydarzenie z listy powyżej, aby zarządzać
                  rozstawieniem zawodników.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <AdvancedHeatManager competitionId={competitionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
