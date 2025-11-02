"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Pause,
  Play,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ScheduleGeneratorDialog from "./ScheduleGeneratorDialog";

interface ScheduleItem {
  id: string;
  eventId: string;
  scheduledTime: string;
  actualTime?: string;
  duration?: number;
  round: string;
  seriesCount: number;
  finalistsCount?: number;
  status:
    | "SCHEDULED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "DELAYED"
    | "CANCELLED"
    | "POSTPONED";
  notes?: string;
  event: {
    id: string;
    name: string;
    type: string;
    gender: string;
    category: string;
    distance?: string;
  };
}

interface Schedule {
  id: string;
  name: string;
  description?: string;
  isPublished: boolean;
  competitionId: string;
  items: ScheduleItem[];
  competition: {
    id: string;
    name: string;
  };
}

interface ScheduleManagerProps {
  competitionId: string;
}

const statusColors = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  DELAYED: "bg-orange-100 text-orange-800",
  CANCELLED: "bg-red-100 text-red-800",
  POSTPONED: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  SCHEDULED: "Zaplanowane",
  IN_PROGRESS: "W trakcie",
  COMPLETED: "Zakończone",
  DELAYED: "Opóźnione",
  CANCELLED: "Odwołane",
  POSTPONED: "Przełożone",
};

const roundLabels = {
  QUALIFICATION: "Eliminacje",
  SEMIFINAL: "Półfinał",
  FINAL: "Finał",
  QUALIFICATION_A: "Elim. A",
  QUALIFICATION_B: "Elim. B",
  QUALIFICATION_C: "Elim. C",
};

export default function ScheduleManager({
  competitionId,
}: ScheduleManagerProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Pobierz programy minutowe dla zawodów
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", competitionId],
    queryFn: async () => {
      const response = await api.get(
        `/organization/schedules?competitionId=${competitionId}`
      );
      return response.data as Schedule[];
    },
  });

  // Publikuj/cofnij publikację programu
  const publishMutation = useMutation({
    mutationFn: async ({
      scheduleId,
      action,
    }: {
      scheduleId: string;
      action: "publish" | "unpublish";
    }) => {
      const response = await api.post(
        `/organization/schedules/${scheduleId}/${action}`
      );
      return response.data;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", competitionId] });
      toast.success(
        action === "publish" ? "Program opublikowany" : "Publikacja cofnięta"
      );
    },
    onError: () => {
      toast.error("Błąd podczas zmiany statusu publikacji");
    },
  });

  // Aktualizuj status pozycji w programie
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      scheduleId,
      itemId,
      status,
    }: {
      scheduleId: string;
      itemId: string;
      status: string;
    }) => {
      const response = await api.patch(
        `/organization/schedules/${scheduleId}/items/${itemId}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", competitionId] });
      toast.success("Status zaktualizowany");
    },
    onError: () => {
      toast.error("Błąd podczas aktualizacji statusu");
    },
  });

  const formatEventName = (item: ScheduleItem) => {
    const parts = [];
    if (item.event.distance) {
      parts.push(item.event.distance);
    } else {
      parts.push(item.event.name);
    }
    parts.push(
      item.event.gender === "MALE"
        ? "M"
        : item.event.gender === "FEMALE"
          ? "K"
          : "MIX"
    );
    if (item.event.category !== "SENIOR") {
      parts.push(item.event.category);
    }
    return parts.join(" ");
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "HH:mm", { locale: pl });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Play className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "DELAYED":
        return <Pause className="w-4 h-4" />;
      case "CANCELLED":
        return <AlertCircle className="w-4 h-4" />;
      case "POSTPONED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // const currentSchedule = schedules?.find(s => s.id === selectedSchedule) || schedules?.[0]; // Obecnie nieużywane

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Program minutowy</h2>
          <p className="text-gray-600">Zarządzaj harmonogramem zawodów</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nowy program
          </Button>
          <ScheduleGeneratorDialog
            competitionId={competitionId}
            trigger={
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Generator
              </Button>
            }
          />
        </div>
      </div>

      {/* Tabs dla różnych programów */}
      {schedules && schedules.length > 0 && (
        <Tabs
          value={selectedSchedule || schedules[0].id}
          onValueChange={setSelectedSchedule}
        >
          <TabsList>
            {schedules.map((schedule) => (
              <TabsTrigger
                key={schedule.id}
                value={schedule.id}
                className="flex items-center gap-2"
              >
                {schedule.name}
                {schedule.isPublished && (
                  <Badge variant="secondary" className="text-xs">
                    Opublikowany
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {schedules.map((schedule) => (
            <TabsContent key={schedule.id} value={schedule.id}>
              <div className="space-y-4">
                {/* Akcje programu */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{schedule.name}</h3>
                    {schedule.description && (
                      <p className="text-sm text-gray-600">
                        {schedule.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {schedule.items.length} pozycji
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Status:{" "}
                        {schedule.isPublished ? "Opublikowany" : "Roboczy"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        publishMutation.mutate({
                          scheduleId: schedule.id,
                          action: schedule.isPublished
                            ? "unpublish"
                            : "publish",
                        })
                      }
                      disabled={publishMutation.isPending}
                    >
                      {schedule.isPublished ? "Cofnij publikację" : "Opublikuj"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edytuj
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Podgląd
                    </Button>
                  </div>
                </div>

                {/* Lista pozycji programu */}
                <div className="space-y-2">
                  {schedule.items.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[60px]">
                              <div className="font-mono text-lg font-semibold">
                                {formatTime(item.scheduledTime)}
                              </div>
                              {item.actualTime &&
                                item.actualTime !== item.scheduledTime && (
                                  <div className="text-xs text-gray-500">
                                    rzecz: {formatTime(item.actualTime)}
                                  </div>
                                )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">
                                  {formatEventName(item)}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {roundLabels[
                                    item.round as keyof typeof roundLabels
                                  ] || item.round}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {item.seriesCount > 1 && (
                                  <span>{item.seriesCount} serii</span>
                                )}
                                {item.finalistsCount && (
                                  <span>{item.finalistsCount} do finału</span>
                                )}
                                {item.duration && (
                                  <span>{item.duration} min</span>
                                )}
                                {item.notes && (
                                  <span className="italic">{item.notes}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${statusColors[item.status]} flex items-center gap-1`}
                            >
                              {getStatusIcon(item.status)}
                              {statusLabels[item.status]}
                            </Badge>

                            <div className="flex gap-1">
                              {item.status === "SCHEDULED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      scheduleId: schedule.id,
                                      itemId: item.id,
                                      status: "IN_PROGRESS",
                                    })
                                  }
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              {item.status === "IN_PROGRESS" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      scheduleId: schedule.id,
                                      itemId: item.id,
                                      status: "COMPLETED",
                                    })
                                  }
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {schedule.items.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Brak pozycji w programie
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Dodaj wydarzenia do programu minutowego lub użyj
                        generatora automatycznego.
                      </p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Dodaj pozycję
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {(!schedules || schedules.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Brak programów minutowych
            </h3>
            <p className="text-gray-600 mb-4">
              Utwórz pierwszy program minutowy dla tych zawodów.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz program
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
