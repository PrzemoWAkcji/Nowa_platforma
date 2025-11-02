"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Eye, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
// import { pl } from 'date-fns/locale'; // Obecnie nieużywane
import RosterStyleMinuteProgram from "./RosterStyleMinuteProgram";

interface Schedule {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
  status: "DRAFT" | "PUBLISHED";
}

interface MinuteProgramManagerProps {
  competitionId: string;
}

export default function MinuteProgramManager({
  competitionId,
}: MinuteProgramManagerProps) {
  const [showRosterStyle, setShowRosterStyle] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Pobierz istniejące programy minutowe
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", competitionId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/organization/schedules?competitionId=${competitionId}`
        );
        return response.data as Schedule[];
      } catch (error: any) {
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
  });

  const handleCreateNew = () => {
    setEditingSchedule(null);
    setShowRosterStyle(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowRosterStyle(true);
  };

  const handleProgramCreated = () => {
    setShowRosterStyle(false);
    setEditingSchedule(null);
  };

  const handleCancel = () => {
    setShowRosterStyle(false);
    setEditingSchedule(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jeśli pokazujemy program minutowy
  if (showRosterStyle) {
    return (
      <RosterStyleMinuteProgram
        competitionId={competitionId}
        onClose={handleCancel}
      />
    );
  }

  // Jeśli nie ma żadnych programów - pusty widok
  if (!schedules || schedules.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Brak programu minutowego
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Nie utworzono jeszcze żadnego programu minutowego dla tych zawodów.
            Kliknij poniższy przycisk, aby utworzyć pierwszy program.
          </p>
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Utwórz program minutowy
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Lista istniejących programów
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Programy minutowe
          </h2>
          <p className="text-gray-600">
            Zarządzaj programami minutowymi dla zawodów
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nowy program minutowy
        </Button>
      </div>

      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {schedule.name}
                  </CardTitle>
                  {schedule.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {schedule.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    schedule.status === "PUBLISHED" ? "default" : "secondary"
                  }
                >
                  {schedule.status === "PUBLISHED" ? "Opublikowany" : "Szkic"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Utworzono:{" "}
                    {format(new Date(schedule.createdAt), "dd.MM.yyyy HH:mm")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {schedule.itemsCount} pozycji
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(schedule)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Usuń
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
