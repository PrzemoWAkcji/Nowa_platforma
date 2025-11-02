"use client";

import { ImportStartListDialog } from "@/components/competitions/ImportStartListDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { Event, EventType } from "@/types";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMinutes, format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  GripVertical,
  Play,
  Plus,
  Printer,
  Save,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ScheduleItem {
  id: string;
  eventId: string;
  scheduledTime: string;
  duration: number;
  round: "QUALIFICATION" | "FINAL";
  roundName?: string; // np. "Finał A", "Finał B", "Serie kwalifikacyjne"
  seriesCount: number;
  finalistsCount?: number;
  notes?: string;
  event: Event;
}

interface Schedule {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
  status: "DRAFT" | "PUBLISHED";
}

interface MinuteProgramCreatorProps {
  competitionId: string;
  onProgramCreated?: () => void;
  editingSchedule?: Schedule | null;
}

// Sugerowane czasy trwania dla różnych typów konkurencji (w minutach)
const SUGGESTED_DURATIONS = {
  [EventType.TRACK]: {
    sprint: 15, // 100m, 200m, 400m
    middle: 20, // 800m, 1500m
    long: 25, // 3000m, 5000m, 10000m
    hurdles: 20, // 110m/100m płotki, 400m płotki
    relay: 15, // sztafety
  },
  [EventType.FIELD]: {
    jump: 60, // skoki
    throw: 90, // rzuty
  },
  [EventType.COMBINED]: {
    default: 120, // wieloboje
  },
  [EventType.ROAD]: {
    default: 30,
  },
};

// Funkcja do określenia sugerowanego czasu trwania
const getSuggestedDuration = (event: Event): number => {
  const eventName = event.name.toLowerCase();

  if (event.type === EventType.TRACK) {
    if (
      eventName.includes("100m") ||
      eventName.includes("200m") ||
      eventName.includes("400m")
    ) {
      return SUGGESTED_DURATIONS.TRACK.sprint;
    } else if (eventName.includes("800m") || eventName.includes("1500m")) {
      return SUGGESTED_DURATIONS.TRACK.middle;
    } else if (
      eventName.includes("3000m") ||
      eventName.includes("5000m") ||
      eventName.includes("10000m")
    ) {
      return SUGGESTED_DURATIONS.TRACK.long;
    } else if (eventName.includes("płotki") || eventName.includes("hurdles")) {
      return SUGGESTED_DURATIONS.TRACK.hurdles;
    } else if (eventName.includes("sztafeta") || eventName.includes("relay")) {
      return SUGGESTED_DURATIONS.TRACK.relay;
    }
    return SUGGESTED_DURATIONS.TRACK.sprint;
  } else if (event.type === EventType.FIELD) {
    if (eventName.includes("skok") || eventName.includes("jump")) {
      return SUGGESTED_DURATIONS.FIELD.jump;
    } else if (
      eventName.includes("rzut") ||
      eventName.includes("throw") ||
      eventName.includes("pchnięcie")
    ) {
      return SUGGESTED_DURATIONS.FIELD.throw;
    }
    return SUGGESTED_DURATIONS.FIELD.throw;
  } else if (event.type === EventType.COMBINED) {
    return SUGGESTED_DURATIONS.COMBINED.default;
  }

  return SUGGESTED_DURATIONS.ROAD.default;
};

// Funkcja do tłumaczenia nazw rundek
const getRoundDisplayName = (
  round: "QUALIFICATION" | "FINAL",
  customName?: string
): string => {
  if (customName) return customName;

  switch (round) {
    case "QUALIFICATION":
      return "Serie kwalifikacyjne";
    case "FINAL":
      return "Finał";
    default:
      return round;
  }
};

// Funkcja do określenia rundek na podstawie liczby uczestników
const determineRounds = (participantCount: number, eventType: EventType) => {
  const rounds: Array<{
    round: "QUALIFICATION" | "FINAL";
    roundName?: string;
    seriesCount: number;
    finalistsCount?: number;
  }> = [];

  if (eventType === EventType.TRACK) {
    // Dla biegów - domyślnie zawsze serie (nie finały)
    rounds.push({
      round: "QUALIFICATION",
      roundName: "Serie",
      seriesCount: Math.max(1, Math.ceil(participantCount / 8)),
    });
  } else if (eventType === EventType.FIELD) {
    // Dla konkurencji technicznych
    if (participantCount <= 12) {
      // Bezpośrednio finał
      rounds.push({
        round: "FINAL",
        roundName: "Finał",
        seriesCount: 1,
      });
    } else {
      // Eliminacje + finał
      rounds.push({
        round: "QUALIFICATION",
        roundName: "Eliminacje",
        seriesCount: Math.ceil(participantCount / 12),
        finalistsCount: 12,
      });
      rounds.push({
        round: "FINAL",
        roundName: "Finał",
        seriesCount: 1,
      });
    }
  } else {
    // Dla pozostałych typów - domyślnie finał
    rounds.push({
      round: "FINAL",
      roundName: "Finał",
      seriesCount: Math.ceil(participantCount / 8),
    });
  }

  return rounds;
};

// Funkcja do generowania automatycznego programu
const generateAutoSchedule = (
  events: Event[],
  startTime: string = "09:00"
): ScheduleItem[] => {
  const schedule: ScheduleItem[] = [];
  let currentTime = parseISO(`2024-01-01T${startTime}:00`);

  // Sortuj konkurencje: najpierw biegowe, potem techniczne
  const sortedEvents = [...events].sort((a, b) => {
    const typeOrder = {
      [EventType.TRACK]: 1,
      [EventType.FIELD]: 2,
      [EventType.COMBINED]: 3,
      [EventType.ROAD]: 4,
      [EventType.RELAY]: 1,
    };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  sortedEvents.forEach((event) => {
    const participantCount = event._count?.registrationEvents || 0;
    const rounds = determineRounds(participantCount, event.type);

    rounds.forEach((roundInfo, index) => {
      const duration = getSuggestedDuration(event);

      schedule.push({
        id: `schedule-${event.id}-${roundInfo.round}`,
        eventId: event.id,
        scheduledTime: format(currentTime, "HH:mm"),
        duration,
        round: roundInfo.round,
        roundName: roundInfo.roundName,
        seriesCount: roundInfo.seriesCount,
        finalistsCount: roundInfo.finalistsCount,
        event,
      });

      // Dodaj czas na konkurencję + przerwa
      const breakTime = index === rounds.length - 1 ? 15 : 10; // Dłuższa przerwa po ostatniej rundzie konkurencji
      currentTime = addMinutes(currentTime, duration + breakTime);
    });
  });

  return schedule;
};

export default function MinuteProgramCreator({
  competitionId,
  onProgramCreated,
  editingSchedule,
}: MinuteProgramCreatorProps) {
  const router = useRouter();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [programName, setProgramName] = useState("Program minutowy");
  const [programDescription, setProgramDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<{
    name: string;
    description: string;
    items: ScheduleItem[];
  } | null>(null);

  const queryClient = useQueryClient();

  // Funkcja do sprawdzania czy są niezapisane zmiany
  const checkForChanges = () => {
    if (!originalData) return false;

    const currentData = {
      name: programName,
      description: programDescription,
      items: scheduleItems,
    };

    const hasNameChanged = currentData.name !== originalData.name;
    const hasDescriptionChanged =
      currentData.description !== originalData.description;
    const hasItemsChanged =
      JSON.stringify(currentData.items) !== JSON.stringify(originalData.items);

    return hasNameChanged || hasDescriptionChanged || hasItemsChanged;
  };

  // Pobierz szczegóły programu przy edycji
  const { data: scheduleDetails, isLoading: scheduleDetailsLoading } = useQuery(
    {
      queryKey: ["schedule", editingSchedule?.id],
      queryFn: async () => {
        if (!editingSchedule?.id) return null;
        const response = await api.get(
          `/organization/schedules/${editingSchedule.id}`
        );
        return response.data;
      },
      enabled: !!editingSchedule?.id,
    }
  );

  // Inicjalizuj dane przy edycji
  useEffect(() => {
    if (editingSchedule) {
      setProgramName(editingSchedule.name);
      setProgramDescription(editingSchedule.description || "");
    } else {
      // Dla nowego programu - ustaw oryginalne dane
      setOriginalData({
        name: programName,
        description: programDescription,
        items: [],
      });
    }
  }, [editingSchedule]);

  // Załaduj elementy programu z API przy edycji
  useEffect(() => {
    if (scheduleDetails && scheduleDetails.items) {
      const loadedItems: ScheduleItem[] = scheduleDetails.items.map(
        (item: any) => ({
          id: item.id,
          eventId: item.eventId,
          scheduledTime: format(new Date(item.scheduledTime), "HH:mm"),
          duration: item.duration,
          round: item.round,
          roundName: item.roundName || getRoundDisplayName(item.round),
          seriesCount: item.seriesCount || 1,
          finalistsCount: item.finalistsCount,
          notes: item.notes,
          event: item.event,
        })
      );
      setScheduleItems(loadedItems);

      // Zapisz oryginalne dane
      setOriginalData({
        name: programName,
        description: programDescription,
        items: loadedItems,
      });
    }
  }, [scheduleDetails]);

  // Śledź zmiany w danych
  useEffect(() => {
    const hasChanges = checkForChanges();
    setHasUnsavedChanges(hasChanges);
  }, [programName, programDescription, scheduleItems, originalData]);

  // Funkcja anulowania zmian
  const handleCancel = () => {
    if (originalData) {
      setProgramName(originalData.name);
      setProgramDescription(originalData.description);
      setScheduleItems(originalData.items);
      setHasUnsavedChanges(false);
    }
  };

  // Pobierz konkurencje dla zawodów
  const { data: allEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["events", { competitionId }],
    queryFn: async () => {
      const response = await api.get(`/events?competitionId=${competitionId}`);
      return response.data as Event[];
    },
  });

  // Filtruj tylko konkurencje z zawodnikami dla automatycznego generowania
  const events =
    allEvents?.filter(
      (event) =>
        event._count?.registrationEvents && event._count.registrationEvents > 0
    ) || [];

  // Wszystkie konkurencje dla ręcznego dodawania
  const availableEvents = allEvents || [];

  // Pobierz informacje o zawodach
  const { data: competition } = useQuery({
    queryKey: ["competition", competitionId],
    queryFn: async () => {
      const response = await api.get(`/competitions/${competitionId}`);
      return response.data;
    },
  });

  // Mutacja do zapisania programu
  const saveSchedule = useMutation({
    mutationFn: async (data: {
      competitionId: string;
      name: string;
      description: string;
      items: any[];
    }) => {
      const url = editingSchedule
        ? `/organization/schedules/${editingSchedule.id}`
        : `/organization/schedules`;

      // Użyj daty rozpoczęcia zawodów lub dzisiejszej daty jako fallback
      const competitionDate = competition?.startDate
        ? format(new Date(competition.startDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      const eventIds = data.items.map((item) => item.eventId);
      const uniqueEventIds = [...new Set(eventIds)];
      const availableEventIds = availableEvents.map((event) => event.id);

      // Sprawdź, czy wszystkie unikalne eventId istnieją w dostępnych eventach
      const invalidEventIds = uniqueEventIds.filter(
        (eventId) => !availableEventIds.includes(eventId)
      );

      if (invalidEventIds.length > 0) {
        throw new Error(
          `Niektóre konkurencje nie istnieją: ${invalidEventIds.join(", ")}`
        );
      }

      const payload = {
        competitionId: data.competitionId,
        name: data.name,
        description: data.description,
        items: data.items.map((item) => ({
          // Nie wysyłamy id - backend usuwa stare elementy i tworzy nowe
          eventId: item.eventId,
          scheduledTime: `${competitionDate}T${item.scheduledTime}:00.000Z`,
          duration: item.duration || 15,
          round: item.round,
          roundName: item.roundName || undefined,
          seriesCount: item.seriesCount || 1,
          finalistsCount: item.finalistsCount || undefined,
          notes: item.notes || undefined,
        })),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = editingSchedule
        ? await api.patch(url, payload)
        : await api.post(url, payload);

      return response.data;
    },
    onSuccess: () => {
      toast.success(
        editingSchedule
          ? "Program minutowy został zaktualizowany"
          : "Program minutowy został zapisany"
      );
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["minute-program"] });
      queryClient.invalidateQueries({
        queryKey: ["schedule", editingSchedule?.id],
      });

      // Zaktualizuj oryginalne dane i resetuj stan zmian
      setOriginalData({
        name: programName,
        description: programDescription,
        items: scheduleItems,
      });
      setHasUnsavedChanges(false);
      setIsSaving(false);

      // Wywołaj onProgramCreated tylko przy tworzeniu nowego programu, nie przy aktualizacji
      if (!editingSchedule) {
        onProgramCreated?.();
      }
    },
    onError: (error: any) => {
      console.error("Save schedule error:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Nieznany błąd";
      toast.error(
        editingSchedule
          ? `Błąd podczas aktualizacji programu: ${errorMessage}`
          : `Błąd podczas zapisywania programu: ${errorMessage}`
      );
      setIsSaving(false);
    },
  });

  // Zapisz program
  const handleSave = () => {
    if (scheduleItems.length === 0) {
      toast.error("Program jest pusty");
      return;
    }

    setIsSaving(true);
    saveSchedule.mutate({
      competitionId,
      name: programName,
      description: programDescription,
      items: scheduleItems,
    });
  };

  // Podgląd programu
  const handlePreview = () => {
    console.log(
      "handlePreview called, scheduleItems.length:",
      scheduleItems.length
    );

    if (scheduleItems.length === 0) {
      toast.error("Program jest pusty");
      return;
    }

    // Stwórz HTML dla podglądu
    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Podgląd - ${programName}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.5;
            color: #333;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .competition-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .competition-location {
            font-size: 18px;
            margin-bottom: 5px;
          }
          .competition-date {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }
          .program-title {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 15px;
          }
          .program-description {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }
          .schedule-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            background: white;
            page-break-inside: avoid;
          }
          .item-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 8px;
          }
          .item-time {
            min-width: 80px;
            font-family: monospace;
            font-weight: bold;
            font-size: 16px;
            color: #000;
          }
          .item-event {
            flex: 1;
          }
          .event-name {
            font-weight: bold;
            font-size: 16px;
            color: #000;
          }
          .event-details {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 5px;
            font-size: 14px;
            color: #666;
          }
          .badge {
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            border: 1px solid #e5e7eb;
          }
          .round-badge {
            background: #dbeafe;
            border-color: #93c5fd;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
          }
          .print-button:hover {
            background: #2563eb;
          }
          @media print {
            body { margin: 0; }
            .schedule-item { break-inside: avoid; }
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Drukuj</button>
        <div class="header">
          <div class="competition-name">${competition?.name || "Zawody"}</div>
          <div class="competition-location">${competition?.location || ""}</div>
          <div class="competition-date">
            ${competition?.startDate ? format(new Date(competition.startDate), "dd MMMM yyyy", { locale: pl }) : ""}
          </div>
          <div class="program-title">${programName.toUpperCase()}</div>
          ${programDescription ? `<div class="program-description">${programDescription}</div>` : ""}
        </div>
        
        <div class="schedule">
          ${scheduleItems
            .map(
              (item) => `
            <div class="schedule-item">
              <div class="item-header">
                <div class="item-time">${item.scheduledTime}</div>
                <div class="item-event">
                  <div class="event-name">${item.event.name}</div>
                  <div class="event-details">
                    <span class="badge">${item.event.gender} ${item.event.category}</span>
                    <span class="badge round-badge">${item.roundName || getRoundDisplayName(item.round)}</span>
                    <span>${item.seriesCount} ${item.seriesCount === 1 ? "seria" : "serie"}</span>
                    ${item.finalistsCount ? `<span>${item.finalistsCount} finalistów</span>` : ""}
                    <span>${item.duration} min</span>
                    ${item.event._count?.registrationEvents ? `<span>${item.event._count.registrationEvents} uczestników</span>` : ""}
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="footer">
          <div>Program minutowy wygenerowany: ${format(new Date(), "dd.MM.yyyy HH:mm")}</div>
          <div style="margin-top: 5px;">System zarządzania zawodami lekkoatletycznymi</div>
        </div>
      </body>
      </html>
    `;

    // Spróbuj różne metody otwierania podglądu
    try {
      // Metoda 1: Spróbuj otworzyć nowe okno
      const printWindow = window.open(
        "",
        "_blank",
        "width=900,height=700,scrollbars=yes,resizable=yes"
      );

      if (printWindow && !printWindow.closed) {
        printWindow.document.write(previewContent);
        printWindow.document.close();
        printWindow.focus();
        toast.success("Podgląd został otwarty w nowym oknie");
        return;
      }

      // Metoda 2: Użyj blob URL
      const blob = new Blob([previewContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");

      if (newWindow && !newWindow.closed) {
        toast.success("Podgląd został otwarty w nowej karcie");
        // Zwolnij URL po 5 sekundach
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }

      // Metoda 3: Fallback - pobierz jako plik HTML
      const link = document.createElement("a");
      link.href = url;
      link.download = `program-minutowy-${programName.replace(/[^a-zA-Z0-9]/g, "-")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Podgląd został pobrany jako plik HTML");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error opening preview:", error);
      toast.error("Błąd podczas otwierania podglądu");
    }
  };

  // Drukuj program
  const handlePrint = () => {
    console.log(
      "handlePrint called, scheduleItems.length:",
      scheduleItems.length
    );

    if (scheduleItems.length === 0) {
      toast.error("Program jest pusty");
      return;
    }

    // Stwórz HTML dla druku
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Drukuj - ${programName}</title>
        <meta charset="utf-8">
        <style>
          @page {
            margin: 1cm;
            size: A4;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 0;
            line-height: 1.4;
            color: #000;
            background: white;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .competition-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .competition-location {
            font-size: 16px;
            margin-bottom: 4px;
          }
          .competition-date {
            font-size: 12px;
            color: #333;
            margin-bottom: 12px;
          }
          .program-title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 12px;
          }
          .program-description {
            font-size: 12px;
            color: #333;
            margin-top: 8px;
          }
          .schedule-item {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 8px;
            background: white;
            page-break-inside: avoid;
          }
          .item-header {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .item-time {
            min-width: 70px;
            font-family: monospace;
            font-weight: bold;
            font-size: 14px;
            color: #000;
          }
          .item-event {
            flex: 1;
          }
          .event-name {
            font-weight: bold;
            font-size: 14px;
            color: #000;
            margin-bottom: 4px;
          }
          .event-details {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 11px;
            color: #333;
            flex-wrap: wrap;
          }
          .badge {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            border: 1px solid #ccc;
            white-space: nowrap;
          }
          .round-badge {
            background: #e6f3ff;
            border-color: #99ccff;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 15px;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="competition-name">${competition?.name || "Zawody"}</div>
          <div class="competition-location">${competition?.location || ""}</div>
          <div class="competition-date">
            ${competition?.startDate ? format(new Date(competition.startDate), "dd MMMM yyyy", { locale: pl }) : ""}
          </div>
          <div class="program-title">${programName.toUpperCase()}</div>
          ${programDescription ? `<div class="program-description">${programDescription}</div>` : ""}
        </div>
        
        <div class="schedule">
          ${scheduleItems
            .map(
              (item) => `
            <div class="schedule-item">
              <div class="item-header">
                <div class="item-time">${item.scheduledTime}</div>
                <div class="item-event">
                  <div class="event-name">${item.event.name}</div>
                  <div class="event-details">
                    <span class="badge">${item.event.gender} ${item.event.category}</span>
                    <span class="badge round-badge">${item.roundName || getRoundDisplayName(item.round)}</span>
                    <span>${item.seriesCount} ${item.seriesCount === 1 ? "seria" : "serie"}</span>
                    ${item.finalistsCount ? `<span>${item.finalistsCount} finalistów</span>` : ""}
                    <span>${item.duration} min</span>
                    ${item.event._count?.registrationEvents ? `<span>${item.event._count.registrationEvents} uczestników</span>` : ""}
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="footer">
          <div>Program minutowy wygenerowany: ${format(new Date(), "dd.MM.yyyy HH:mm")}</div>
          <div style="margin-top: 3px;">System zarządzania zawodami lekkoatletycznymi</div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    // Otwórz okno druku
    try {
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
      } else {
        // Fallback - użyj blob URL
        const blob = new Blob([printContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, "_blank");

        if (!newWindow) {
          toast.error(
            "Nie można otworzyć okna druku. Sprawdź ustawienia blokowania wyskakujących okien w przeglądarce."
          );
        }
      }
    } catch (error) {
      console.error("Error opening print window:", error);
      toast.error("Błąd podczas drukowania");
    }
  };

  // Generuj automatyczny program
  const handleGenerateAuto = () => {
    if (!events || events.length === 0) {
      toast.error("Brak konkurencji z zawodnikami do zaplanowania");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const autoSchedule = generateAutoSchedule(events, startTime);
      setScheduleItems(autoSchedule);
      setIsGenerating(false);
      toast.success(
        `Wygenerowano program dla ${autoSchedule.length} konkurencji`
      );
    }, 500);
  };

  // Obsługa drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(scheduleItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Przelicz czasy po przesunięciu
    let currentTime = parseISO(`2024-01-01T${startTime}:00`);
    const updatedItems = items.map((item) => {
      const updatedItem = {
        ...item,
        scheduledTime: format(currentTime, "HH:mm"),
      };
      currentTime = addMinutes(currentTime, item.duration + 10);
      return updatedItem;
    });

    setScheduleItems(updatedItems);
  };

  // Aktualizuj czas konkurencji
  const updateItemTime = (itemId: string, newTime: string) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, scheduledTime: newTime } : item
      )
    );
  };

  // Aktualizuj czas trwania
  const updateItemDuration = (itemId: string, newDuration: number) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, duration: newDuration } : item
      )
    );
  };

  // Aktualizuj rundę
  const updateItemRound = (
    itemId: string,
    newRound: "QUALIFICATION" | "FINAL"
  ) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              round: newRound,
              roundName: getRoundDisplayName(newRound),
            }
          : item
      )
    );
  };

  // Aktualizuj nazwę rundy
  const updateItemRoundName = (itemId: string, newRoundName: string) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, roundName: newRoundName } : item
      )
    );
  };

  // Aktualizuj liczbę serii
  const updateItemSeriesCount = (itemId: string, newSeriesCount: number) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, seriesCount: newSeriesCount } : item
      )
    );
  };

  // Aktualizuj liczbę finalistów
  const updateItemFinalistsCount = (
    itemId: string,
    newFinalistsCount?: number
  ) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, finalistsCount: newFinalistsCount }
          : item
      )
    );
  };

  // Dodaj konkurencję ręcznie do programu
  const addEventToSchedule = (
    event: Event,
    round: "QUALIFICATION" | "FINAL" = "FINAL",
    customRoundName?: string,
    customTime?: string
  ) => {
    const participantCount = event._count?.registrationEvents || 0;
    const rounds = determineRounds(participantCount, event.type);
    const roundInfo = rounds.find((r) => r.round === round) || rounds[0];

    const newItem: ScheduleItem = {
      id: `schedule-${event.id}-${round}-${Date.now()}`,
      eventId: event.id,
      scheduledTime: customTime || "09:00",
      duration: getSuggestedDuration(event),
      round,
      roundName: customRoundName || roundInfo.roundName,
      seriesCount: roundInfo.seriesCount,
      finalistsCount: roundInfo.finalistsCount,
      event,
    };

    setScheduleItems((items) => [...items, newItem]);
    toast.success(`Dodano ${event.name} do programu`);
  };

  // Usuń element z programu
  const removeItem = (itemId: string) => {
    setScheduleItems((items) => items.filter((item) => item.id !== itemId));
  };

  // Debug info
  console.log("MinuteProgramCreator render:", {
    eventsLoading,
    scheduleDetailsLoading,
    eventsCount: events?.length || 0,
    allEventsCount: allEvents?.length || 0,
    scheduleItemsCount: scheduleItems.length,
    editingSchedule: !!editingSchedule,
    competitionId,
    scheduleItems: scheduleItems.map((item) => ({
      id: item.id,
      eventName: item.event.name,
      scheduledTime: item.scheduledTime,
    })),
  });

  if (eventsLoading || scheduleDetailsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Brak konkurencji z zawodnikami
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Aby utworzyć program minutowy, najpierw dodaj konkurencje i
            zarejestruj zawodników.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-800">
            <p className="font-medium mb-2">ℹ️ Informacja:</p>
            <p>Dostępne konkurencje: {allEvents?.length || 0}</p>
            <p>Konkurencje z zawodnikami: {events?.length || 0}</p>
            <p>Elementy w programie: {scheduleItems.length}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <ImportStartListDialog
              competitionId={competitionId}
              trigger={
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Zaimportuj zawodników
                </Button>
              }
            />
            <Button
              variant="default"
              onClick={() =>
                router.push(`/competitions/${competitionId}/events`)
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj konkurencje
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nagłówek - ukryty przy druku */}
      <div className="print:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tworzenie programu minutowego
            </CardTitle>
            <div className="text-sm text-gray-600 mt-2">
              Dostępne konkurencje: {allEvents?.length || 0} | Z zawodnikami:{" "}
              {events?.length || 0} | W programie: {scheduleItems.length}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="programName">Nazwa programu</Label>
                <Input
                  id="programName"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="Program minutowy"
                />
              </div>
              <div>
                <Label htmlFor="startTime">Godzina rozpoczęcia</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="programDescription">Opis (opcjonalnie)</Label>
              <Textarea
                id="programDescription"
                value={programDescription}
                onChange={(e) => setProgramDescription(e.target.value)}
                placeholder="Dodatkowe informacje o programie..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleGenerateAuto}
                disabled={isGenerating}
                variant="outline"
              >
                <Play className="w-4 h-4 mr-2" />
                {isGenerating ? "Generowanie..." : "Generuj automatycznie"}
              </Button>

              <Button
                onClick={() => setShowAddEventModal(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj konkurencję ręcznie
              </Button>

              <Button
                onClick={() =>
                  router.push(`/competitions/${competitionId}/events`)
                }
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Zarządzaj konkurencjami
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving || scheduleItems.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving
                  ? editingSchedule
                    ? "Aktualizowanie..."
                    : "Zapisywanie..."
                  : editingSchedule
                    ? "Aktualizuj program"
                    : "Zapisz program"}
              </Button>

              {scheduleItems.length > 0 && (
                <>
                  <Button
                    onClick={() => {
                      console.log("Preview button clicked");
                      handlePreview();
                    }}
                    variant="outline"
                    title="Otwórz podgląd programu"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd ({scheduleItems.length})
                  </Button>

                  <Button
                    onClick={() => {
                      console.log("Print button clicked");
                      handlePrint();
                    }}
                    variant="outline"
                    title="Drukuj program minutowy"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Drukuj ({scheduleItems.length})
                  </Button>
                </>
              )}

              {scheduleItems.length === 0 && (
                <>
                  <Button
                    onClick={() => {
                      toast.info("Najpierw dodaj konkurencje do programu");
                    }}
                    variant="outline"
                    disabled
                    title="Dodaj konkurencje do programu aby włączyć podgląd"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd (pusty)
                  </Button>

                  <Button
                    onClick={() => {
                      toast.info("Najpierw dodaj konkurencje do programu");
                    }}
                    variant="outline"
                    disabled
                    title="Dodaj konkurencje do programu aby włączyć drukowanie"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Drukuj (pusty)
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nagłówek dla druku */}
      <div className="hidden print:block">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{competition?.name}</h1>
          <div className="text-lg mb-2">{competition?.location}</div>
          <div className="text-sm text-gray-600">
            {competition?.startDate &&
              format(new Date(competition.startDate), "dd MMMM yyyy", {
                locale: pl,
              })}
          </div>
          <div className="mt-4 text-xl font-semibold">
            {programName.toUpperCase()}
          </div>
          {programDescription && (
            <div className="text-sm text-gray-600 mt-2">
              {programDescription}
            </div>
          )}
        </div>
      </div>

      {/* Lista konkurencji */}
      <Card>
        <CardHeader className="print:hidden">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Program minutowy ({scheduleItems.length} konkurencji)
            </span>
            <div className="flex items-center gap-2">
              {scheduleItems.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Gotowy do publikacji
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddEventModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj konkurencję
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleItems.length === 0 ? (
            <div className="text-center py-8 print:hidden">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Program jest pusty
              </h3>
              <p className="text-gray-600 mb-4">
                Kliknij &quot;Generuj automatycznie&quot; aby utworzyć program
                na podstawie zgłoszonych konkurencji lub dodaj konkurencje
                ręcznie.
              </p>
              <div className="flex gap-2 justify-center mb-4">
                <Button
                  onClick={handleGenerateAuto}
                  disabled={isGenerating || !events || events.length === 0}
                  variant="default"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generowanie..." : "Generuj automatycznie"}
                </Button>
                <Button
                  onClick={() => setShowAddEventModal(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj konkurencję ręcznie
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 max-w-md mx-auto">
                <p className="font-medium mb-1">💡 Wskazówka:</p>
                <p>
                  Automatyczny generator ustawi optymalne czasy dla każdej
                  konkurencji na podstawie typu i liczby uczestników.
                </p>
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="schedule">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {scheduleItems.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 bg-white print:border-gray-300 print:shadow-none ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Drag handle - ukryty przy druku */}
                              <div
                                {...provided.dragHandleProps}
                                className="print:hidden cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>

                              {/* Czas */}
                              <div className="min-w-[80px]">
                                <Input
                                  type="time"
                                  value={item.scheduledTime}
                                  onChange={(e) =>
                                    updateItemTime(item.id, e.target.value)
                                  }
                                  className="text-center font-mono font-bold print:border-none print:bg-transparent"
                                />
                              </div>

                              {/* Informacje o konkurencji */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-semibold">
                                    {item.event.name}
                                  </h3>
                                  <Badge variant="outline">
                                    {item.event.gender} {item.event.category}
                                  </Badge>
                                  <div className="print:hidden flex items-center gap-2">
                                    <Select
                                      value={item.round}
                                      onValueChange={(
                                        value: "QUALIFICATION" | "FINAL"
                                      ) => updateItemRound(item.id, value)}
                                    >
                                      <SelectTrigger className="w-32 h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="QUALIFICATION">
                                          Serie kwalifikacyjne
                                        </SelectItem>
                                        <SelectItem value="FINAL">
                                          Finał
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="text"
                                      value={item.roundName || ""}
                                      onChange={(e) =>
                                        updateItemRoundName(
                                          item.id,
                                          e.target.value
                                        )
                                      }
                                      placeholder="np. Finał A"
                                      className="w-24 h-7 text-xs"
                                    />
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="hidden print:inline-flex"
                                  >
                                    {item.roundName ||
                                      getRoundDisplayName(item.round)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <Input
                                      type="number"
                                      value={item.seriesCount}
                                      onChange={(e) =>
                                        updateItemSeriesCount(
                                          item.id,
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                      className="w-12 h-6 text-xs print:border-none print:bg-transparent print:hidden"
                                      min="1"
                                      max="10"
                                    />
                                    <span className="hidden print:inline">
                                      {item.seriesCount}
                                    </span>
                                    {item.seriesCount === 1
                                      ? " seria"
                                      : " serie"}
                                  </span>

                                  {item.finalistsCount && (
                                    <span className="flex items-center gap-1">
                                      <Trophy className="w-4 h-4" />
                                      <Input
                                        type="number"
                                        value={item.finalistsCount}
                                        onChange={(e) =>
                                          updateItemFinalistsCount(
                                            item.id,
                                            parseInt(e.target.value) ||
                                              undefined
                                          )
                                        }
                                        className="w-12 h-6 text-xs print:border-none print:bg-transparent print:hidden"
                                        min="1"
                                        max="50"
                                      />
                                      <span className="hidden print:inline">
                                        {item.finalistsCount}
                                      </span>
                                      finalistów
                                    </span>
                                  )}

                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <Input
                                      type="number"
                                      value={item.duration}
                                      onChange={(e) =>
                                        updateItemDuration(
                                          item.id,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-16 h-6 text-xs print:border-none print:bg-transparent"
                                      min="5"
                                      max="180"
                                    />
                                    min
                                  </span>

                                  {item.event._count?.registrationEvents && (
                                    <span>
                                      {item.event._count.registrationEvents}{" "}
                                      uczestników
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Przycisk usunięcia - ukryty przy druku */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="print:hidden text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Modal dodawania konkurencji */}
      <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dodaj konkurencję do programu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableEvents.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-orange-400 mb-4" />
                <p className="text-gray-600">
                  Brak dostępnych konkurencji. Najpierw dodaj konkurencje do
                  zawodów.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setShowAddEventModal(false);
                    router.push(`/competitions/${competitionId}/events`);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj konkurencje
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {availableEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{event.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {event.gender} {event.category}
                          </Badge>
                          <Badge variant="secondary">{event.type}</Badge>
                          {event._count?.registrationEvents && (
                            <span className="text-sm text-gray-600">
                              {event._count.registrationEvents} uczestników
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {event.type === EventType.TRACK ? (
                          // Dla konkurencji biegowych - Serie jako domyślne
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                addEventToSchedule(
                                  event,
                                  "QUALIFICATION",
                                  "Serie"
                                );
                                setShowAddEventModal(false);
                              }}
                            >
                              Serie
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                addEventToSchedule(event, "FINAL", "Finał");
                                setShowAddEventModal(false);
                              }}
                            >
                              Finał
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                addEventToSchedule(event, "FINAL", "Finał A");
                                setShowAddEventModal(false);
                              }}
                            >
                              Finał A
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                addEventToSchedule(event, "FINAL", "Finał B");
                                setShowAddEventModal(false);
                              }}
                            >
                              Finał B
                            </Button>
                          </>
                        ) : (
                          // Dla konkurencji technicznych - Finał jako domyślne
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                addEventToSchedule(event, "FINAL", "Finał");
                                setShowAddEventModal(false);
                              }}
                            >
                              Finał
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                addEventToSchedule(
                                  event,
                                  "QUALIFICATION",
                                  "Eliminacje"
                                );
                                setShowAddEventModal(false);
                              }}
                            >
                              Eliminacje
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                addEventToSchedule(event, "FINAL", "Finał A");
                                setShowAddEventModal(false);
                              }}
                            >
                              Finał A
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                addEventToSchedule(event, "FINAL", "Finał B");
                                setShowAddEventModal(false);
                              }}
                            >
                              Finał B
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stopka dla druku */}
      <div className="hidden print:block">
        <div className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
          Program minutowy wygenerowany:{" "}
          {format(new Date(), "dd.MM.yyyy HH:mm")}
        </div>
        <div className="mt-1">
          System zarządzania zawodami lekkoatletycznymi
        </div>
      </div>

      {/* Pływający panel z przyciskami - pojawia się gdy są niezapisane zmiany */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                Niezapisane zmiany
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Anuluj
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingSchedule ? "Aktualizowanie..." : "Zapisywanie..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingSchedule ? "Aktualizuj" : "Zapisz"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
