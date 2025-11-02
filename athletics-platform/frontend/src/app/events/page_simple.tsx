"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useEvents } from "@/hooks/useEvents";
import { EventType, Gender } from "@/types";
import { Calendar, Clock, Plus, Ruler, Target, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const eventTypeLabels = {
  [EventType.TRACK]: "Bieżnia",
  [EventType.FIELD]: "Rzuty/Skoki",
  [EventType.ROAD]: "Ulica",
  [EventType.COMBINED]: "Wielobój",
  [EventType.RELAY]: "Sztafeta",
};

const genderLabels = {
  [Gender.MALE]: "M",
  [Gender.FEMALE]: "K",
  [Gender.MIXED]: "Mix",
};

export default function EventsPage() {
  const [typeFilter, setTypeFilter] = useState<EventType | "ALL">("ALL");
  const [genderFilter, setGenderFilter] = useState<Gender | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "scheduledTime" | "distance">(
    "name"
  );

  const { data: events, isLoading, error } = useEvents();

  const filteredAndSortedEvents =
    events
      ?.filter((event) => {
        const matchesType = typeFilter === "ALL" || event.type === typeFilter;
        const matchesGender =
          genderFilter === "ALL" || event.gender === genderFilter;

        return matchesType && matchesGender;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "scheduledTime":
            if (!a.scheduledTime && !b.scheduledTime) return 0;
            if (!a.scheduledTime) return 1;
            if (!b.scheduledTime) return -1;
            return (
              new Date(a.scheduledTime).getTime() -
              new Date(b.scheduledTime).getTime()
            );

          case "distance":
            if (!a.distance && !b.distance) return 0;
            if (!a.distance) return 1;
            if (!b.distance) return -1;

            const distanceA =
              parseFloat(a.distance.replace(/[^\d.]/g, "")) || 0;
            const distanceB =
              parseFloat(b.distance.replace(/[^\d.]/g, "")) || 0;
            return distanceA - distanceB;

          case "name":
          default:
            return a.name.localeCompare(b.name);
        }
      }) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie konkurencji...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Błąd podczas ładowania konkurencji</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Spróbuj ponownie
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
          title="Konkurencje"
          description="Zarządzaj konkurencjami w zawodach"
        >
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nowa konkurencja
            </Button>
          </Link>
        </PageHeader>

        {/* Filters and Sorting */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                variant={typeFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("ALL")}
              >
                Wszystkie typy
              </Button>
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(type as EventType)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant={genderFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenderFilter("ALL")}
              >
                Wszystkie płcie
              </Button>
              {Object.entries(genderLabels).map(([gender, label]) => (
                <Button
                  key={gender}
                  variant={genderFilter === gender ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGenderFilter(gender as Gender)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-4">
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
                variant={sortBy === "scheduledTime" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("scheduledTime")}
              >
                <Clock className="h-4 w-4 mr-1" />
                Godzina rozpoczęcia
              </Button>
              <Button
                variant={sortBy === "distance" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("distance")}
              >
                <Ruler className="h-4 w-4 mr-1" />
                Dystans
              </Button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredAndSortedEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {typeFilter !== "ALL" || genderFilter !== "ALL"
                    ? "Brak wyników"
                    : "Brak konkurencji"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {typeFilter !== "ALL" || genderFilter !== "ALL"
                    ? "Spróbuj zmienić kryteria filtrowania."
                    : "Nie ma jeszcze żadnych konkurencji. Utwórz pierwszą konkurencję."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents.map((event) => (
                <Card
                  key={event.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">
                        {eventTypeLabels[event.type]}
                      </Badge>
                      <Badge variant="outline">
                        {genderLabels[event.gender]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {event.scheduledTime && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <strong>Godzina:</strong>&nbsp;
                          {new Date(event.scheduledTime).toLocaleString(
                            "pl-PL",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            }
                          )}
                        </div>
                      )}
                      {event.distance && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Ruler className="h-4 w-4 mr-2" />
                          <strong>Dystans:</strong>&nbsp;{event.distance}
                        </div>
                      )}
                      {event._count && (
                        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event._count.registrationEvents} rejestracji
                          </div>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {event._count.results} wyników
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Badge
                        className={`${
                          event.unit === "TIME"
                            ? "bg-blue-100 text-blue-800"
                            : event.unit === "DISTANCE"
                              ? "bg-green-100 text-green-800"
                              : event.unit === "HEIGHT"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {event.unit}
                      </Badge>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          Zobacz szczegóły
                        </Button>
                      </Link>
                    </div>
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
