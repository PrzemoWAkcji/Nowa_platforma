"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  type: "TRACK" | "FIELD" | "COMBINED";
  gender: string;
  category: string;
  distance?: string;
  participantsCount: number;
}

interface ScheduleGeneratorDialogProps {
  competitionId: string;
  trigger?: React.ReactNode;
}

interface GeneratorSettings {
  name: string;
  description?: string;
  startTime: string;
  parallelFieldEvents: boolean;
  separateCombinedEvents: boolean;
  breakDuration: number;
  trackEventDuration: number;
  fieldEventDuration: number;
  combinedEventDuration: number;
  selectedEvents: string[];
}

const defaultSettings: GeneratorSettings = {
  name: "Program minutowy",
  description: "",
  startTime: "09:00",
  parallelFieldEvents: true,
  separateCombinedEvents: true,
  breakDuration: 15,
  trackEventDuration: 20,
  fieldEventDuration: 60,
  combinedEventDuration: 90,
  selectedEvents: [],
};

export default function ScheduleGeneratorDialog({
  competitionId,
  trigger,
}: ScheduleGeneratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<GeneratorSettings>(defaultSettings);
  const [step, setStep] = useState<"settings" | "events" | "preview">(
    "settings"
  );
  const [generatedSchedule, setGeneratedSchedule] = useState<{
    events: Array<{ id: string; name: string; time: string; duration: number }>;
  } | null>(null);

  const queryClient = useQueryClient();

  // Pobierz wydarzenia dla zawodów
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["competition-events", competitionId],
    queryFn: async () => {
      const response = await fetch(
        `/api/events?competitionId=${competitionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();

      // Symulacja liczby uczestników - w rzeczywistości byłoby to z API
      return data.map((event: Event) => ({
        ...event,
        participantsCount: Math.floor(Math.random() * 50) + 10,
      })) as Event[];
    },
    enabled: open,
  });

  // Generuj program
  const generateMutation = useMutation({
    mutationFn: async (settings: GeneratorSettings) => {
      const response = await api.post("/organization/schedules/generate", {
        competitionId,
        ...settings,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedSchedule(data);
      setStep("preview");
      toast.success("Program minutowy został wygenerowany");
    },
    onError: () => {
      toast.error("Błąd podczas generowania programu");
    },
  });

  // Zapisz program
  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/organization/schedules", {
        competitionId,
        name: settings.name,
        description: settings.description,
        items: generatedSchedule?.events || [],
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", competitionId] });
      toast.success("Program minutowy został zapisany");
      setOpen(false);
      resetDialog();
    },
    onError: () => {
      toast.error("Błąd podczas zapisywania programu");
    },
  });

  const resetDialog = () => {
    setStep("settings");
    setSettings(defaultSettings);
    setGeneratedSchedule(null);
  };

  const handleEventToggle = (eventId: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      selectedEvents: checked
        ? [...prev.selectedEvents, eventId]
        : prev.selectedEvents.filter((id) => id !== eventId),
    }));
  };

  const handleSelectAll = () => {
    if (!events) return;
    setSettings((prev) => ({
      ...prev,
      selectedEvents: events.map((e) => e.id),
    }));
  };

  const handleDeselectAll = () => {
    setSettings((prev) => ({
      ...prev,
      selectedEvents: [],
    }));
  };

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
    if (event.category !== "SENIOR") {
      parts.push(event.category);
    }
    return parts.join(" ");
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "TRACK":
        return "bg-blue-100 text-blue-800";
      case "FIELD":
        return "bg-green-100 text-green-800";
      case "COMBINED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "TRACK":
        return "Bieżnia";
      case "FIELD":
        return "Techniczne";
      case "COMBINED":
        return "Wielobój";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Generator programu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Generator programu minutowego
          </DialogTitle>
          <DialogDescription>
            Automatycznie wygeneruj program minutowy na podstawie wydarzeń w
            zawodach
          </DialogDescription>
        </DialogHeader>

        {/* Kroki */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {[
            { key: "settings", label: "Ustawienia", icon: Settings },
            { key: "events", label: "Wydarzenia", icon: Trophy },
            { key: "preview", label: "Podgląd", icon: Calendar },
          ].map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.key;
            const isCompleted =
              (stepItem.key === "settings" &&
                (step === "events" || step === "preview")) ||
              (stepItem.key === "events" && step === "preview");

            return (
              <div key={stepItem.key} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isCompleted
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 text-gray-400"
                  }
                `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm ${isActive ? "font-semibold" : "text-gray-600"}`}
                >
                  {stepItem.label}
                </span>
                {index < 2 && (
                  <div
                    className={`w-8 h-px mx-4 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Krok 1: Ustawienia */}
        {step === "settings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nazwa programu</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Program minutowy"
                />
              </div>
              <div>
                <Label htmlFor="startTime">Godzina rozpoczęcia</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={settings.startTime}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Opis (opcjonalny)</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Dodatkowe informacje o programie..."
                rows={3}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ustawienia czasowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="trackDuration">
                      Konkurencje bieżne (min)
                    </Label>
                    <Input
                      id="trackDuration"
                      type="number"
                      value={settings.trackEventDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          trackEventDuration: parseInt(e.target.value) || 20,
                        }))
                      }
                      min="5"
                      max="60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldDuration">
                      Konkurencje techniczne (min)
                    </Label>
                    <Input
                      id="fieldDuration"
                      type="number"
                      value={settings.fieldEventDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          fieldEventDuration: parseInt(e.target.value) || 60,
                        }))
                      }
                      min="30"
                      max="120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="combinedDuration">Wieloboje (min)</Label>
                    <Input
                      id="combinedDuration"
                      type="number"
                      value={settings.combinedEventDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          combinedEventDuration: parseInt(e.target.value) || 90,
                        }))
                      }
                      min="60"
                      max="180"
                    />
                  </div>
                  <div>
                    <Label htmlFor="breakDuration">Przerwy (min)</Label>
                    <Input
                      id="breakDuration"
                      type="number"
                      value={settings.breakDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          breakDuration: parseInt(e.target.value) || 15,
                        }))
                      }
                      min="0"
                      max="30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opcje organizacyjne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parallelField"
                    checked={settings.parallelFieldEvents}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        parallelFieldEvents: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="parallelField" className="text-sm">
                    Równoległe przeprowadzanie konkurencji technicznych
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="separateCombined"
                    checked={settings.separateCombinedEvents}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        separateCombinedEvents: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="separateCombined" className="text-sm">
                    Wieloboje w osobnym bloku czasowym
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Krok 2: Wybór wydarzeń */}
        {step === "events" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Wybierz wydarzenia do programu
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Zaznacz wszystkie
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Odznacz wszystkie
                </Button>
              </div>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Ładowanie wydarzeń...
              </div>
            ) : events && events.length > 0 ? (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`event-${event.id}`}
                      checked={settings.selectedEvents.includes(event.id)}
                      onCheckedChange={(checked) =>
                        handleEventToggle(event.id, !!checked)
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label
                          htmlFor={`event-${event.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {formatEventName(event)}
                        </Label>
                        <Badge className={getEventTypeColor(event.type)}>
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.participantsCount} zawodników
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />~
                          {event.type === "TRACK"
                            ? settings.trackEventDuration
                            : event.type === "FIELD"
                              ? settings.fieldEventDuration
                              : settings.combinedEventDuration}{" "}
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Brak wydarzeń do wyświetlenia</p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Podsumowanie</span>
              </div>
              <div className="text-sm text-blue-800">
                Wybrano {settings.selectedEvents.length} z {events?.length || 0}{" "}
                wydarzeń
              </div>
            </div>
          </div>
        )}

        {/* Krok 3: Podgląd */}
        {step === "preview" && generatedSchedule && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Podgląd programu minutowego
              </h3>
              <Badge variant="secondary">
                {generatedSchedule.events?.length || 0} pozycji
              </Badge>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {generatedSchedule.events?.map(
                (
                  item: {
                    id: string;
                    name: string;
                    time: string;
                    duration: number;
                  },
                  index: number
                ) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-sm font-semibold text-blue-600 min-w-[50px]">
                        {format(new Date(`2000-01-01T${item.time}`), "HH:mm")}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          Czas trwania: {item.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {item.duration} min
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">
                  Program gotowy
                </span>
              </div>
              <div className="text-sm text-green-800">
                Program zawiera {generatedSchedule.events?.length || 0} pozycji
                i jest gotowy do zapisania.
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div>
              {step !== "settings" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === "events") setStep("settings");
                    if (step === "preview") setStep("events");
                  }}
                >
                  Wstecz
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Anuluj
              </Button>
              {step === "settings" && (
                <Button
                  onClick={() => setStep("events")}
                  disabled={!settings.name.trim()}
                >
                  Dalej
                </Button>
              )}
              {step === "events" && (
                <Button
                  onClick={() => generateMutation.mutate(settings)}
                  disabled={
                    settings.selectedEvents.length === 0 ||
                    generateMutation.isPending
                  }
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generowanie...
                    </>
                  ) : (
                    "Generuj program"
                  )}
                </Button>
              )}
              {step === "preview" && (
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    "Zapisz program"
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
