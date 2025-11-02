"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { PrintAllStartlists } from "@/components/startlist/PrintAllStartlists";
import { StartlistImport } from "@/components/startlists/StartlistImport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompetition } from "@/hooks/useCompetitions";
import { useDeleteEvent } from "@/hooks/useEvents";
import { useAssignBibNumbers } from "@/hooks/useRegistrations";
import { Event } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertCircle,
  Clock,
  Hash,
  Printer,
  Ruler,
  Target,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

// Funkcja do pobierania godziny z programu minutowego
const getScheduledTimeFromEvent = (event: Event): string | null => {
  if (event.scheduleItems && event.scheduleItems.length > 0) {
    // Pobierz pierwszą godzinę z programu minutowego (posortowane według scheduledTime)
    const firstScheduleItem = event.scheduleItems[0];
    return firstScheduleItem.scheduledTime;
  }
  // Fallback na bezpośrednią godzinę w konkurencji
  return event.scheduledTime || null;
};

// Funkcja do formatowania godziny
const formatScheduledTime = (timeString: string): string => {
  try {
    const date = new Date(timeString);
    return format(date, "HH:mm", { locale: pl });
  } catch (error) {
    return timeString;
  }
};

// Funkcja do wykrywania konkurencji sztafetowych po nazwie
const isRelayEvent = (eventName: string): boolean => {
  const relayKeywords = [
    "4x100",
    "4x400",
    "4x200",
    "4x800",
    "4x1500",
    "sztafeta",
    "relay",
  ];
  return relayKeywords.some((keyword) =>
    eventName.toLowerCase().includes(keyword.toLowerCase())
  );
};

export default function StartlistsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const competitionId = params.id as string;
  const defaultTab = searchParams.get("tab") === "import" ? "import" : "manage";
  const printAll = searchParams.get("printAll") === "true";

  const deleteEventMutation = useDeleteEvent();
  const assignBibNumbersMutation = useAssignBibNumbers();

  const { data: competition, isLoading } = useCompetition(competitionId);

  // Stan sortowania
  const [sortBy, setSortBy] = useState<"name" | "scheduledTime" | "distance">(
    "name"
  );

  // Funkcja sortowania wydarzeń
  const getSortedEvents = (events: Event[]) => {
    return [...events].sort((a, b) => {
      switch (sortBy) {
        case "scheduledTime":
          const timeA = getScheduledTimeFromEvent(a);
          const timeB = getScheduledTimeFromEvent(b);

          if (!timeA && !timeB) return 0;
          if (!timeA) return 1;
          if (!timeB) return -1;

          return new Date(timeA).getTime() - new Date(timeB).getTime();

        case "distance":
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;

          // Funkcja do konwersji dystansu na metry
          const parseDistance = (distance: string): number => {
            const cleanDistance = distance.toLowerCase().trim();

            // Wyciągnij liczbę z tekstu
            const numberMatch = cleanDistance.match(/(\d+(?:\.\d+)?)/);
            if (!numberMatch) return 0;

            const number = parseFloat(numberMatch[1]);

            // Konwertuj na metry w zależności od jednostki
            if (cleanDistance.includes("km")) {
              return number * 1000; // km na metry
            } else if (
              cleanDistance.includes("m") ||
              cleanDistance.includes("metr")
            ) {
              return number; // już w metrach
            } else {
              // Jeśli brak jednostki, zakładamy metry
              return number;
            }
          };

          const distanceA = parseDistance(a.distance);
          const distanceB = parseDistance(b.distance);
          return distanceA - distanceB;

        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const handleShowStartlist = (
    eventId: string,
    eventType: string,
    eventName: string
  ) => {
    if (eventType === "RELAY" || isRelayEvent(eventName)) {
      router.push(`/competitions/${competitionId}/relay-events/${eventId}`);
    } else {
      router.push(`/competitions/${competitionId}/startlists/${eventId}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      confirm(
        `Czy na pewno chcesz usunąć tę konkurencję? Ta operacja jest nieodwracalna.`
      )
    ) {
      try {
        await deleteEventMutation.mutateAsync(eventId);
        // Cache zostanie automatycznie invalidowany przez hook
        // Nie ma potrzeby przekierowywania - lista się odświeży automatycznie
      } catch (error) {
        alert("Wystąpił błąd podczas usuwania konkurencji");
      }
    }
  };

  const handleAssignBibNumbers = async () => {
    const startingNumber = prompt(
      "Podaj numer startowy, od którego rozpocząć przydzielanie (domyślnie 1):",
      "1"
    );
    if (startingNumber === null) return; // Użytkownik anulował

    const number = parseInt(startingNumber) || 1;

    if (
      confirm(
        `Czy na pewno chcesz automatycznie przydzielić numery startowe wszystkim potwierdzonym zawodnikom, rozpoczynając od numeru ${number}?`
      )
    ) {
      try {
        const result = await assignBibNumbersMutation.mutateAsync({
          competitionId,
          startingNumber: number,
        });
        alert(result.message);
      } catch (error) {
        alert("Wystąpił błąd podczas przydzielania numerów startowych");
      }
    }
  };

  // Jeśli printAll=true, wyświetl komponent drukowania
  if (printAll && competition) {
    return (
      <PrintAllStartlists
        competition={competition}
        competitionId={competitionId}
      />
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie zawodów...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!competition) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Nie znaleziono zawodów</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.back()}
            >
              Powrót
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Listy startowe"
          description={competition.name}
          backButtonFallback={`/competitions/${competitionId}`}
        >
          <Button
            onClick={() =>
              router.push(
                `/competitions/${competitionId}/startlists?printAll=true`
              )
            }
            className="bg-green-600 hover:bg-green-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Drukuj wszystkie listy startowe
          </Button>
        </PageHeader>

        {/* Main Content */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList>
            <TabsTrigger value="manage">Zarządzanie listami</TabsTrigger>
            <TabsTrigger value="import">Import CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Listy startowe według konkurencji</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/competitions/${competitionId}/startlists?printAll=true`
                        )
                      }
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Drukuj wszystkie listy startowe
                    </Button>
                    <Button
                      onClick={handleAssignBibNumbers}
                      disabled={assignBibNumbersMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      {assignBibNumbersMutation.isPending
                        ? "Przydzielanie..."
                        : "Przydziel numery startowe"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {competition.events && competition.events.length > 0 ? (
                  <div className="space-y-4">
                    {/* Przyciski sortowania */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Sortuj według:
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant={sortBy === "name" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortBy("name")}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Nazwa
                        </Button>
                        <Button
                          variant={
                            sortBy === "scheduledTime" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSortBy("scheduledTime")}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Godzina rozpoczęcia
                        </Button>
                        <Button
                          variant={
                            sortBy === "distance" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSortBy("distance")}
                        >
                          <Ruler className="h-4 w-4 mr-1" />
                          Dystans
                        </Button>
                      </div>
                    </div>

                    {getSortedEvents(competition.events).map((event) => {
                      const isRelay =
                        event.type === "RELAY" || isRelayEvent(event.name);
                      return (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all"
                          onClick={() =>
                            handleShowStartlist(
                              event.id,
                              event.type,
                              event.name
                            )
                          }
                        >
                          <div className="flex items-center space-x-3">
                            {isRelay ? (
                              <Users className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Trophy className="h-5 w-5 text-gray-600" />
                            )}
                            <div>
                              <h3 className="font-medium">{event.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>
                                  Typ: {isRelay ? "Sztafeta" : event.type}
                                </span>
                                <span>
                                  Kategoria:{" "}
                                  {(() => {
                                    // Sprawdź czy w nazwie wydarzenia jest już kategoria wiekowa
                                    const eventName = event.name.toLowerCase();

                                    // Wyciągnij kategorię wiekową z nazwy
                                    const ageMatch = eventName.match(
                                      /\b(u\d+|[km]\s*u\d+|m\d+|k\d+|młodzik|junior|senior|master|weteran)\b/
                                    );

                                    if (
                                      ageMatch &&
                                      event.category === "WIELE"
                                    ) {
                                      // Jeśli znaleziono kategorię w nazwie i event.category to "WIELE", użyj kategorii z nazwy
                                      return ageMatch[1].toUpperCase();
                                    }

                                    return event.category;
                                  })()}
                                </span>
                                <span>Płeć: {event.gender}</span>
                                <span>
                                  {isRelay ? "Zespoły" : "Zgłoszenia"}:{" "}
                                  {isRelay
                                    ? event._count?.relayTeamRegistrations || 0
                                    : event._count?.registrationEvents || 0}
                                </span>
                                {event.distance && (
                                  <span className="flex items-center gap-1 text-green-600 font-medium">
                                    <Ruler className="h-3 w-3" />
                                    {event.distance}
                                  </span>
                                )}
                                {(() => {
                                  const scheduledTime =
                                    getScheduledTimeFromEvent(event);
                                  return scheduledTime ? (
                                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                                      <Clock className="h-3 w-3" />
                                      {formatScheduledTime(scheduledTime)}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          </div>
                          <div
                            className="flex gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={deleteEventMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deleteEventMutation.isPending
                                ? "Usuwanie..."
                                : "Usuń"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Brak konkurencji w zawodach</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link
                        href={`/competitions/${competitionId}/events/create`}
                      >
                        Dodaj konkurencje
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <StartlistImport competitionId={competitionId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
