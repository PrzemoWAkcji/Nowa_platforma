"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StartlistPDFGenerator } from "@/components/startlist/StartlistPDFGenerator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompetition } from "@/hooks/useCompetitions";
import { useEvent } from "@/hooks/useEvents";
import {
  useDeleteRegistration,
  useRegistrations,
  useUpdateRegistration,
} from "@/hooks/useRegistrations";
import { Heat, HeatLane } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Hash,
  Save,
  Settings,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// Używamy globalnych typów Heat i HeatLane z @/types

export default function EventStartlistPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const eventId = params.eventId as string;

  // State
  const [heats, setHeats] = useState<Heat[]>([]);
  const [assignmentMethod, setAssignmentMethod] = useState<"auto" | "manual">(
    "auto"
  );
  const [lanesPerHeat, setLanesPerHeat] = useState(8);
  const [editingBibNumber, setEditingBibNumber] = useState<string | null>(null);
  const [tempBibNumber, setTempBibNumber] = useState("");

  // Hooks
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: competition } = useCompetition(competitionId);
  const { data: registrations, refetch: refetchRegistrations } =
    useRegistrations({ eventId });
  const updateRegistrationMutation = useUpdateRegistration();
  const deleteRegistrationMutation = useDeleteRegistration();
  // const deleteEventMutation = useDeleteEvent(); // Obecnie nieużywane

  // Determine if this is a field event
  const isFieldEvent = event?.type === "FIELD";

  // Generate heats/startlist
  const handleGenerateHeats = () => {
    if (
      !registrations ||
      !Array.isArray(registrations) ||
      registrations.length === 0
    )
      return;

    if (isFieldEvent) {
      // For field events, create one heat with all athletes
      const lanes: HeatLane[] = registrations.map((reg, index) => ({
        id: `lane-${index + 1}`,
        heatId: "final",
        laneNumber: index + 1,
        athleteId: reg.athlete?.id,
        registrationId: reg.id,
        athlete: {
          id: reg.athlete?.id || "",
          firstName: reg.athlete?.firstName || "",
          lastName: reg.athlete?.lastName || "",
          club: reg.athlete?.club,
        },
        registration: {
          id: reg.id,
          bibNumber: reg.bibNumber,
          seedTime: reg.seedTime,
        },
        seedTime: reg.seedTime,
      }));

      setHeats([
        {
          id: "final",
          eventId: eventId,
          heatNumber: 1,
          lanes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } else {
      // For track events, create multiple heats
      const athletesPerHeat = lanesPerHeat;
      const numberOfHeats = Math.ceil(registrations.length / athletesPerHeat);
      const newHeats: Heat[] = [];

      for (let heatNum = 1; heatNum <= numberOfHeats; heatNum++) {
        const startIndex = (heatNum - 1) * athletesPerHeat;
        const endIndex = Math.min(
          startIndex + athletesPerHeat,
          registrations.length
        );
        const heatRegistrations = registrations.slice(startIndex, endIndex);

        const lanes: HeatLane[] = Array.from(
          { length: lanesPerHeat },
          (_, laneIndex) => {
            const reg = heatRegistrations[laneIndex];
            return {
              id: `heat-${heatNum}-lane-${laneIndex + 1}`,
              heatId: `heat-${heatNum}`,
              laneNumber: laneIndex + 1,
              athleteId: reg?.athlete?.id,
              registrationId: reg?.id,
              athlete: reg
                ? {
                    id: reg.athlete?.id || "",
                    firstName: reg.athlete?.firstName || "",
                    lastName: reg.athlete?.lastName || "",
                    club: reg.athlete?.club,
                  }
                : undefined,
              registration: reg
                ? {
                    id: reg.id,
                    bibNumber: reg.bibNumber,
                    seedTime: reg.seedTime,
                  }
                : undefined,
              seedTime: reg?.seedTime,
            };
          }
        );

        newHeats.push({
          id: `heat-${heatNum}`,
          eventId: eventId,
          heatNumber: heatNum,
          lanes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setHeats(newHeats);
    }
  };

  const handleClearHeats = () => {
    setHeats([]);
  };

  const handleAutoAssignBibNumbers = async () => {
    if (!registrations || !Array.isArray(registrations)) return;

    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];
      if (!registration.bibNumber) {
        try {
          await updateRegistrationMutation.mutateAsync({
            id: registration.id,
            data: {
              bibNumber: (i + 1).toString(),
            },
          });
        } catch (error) {
          
        }
      }
    }
    refetchRegistrations();
  };

  const handleEditBibNumber = (
    registrationId: string,
    currentBibNumber: string
  ) => {
    setEditingBibNumber(registrationId);
    setTempBibNumber(currentBibNumber);
  };

  const handleSaveBibNumber = async (registrationId: string) => {
    try {
      await updateRegistrationMutation.mutateAsync({
        id: registrationId,
        data: {
          bibNumber: tempBibNumber,
        },
      });
      setEditingBibNumber(null);
      setTempBibNumber("");
      refetchRegistrations();
    } catch (error) {
      
    }
  };

  const handleCancelEditBibNumber = () => {
    setEditingBibNumber(null);
    setTempBibNumber("");
  };

  const handleDeleteRegistration = async (
    registrationId: string,
    athleteName: string
  ) => {
    if (
      confirm(`Czy na pewno chcesz usunąć zgłoszenie zawodnika ${athleteName}?`)
    ) {
      try {
        await deleteRegistrationMutation.mutateAsync(registrationId);
        refetchRegistrations();
        // Clear heats if registration was deleted
        setHeats([]);
      } catch (error) {
        
      }
    }
  };

  const removeAthleteFromLane = (heatId: string, laneNumber: number) => {
    setHeats((prevHeats) =>
      prevHeats.map((heat) =>
        heat.id === heatId
          ? {
              ...heat,
              lanes: heat.lanes.map((lane) =>
                lane.laneNumber === laneNumber
                  ? { ...lane, athlete: undefined }
                  : lane
              ),
            }
          : heat
      )
    );
  };

  if (eventLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Ładowanie...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Nie znaleziono konkurencji</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <p className="text-gray-600">
                {event.category} - {event.gender}
              </p>
            </div>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Typ konkurencji
                  </p>
                  <p className="text-lg font-semibold">
                    {isFieldEvent ? "Techniczna" : "Biegowa"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Zgłoszenia
                  </p>
                  <p className="text-lg font-semibold">
                    {Array.isArray(registrations) ? registrations.length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-semibold">
                    {heats.length > 0 ? "Gotowa" : "Do konfiguracji"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full space-y-6">
          {/* Sekcja konfiguracji i drukowania */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Konfiguracja po lewej */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Konfiguracja listy startowej
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isFieldEvent ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        To jest konkurencja techniczna. Wszyscy zawodnicy będą
                        przypisani do jednego finału w kolejności według wyników
                        kwalifikacyjnych.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="assignment-method">
                          Metoda przypisywania
                        </Label>
                        <Select
                          value={assignmentMethod}
                          onValueChange={(value) =>
                            setAssignmentMethod(value as "auto" | "manual")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz metodę" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Automatyczne</SelectItem>
                            <SelectItem value="manual">Ręczne</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {!isFieldEvent && (
                        <div>
                          <Label htmlFor="lanes-per-heat">
                            Liczba torów na serię
                          </Label>
                          <Select
                            value={lanesPerHeat.toString()}
                            onValueChange={(value) =>
                              setLanesPerHeat(parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[4, 6, 8, 10].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} torów
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handleGenerateHeats}
                        disabled={
                          !registrations ||
                          !Array.isArray(registrations) ||
                          registrations.length === 0
                        }
                        className="w-full"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        {isFieldEvent
                          ? "Generuj listę startową"
                          : "Generuj serie"}
                      </Button>

                      {heats.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={handleClearHeats}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Wyczyść {isFieldEvent ? "listę" : "serie"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Drukowanie po prawej */}
            <div>
              {competition && (
                <StartlistPDFGenerator
                  event={event}
                  competition={competition}
                  heats={heats}
                  registrations={
                    Array.isArray(registrations)
                      ? registrations.map((reg) => ({
                          id: reg.id,
                          athlete: {
                            firstName: reg.athlete?.firstName || "",
                            lastName: reg.athlete?.lastName || "",
                            club: reg.athlete?.club,
                            yearOfBirth: reg.athlete?.dateOfBirth
                              ? new Date(reg.athlete.dateOfBirth).getFullYear()
                              : undefined,
                          },
                          seedTime: reg.seedTime,
                          bibNumber: reg.bibNumber,
                          personalBest: undefined,
                          seasonBest: undefined,
                        }))
                      : []
                  }
                  isFieldEvent={isFieldEvent}
                />
              )}
            </div>
          </div>

          {/* Lista zawodników */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Zgłoszeni zawodnicy</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoAssignBibNumbers}
                  disabled={updateRegistrationMutation.isPending}
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Auto-numeracja
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {registrations &&
              Array.isArray(registrations) &&
              registrations.length > 0 ? (
                <div className="space-y-4">
                  {registrations.map((registration, index) => (
                    <div
                      key={registration.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {registration.athlete?.firstName}{" "}
                            {registration.athlete?.lastName}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {registration.athlete?.club && (
                              <span>Klub: {registration.athlete.club}</span>
                            )}
                            <div className="flex items-center gap-2">
                              <span>Nr:</span>
                              {editingBibNumber === registration.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={tempBibNumber}
                                    onChange={(e) =>
                                      setTempBibNumber(e.target.value)
                                    }
                                    className="w-16 h-6 text-xs"
                                    placeholder="Nr"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                      handleSaveBibNumber(registration.id)
                                    }
                                    disabled={
                                      updateRegistrationMutation.isPending
                                    }
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleCancelEditBibNumber}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleEditBibNumber(
                                      registration.id,
                                      registration.bibNumber || ""
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                >
                                  {registration.bibNumber || "Brak"}
                                </button>
                              )}
                            </div>
                            {registration.seedTime && (
                              <span>Czas: {registration.seedTime}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            registration.status === "CONFIRMED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {registration.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteRegistration(
                              registration.id,
                              `${registration.athlete?.firstName} ${registration.athlete?.lastName}`
                            )
                          }
                          disabled={deleteRegistrationMutation.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Brak zgłoszeń na tę konkurencję
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista startowa / Serie */}
          {heats.length > 0 && (
            <div className="space-y-6">
              {heats.map((heat) => (
                <Card key={heat.id}>
                  <CardHeader>
                    <CardTitle>
                      {isFieldEvent
                        ? `Finał - ${event?.name}`
                        : `Seria ${heat.heatNumber}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isFieldEvent ? (
                      // Wyświetlanie dla konkurencji technicznych - lista zawodników
                      <div className="space-y-3">
                        {heat.lanes.map((lane) => (
                          <div
                            key={lane.laneNumber}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {lane.laneNumber}
                                </span>
                              </div>
                              {lane.athlete ? (
                                <div>
                                  <p className="font-medium">
                                    {lane.athlete.firstName}{" "}
                                    {lane.athlete.lastName}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {lane.athlete.club && (
                                      <span>Klub: {lane.athlete.club}</span>
                                    )}
                                    {lane.registration?.bibNumber && (
                                      <span>
                                        Nr: {lane.registration.bibNumber}
                                      </span>
                                    )}
                                    {lane.seedTime && (
                                      <span>Wynik: {lane.seedTime}</span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400">
                                  Brak przypisanego zawodnika
                                </div>
                              )}
                            </div>
                            {assignmentMethod === "manual" && lane.athlete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removeAthleteFromLane(
                                    heat.id,
                                    lane.laneNumber
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Wyświetlanie dla biegów - tory
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {heat.lanes.map((lane) => (
                          <div
                            key={lane.laneNumber}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                Tor {lane.laneNumber}
                              </span>
                              {lane.athlete &&
                                assignmentMethod === "manual" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      removeAthleteFromLane(
                                        heat.id,
                                        lane.laneNumber
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                            {lane.athlete ? (
                              <div>
                                <p className="font-medium text-sm">
                                  {lane.athlete.firstName}{" "}
                                  {lane.athlete.lastName}
                                </p>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {lane.athlete.club && (
                                    <p>Klub: {lane.athlete.club}</p>
                                  )}
                                  {lane.registration?.bibNumber && (
                                    <p>Nr: {lane.registration.bibNumber}</p>
                                  )}
                                  {lane.seedTime && (
                                    <p>Czas: {lane.seedTime}</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">
                                Pusty tor
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
