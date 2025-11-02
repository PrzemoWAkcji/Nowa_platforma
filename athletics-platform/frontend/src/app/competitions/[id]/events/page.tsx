"use client";

import { GenerateIndividualEventsDialog } from "@/components/combined-events/GenerateIndividualEventsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompetition } from "@/hooks/useCompetitions";
import { useDeleteEvent, useEvents } from "@/hooks/useEvents";
import { Event, EventType, Gender } from "@/types";
import { Clock, Edit, Plus, Trash2, Trophy, Users, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const eventTypeLabels: Record<EventType, string> = {
  TRACK: "Bieżnia",
  FIELD: "Rzuty/Skoki",
  ROAD: "Szosa",
  COMBINED: "Wielobój",
  RELAY: "Sztafeta",
};

const genderLabels: Record<Gender, string> = {
  MALE: "Mężczyźni",
  FEMALE: "Kobiety",
  MIXED: "Mieszane",
};

export default function CompetitionEventsPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const { data: competition, isLoading: competitionLoading } =
    useCompetition(competitionId);
  const {
    data: events,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useEvents({ competitionId });
  const deleteEvent = useDeleteEvent();

  const handleAddEvent = () => {
    router.push(`/competitions/${competitionId}/events/create`);
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/competitions/${competitionId}/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async (event: Event) => {
    if (
      confirm(
        `Czy na pewno chcesz usunąć konkurencję "${event.name}"? Ta operacja jest nieodwracalna.`
      )
    ) {
      try {
        await deleteEvent.mutateAsync(event.id);
        toast.success("Konkurencja została usunięta");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Błąd podczas usuwania konkurencji"
        );
      }
    }
  };

  const handleViewStartList = (eventId: string) => {
    router.push(`/competitions/${competitionId}/startlists/${eventId}`);
  };

  const handleGenerateSuccess = () => {
    setShowGenerateDialog(false);
    refetchEvents();
    toast.success("Konkurencje składowe zostały wygenerowane!");
  };

  // Sprawdź czy są konkurencje wielobojowe
  const combinedEvents =
    events?.filter((event) => event.type === "COMBINED") || [];
  const hasCombinedEvents = combinedEvents.length > 0;

  if (competitionLoading || eventsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie konkurencji...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Zawody nie zostały znalezione
          </h1>
          <Button onClick={() => router.push("/competitions")}>
            Powrót do listy zawodów
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Przycisk wstecz na górze */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/competitions/${competitionId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Wstecz
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {competition.name}
            </h1>
            <p className="text-gray-600 mt-2">Zarządzanie konkurencjami</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/competitions/${competitionId}`)}
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Powrót do zawodów
            </Button>
            {hasCombinedEvents && (
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(true)}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Generuj konkurencje składowe
              </Button>
            )}
            <Button onClick={handleAddEvent}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj konkurencję
            </Button>
          </div>
        </div>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Brak konkurencji
              </h3>
              <p className="text-gray-600 mb-6">
                Nie dodano jeszcze żadnych konkurencji do tych zawodów.
              </p>
              <Button onClick={handleAddEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj pierwszą konkurencję
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewStartList(event.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">
                        {eventTypeLabels[event.type]}
                      </Badge>
                      <Badge variant="outline">
                        {genderLabels[event.gender]}
                      </Badge>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>
                      {event._count?.registrationEvents || 0} uczestników
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span>{event._count?.results || 0} wyników</span>
                  </div>
                  {event.scheduledTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(event.scheduledTime).toLocaleString("pl-PL")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog do generowania konkurencji składowych */}
      <GenerateIndividualEventsDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        competitionId={competitionId}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}
