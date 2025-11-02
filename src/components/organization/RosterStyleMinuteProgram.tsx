"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCompetitionLogos } from "@/hooks/useCompetitionLogos";
import { api } from "@/lib/api";
import { Category, Event, EventType, Gender } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Copy,
  Download,
  Edit,
  Image,
  Plus,
  Printer,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Style CSS do drukowania - profesjonalny format atletyczny
const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 6mm;
    }
    
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 8pt;
      line-height: 1.1;
      color: #000;
      margin: 0;
      padding: 0;
    }
    
    /* KOMPAKTOWY NAGŁÓWEK */
    .athletics-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #000;
      font-size: 9pt;
    }
    
    .athletics-logo {
      width: 30px;
      height: 30px;
      margin-right: 8px;
      object-fit: contain;
    }
    
    .athletics-header-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .athletics-title-compact {
      font-weight: bold;
      font-size: 10pt;
    }
    
    .athletics-date-compact {
      font-size: 8pt;
      color: #666;
    }
    
    /* SEKCJE KONKURENCJI */
    .athletics-section {
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    
    .athletics-section-header {
      background: #333;
      color: white;
      padding: 2px 6px;
      font-size: 8pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 1px;
      text-align: center;
    }
    
    /* PROGRAM GRID - KOMPAKTOWY LAYOUT */
    .athletics-program {
      display: grid;
      grid-template-columns: 40px 1fr 30px 50px 35px 80px;
      gap: 0;
      border: 1px solid #000;
      margin-bottom: 4px;
      font-family: 'Arial', 'Helvetica', sans-serif;
    }
    
    .athletics-program-header {
      display: contents;
    }
    
    .athletics-program-header > div {
      background: #e8e8e8;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 2px 1px;
      font-size: 6.5pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }
    
    .athletics-program-header > div:last-child {
      border-right: none;
    }
    
    .athletics-program-row {
      display: contents;
    }
    
    .athletics-program-row > div {
      border-right: 1px solid #999;
      border-bottom: 1px solid #999;
      padding: 1px 2px;
      font-size: 7pt;
      vertical-align: middle;
      min-height: 14px;
      display: flex;
      align-items: center;
      line-height: 1.0;
    }
    
    .athletics-program-row > div:last-child {
      border-right: none;
    }
    
    .athletics-program-row:nth-child(even) > div {
      background-color: #f9f9f9;
    }
    
    /* KOLUMNY PROGRAMU */
    .athletics-time {
      font-weight: bold;
      font-size: 7.5pt;
      text-align: center;
      justify-content: center;
      background-color: #f5f5f5 !important;
      font-family: 'Courier New', monospace;
    }
    
    .athletics-event {
      text-align: left;
      font-weight: 500;
      padding-left: 3px !important;
      padding-right: 2px !important;
    }
    
    .athletics-event-main {
      font-weight: bold;
      font-size: 7pt;
      line-height: 1.0;
    }
    
    .athletics-event-details {
      font-size: 6pt;
      color: #666;
      margin-top: 0px;
      line-height: 1.0;
    }
    
    .athletics-gender {
      text-align: center;
      justify-content: center;
      font-weight: bold;
      font-size: 7pt;
    }
    
    .athletics-category {
      text-align: center;
      justify-content: center;
      font-size: 6.5pt;
      font-weight: 500;
    }
    
    .athletics-round {
      text-align: center;
      justify-content: center;
      font-size: 6.5pt;
      font-weight: bold;
    }
    
    .athletics-notes {
      text-align: left;
      font-size: 6pt;
      color: #333;
      padding-left: 2px !important;
      line-height: 1.0;
    }
    
    /* OZNACZENIA PŁCI */
    .gender-m { 
      color: #1a5490; 
      font-weight: bold;
    }
    .gender-f { 
      color: #b91c7c; 
      font-weight: bold;
    }
    .gender-mixed { 
      color: #555; 
      font-weight: bold;
    }
    
    /* OZNACZENIA RUND */
    .round-qualification { 
      background-color: #fff8dc !important; 
      color: #8b4513;
    }
    .round-semifinal { 
      background-color: #e6f3ff !important; 
      color: #0066cc;
    }
    .round-final { 
      background-color: #e8f5e8 !important; 
      color: #006600;
      font-weight: bold;
    }
    
    /* STOPKA */
    .athletics-footer {
      margin-top: 8px;
      padding-top: 4px;
      border-top: 1px solid #000;
      text-align: center;
      font-size: 5.5pt;
      color: #666;
      page-break-inside: avoid;
    }
    
    .athletics-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 5.5pt;
      color: #444;
      font-weight: normal;
    }
    
    .athletics-stats > div {
      padding: 1px 2px;
    }
    
    /* UKRYJ ELEMENTY INTERFEJSU */
    .print\\:hidden {
      display: none !important;
    }
    
    /* ŁAMANIE STRON */
    .athletics-section {
      page-break-inside: avoid;
    }
    
    .athletics-program-row {
      page-break-inside: avoid;
    }
  }
`;

interface ScheduleItem {
  id: string;
  eventId: string;
  scheduledTime: string;
  duration: number;
  round: "QUALIFICATION" | "SEMIFINAL" | "FINAL";
  roundName?: string;
  seriesCount: number;
  finalistsCount?: number;
  notes?: string;
  event: Event;
}

interface RosterStyleMinuteProgramProps {
  competitionId: string;
  onClose?: () => void;
}

// Funkcja do formatowania nazwy konkurencji
const formatEventName = (event: Event): string => {
  if (event.distance) {
    return event.distance;
  }
  return event.name;
};

// Funkcja do formatowania płci
const formatGender = (gender: Gender): string => {
  switch (gender) {
    case "MALE":
      return "Mężczyźni";
    case "FEMALE":
      return "Kobiety";
    case "MIXED":
      return "Mieszane";
    default:
      return gender;
  }
};

// Funkcja do formatowania kategorii
const formatCategory = (category: Category): string => {
  // Kategorie wiekowe
  if (category.startsWith("AGE_")) {
    const age = category.replace("AGE_", "").replace("_", "-");
    return `${age} lat`;
  }

  // Kategorie U
  if (category.startsWith("U")) {
    const age = category.replace("U", "");
    return `${age} lat`;
  }

  // Kategorie Masters
  if (category.startsWith("M")) {
    return category;
  }

  // Kategorie szkolne
  if (category.includes("CLASS_")) {
    const classNum = category.match(/CLASS_(\d+)/)?.[1];
    return classNum ? `${classNum} klasa` : category;
  }

  // Specjalne kategorie
  const categoryMap: Partial<Record<Category, string>> = {
    WIELE: "Wiele",
    SENIOR: "Seniorzy",
  };

  return categoryMap[category] || category;
};

// Funkcja do formatowania rundy
const formatRound = (round: string, roundName?: string): string => {
  if (roundName) return roundName;

  switch (round) {
    case "QUALIFICATION":
      return "Serie";
    case "SEMIFINAL":
      return "Półfinał";
    case "FINAL":
      return "Finał";
    default:
      return round;
  }
};

// Funkcja do formatowania informacji o awansie/medalu
const formatAdvancement = (item: ScheduleItem): string => {
  const parts: string[] = [];

  if (item.finalistsCount) {
    parts.push(`${item.finalistsCount} do finału`);
  }

  if (item.round === "FINAL") {
    parts.push("Ustaw zasady");
  }

  return parts.join(", ") || "-";
};

export default function RosterStyleMinuteProgram({
  competitionId,
  onClose,
}: RosterStyleMinuteProgramProps) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [programName, setProgramName] = useState("Program minutowy");
  const [programDescription, setProgramDescription] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<ScheduleItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sortBy, setSortBy] = useState<"time" | "event" | "category">("time");
  const [filterGender, setFilterGender] = useState<Gender | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkTimeShift, setBulkTimeShift] = useState(0);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Pobierz logo zawodów
  const { data: logosData } = useCompetitionLogos(competitionId);
  const logos = (logosData || []).filter((logo) => logo.isVisible !== false);

  // Pobierz wydarzenia dla zawodów
  const { data: events } = useQuery({
    queryKey: ["events", competitionId],
    queryFn: async () => {
      const response = await api.get(`/events?competitionId=${competitionId}`);
      return response.data as Event[];
    },
  });

  // Pobierz informacje o zawodach
  const { data: competition } = useQuery({
    queryKey: ["competition", competitionId],
    queryFn: async () => {
      const response = await api.get(`/competitions/${competitionId}`);
      return response.data;
    },
  });

  // Pobierz istniejący program minutowy
  const { data: existingSchedule, isLoading } = useQuery({
    queryKey: ["minute-program", competitionId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/organization/schedules?competitionId=${competitionId}`
        );
        const schedules = response.data;
        if (schedules && schedules.length > 0) {
          const schedule = schedules[0];
          setProgramName(schedule.name);
          setProgramDescription(schedule.description || "");

          // Pobierz szczegóły programu
          const detailsResponse = await api.get(
            `/organization/schedules/${schedule.id}`
          );
          const items = detailsResponse.data.items || [];

          setScheduleItems(
            items.map((item: any) => ({
              ...item,
              scheduledTime: format(new Date(item.scheduledTime), "HH:mm"),
            }))
          );

          return schedule;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
  });

  // Mutacja do zapisywania programu
  const saveScheduleMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      items: ScheduleItem[];
    }) => {
      setIsSaving(true);

      const scheduleData = {
        name: data.name,
        description: data.description,
        competitionId,
        items: data.items.map((item) => ({
          eventId: item.eventId,
          scheduledTime: `2024-01-01T${item.scheduledTime}:00`,
          duration: item.duration,
          round: item.round,
          roundName: item.roundName,
          seriesCount: item.seriesCount,
          finalistsCount: item.finalistsCount,
          notes: item.notes,
        })),
      };

      if (existingSchedule) {
        return await api.patch(
          `/organization/schedules/${existingSchedule.id}`,
          scheduleData
        );
      } else {
        return await api.post("/organization/schedules", scheduleData);
      }
    },
    onSuccess: () => {
      toast.success("Program minutowy został zapisany");
      queryClient.invalidateQueries({
        queryKey: ["minute-program", competitionId],
      });
      queryClient.invalidateQueries({ queryKey: ["schedules", competitionId] });
    },
    onError: (error: any) => {
      toast.error(
        "Błąd podczas zapisywania: " +
          (error.response?.data?.message || error.message)
      );
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    saveScheduleMutation.mutate({
      name: programName,
      description: programDescription,
      items: scheduleItems,
    });
  };

  const handleAddItem = () => {
    setNewItem({
      eventId: "",
      scheduledTime: "09:00",
      duration: 15,
      round: "QUALIFICATION",
      seriesCount: 1,
    });
  };

  const handleGenerateAuto = async () => {
    if (!events || events.length === 0) {
      toast.error("Brak wydarzeń do wygenerowania programu");
      return;
    }

    try {
      setIsSaving(true);

      // Generuj automatyczny program na podstawie wydarzeń
      const autoItems: ScheduleItem[] = [];
      let currentTime = "09:00";

      // Sortuj wydarzenia: najpierw biegowe, potem techniczne
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

      sortedEvents.forEach((event, index) => {
        const participantCount = event._count?.registrationEvents || 0;

        // Określ rundę na podstawie liczby uczestników
        const rounds: Array<{
          round: "QUALIFICATION" | "SEMIFINAL" | "FINAL";
          roundName?: string;
          seriesCount: number;
          finalistsCount?: number;
        }> = [];

        if (event.type === EventType.TRACK) {
          // Dla biegów - zawsze serie
          rounds.push({
            round: "QUALIFICATION",
            roundName: "Serie",
            seriesCount: Math.max(1, Math.ceil(participantCount / 8)),
          });
        } else if (event.type === EventType.FIELD) {
          // Dla konkurencji technicznych
          if (participantCount <= 12) {
            rounds.push({
              round: "FINAL",
              roundName: "Finał",
              seriesCount: 1,
            });
          } else {
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
          // Dla pozostałych typów
          rounds.push({
            round: "FINAL",
            roundName: "Finał",
            seriesCount: Math.ceil(participantCount / 8),
          });
        }

        rounds.forEach((roundInfo, roundIndex) => {
          // Określ czas trwania na podstawie typu konkurencji
          // Nowa logika:
          // - Sprinty płaskie: 3 min/seria, bez przerw między seriami
          // - Sprinty płotkowe: 3 min/seria + 10 min przerwy
          // - Średnie dystanse: 10 min/seria + 5 min przerwy
          // - Konkurencje techniczne: 2 min/zawodnik/próba
          let duration = 15;
          let breakTime = 0; // Przerwa po konkurencji

          if (event.type === EventType.TRACK) {
            const eventName = event.name.toLowerCase();
            const isHurdles =
              eventName.includes("płotki") ||
              eventName.includes("hurdles") ||
              (eventName.includes("110m") && eventName.includes("płotki")) ||
              (eventName.includes("100m") && eventName.includes("płotki")) ||
              (eventName.includes("400m") && eventName.includes("płotki")) ||
              eventName.includes("110m hurdles") ||
              eventName.includes("100m hurdles") ||
              eventName.includes("400m hurdles");

            // Sprinty do 400m - 3 minuty na serię
            if (
              eventName.includes("60m") ||
              eventName.includes("100m") ||
              eventName.includes("200m") ||
              eventName.includes("400m")
            ) {
              duration = roundInfo.seriesCount * 3;
              breakTime = isHurdles ? 10 : 0; // Płotki mają przerwę, płaskie nie
            }
            // Średnie dystanse (800m, 1500m) - 10 minut na serię
            else if (
              eventName.includes("800m") ||
              eventName.includes("1500m")
            ) {
              duration = roundInfo.seriesCount * 10;
              breakTime = 5; // Krótka przerwa
            }
            // Długie dystanse (3000m, 5000m, 10000m) - 15 minut na serię
            else if (
              eventName.includes("3000m") ||
              eventName.includes("5000m") ||
              eventName.includes("10000m") ||
              eventName.includes("maraton")
            ) {
              duration = roundInfo.seriesCount * 15;
              breakTime = 10;
            }
            // Sztafety - 5 minut na serię
            else if (
              eventName.includes("4x") ||
              eventName.includes("sztafeta")
            ) {
              duration = roundInfo.seriesCount * 5;
              breakTime = 5;
            }
            // Inne biegi - domyślnie 10 minut na serię
            else {
              duration = roundInfo.seriesCount * 10;
              breakTime = 5;
            }
          } else if (event.type === EventType.FIELD) {
            // Konkurencje techniczne - 2 minuty na zawodnika
            const participantCount = event._count?.registrationEvents || 0;
            const actualParticipants =
              roundInfo.round === "FINAL" && roundInfo.finalistsCount
                ? roundInfo.finalistsCount
                : participantCount;

            const eventName = event.name.toLowerCase();
            let attemptsPerAthlete = 3; // Domyślnie 3 próby

            // Określ liczbę prób na podstawie konkurencji
            if (
              eventName.includes("skok wzwyż") ||
              eventName.includes("high jump") ||
              eventName.includes("skok o tyczce") ||
              eventName.includes("pole vault")
            ) {
              // Skoki pionowe - więcej czasu na próbę (3 minuty na zawodnika)
              attemptsPerAthlete = 1; // Liczymy jako 1 próbę, ale 3 minuty
              duration = Math.max(20, actualParticipants * 3);
            } else if (
              eventName.includes("skok w dal") ||
              eventName.includes("long jump") ||
              eventName.includes("skok potrójny") ||
              eventName.includes("triple jump")
            ) {
              attemptsPerAthlete = 3; // 3 próby w skokach poziomych
            } else if (
              eventName.includes("pchnięcie") ||
              eventName.includes("shot put") ||
              eventName.includes("rzut dyskiem") ||
              eventName.includes("discus") ||
              eventName.includes("rzut młotem") ||
              eventName.includes("hammer") ||
              eventName.includes("rzut oszczepem") ||
              eventName.includes("javelin")
            ) {
              attemptsPerAthlete = 3; // 3 próby w rzutach (6 w finale)
              if (roundInfo.round === "FINAL") {
                attemptsPerAthlete = 6; // Finał ma 6 prób
              }
            } else if (
              eventName.includes("wielobój") ||
              eventName.includes("combined")
            ) {
              attemptsPerAthlete = 3;
            }

            // Dla skoków pionowych już obliczono duration wyżej
            if (
              !(
                eventName.includes("skok wzwyż") ||
                eventName.includes("high jump") ||
                eventName.includes("skok o tyczce") ||
                eventName.includes("pole vault")
              )
            ) {
              // Oblicz czas: liczba zawodników × próby × 2 minuty
              duration = Math.max(
                15,
                actualParticipants * attemptsPerAthlete * 2
              );
            }

            breakTime = 5; // Krótka przerwa po konkurencjach technicznych
          }

          autoItems.push({
            id: `auto-${event.id}-${roundInfo.round}`,
            eventId: event.id,
            scheduledTime: currentTime,
            duration,
            round: roundInfo.round,
            roundName: roundInfo.roundName,
            seriesCount: roundInfo.seriesCount,
            finalistsCount: roundInfo.finalistsCount,
            event,
          });

          // Oblicz następny czas z odpowiednią przerwą
          const [hours, minutes] = currentTime.split(":").map(Number);
          const totalMinutes = hours * 60 + minutes + duration + breakTime;
          const nextHours = Math.floor(totalMinutes / 60);
          const nextMinutes = totalMinutes % 60;
          currentTime = `${nextHours.toString().padStart(2, "0")}:${nextMinutes.toString().padStart(2, "0")}`;
        });
      });

      setScheduleItems(autoItems);
      toast.success("Program minutowy został wygenerowany automatycznie");
    } catch (error) {
      toast.error("Błąd podczas generowania programu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewItem = () => {
    if (!newItem || !newItem.eventId) {
      toast.error("Wybierz konkurencję");
      return;
    }

    const event = events?.find((e) => e.id === newItem.eventId);
    if (!event) {
      toast.error("Nie znaleziono konkurencji");
      return;
    }

    const item: ScheduleItem = {
      id: `new-${Date.now()}`,
      eventId: newItem.eventId,
      scheduledTime: newItem.scheduledTime || "09:00",
      duration: newItem.duration || 15,
      round: newItem.round || "QUALIFICATION",
      roundName: newItem.roundName,
      seriesCount: newItem.seriesCount || 1,
      finalistsCount: newItem.finalistsCount,
      notes: newItem.notes,
      event,
    };

    setScheduleItems([...scheduleItems, item]);
    setNewItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setScheduleItems(scheduleItems.filter((item) => item.id !== itemId));
  };

  const handleDuplicateItem = (item: ScheduleItem) => {
    const duplicatedItem: ScheduleItem = {
      ...item,
      id: `duplicate-${Date.now()}`,
      scheduledTime: (() => {
        const [hours, minutes] = item.scheduledTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + (item.duration || 15) + 10;
        const nextHours = Math.floor(totalMinutes / 60);
        const nextMinutes = totalMinutes % 60;
        return `${nextHours.toString().padStart(2, "0")}:${nextMinutes.toString().padStart(2, "0")}`;
      })(),
    };

    setScheduleItems([...scheduleItems, duplicatedItem]);
    toast.success("Pozycja została zduplikowana");
  };

  const handleBulkTimeShift = () => {
    if (bulkTimeShift === 0) {
      toast.error("Wprowadź liczbę minut do przesunięcia");
      return;
    }

    const updatedItems = scheduleItems.map((item) => {
      const [hours, minutes] = item.scheduledTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + bulkTimeShift;

      // Sprawdź czy czas nie jest ujemny
      if (totalMinutes < 0) {
        toast.error("Nie można przesunąć czasu przed 00:00");
        return item;
      }

      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;

      return {
        ...item,
        scheduledTime: `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`,
      };
    });

    setScheduleItems(updatedItems);
    setShowBulkEdit(false);
    setBulkTimeShift(0);
    toast.success(`Program przesunięty o ${bulkTimeShift} minut`);
  };

  const handlePrint = () => {
    // Dodaj style do head
    const styleElement = document.createElement("style");
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);

    // Uruchom drukowanie
    window.print();

    // Usuń style po drukowaniu
    setTimeout(() => {
      document.head.removeChild(styleElement);
    }, 1000);
  };

  const handleEditItem = (item: ScheduleItem, field: string, value: any) => {
    setScheduleItems(
      scheduleItems.map((i) =>
        i.id === item.id ? { ...i, [field]: value } : i
      )
    );
  };

  const handleDownload = () => {
    toast.info("Funkcja pobierania PDF będzie dostępna wkrótce");
  };

  // Funkcja do sortowania i filtrowania pozycji
  // Funkcja do sortowania konkurencji według dystansu
  const getEventSortValue = (event: any) => {
    const distance = event.distance || event.name || "";

    // Wyciągnij liczbę z dystansu (np. "100m" -> 100, "1500m" -> 1500)
    const match = distance.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 999999; // Konkurencje bez dystansu na końcu

    let value = parseFloat(match[1]);

    // Konwersja jednostek na metry dla porównania
    if (distance.includes("km")) {
      value *= 1000;
    } else if (distance.includes("mil")) {
      value *= 1609.34; // mila = 1609.34m
    }

    // Specjalne przypadki dla konkurencji technicznych
    if (
      distance.includes("skok") ||
      distance.includes("rzut") ||
      distance.includes("pchnięcie")
    ) {
      return 999999 + value; // Konkurencje techniczne po biegowych
    }

    return value;
  };

  // Funkcja do sortowania kategorii wiekowych (od najmłodszej do najstarszej)
  const getCategorySortValue = (category: Category) => {
    // Kategorie U (np. U16, U18, U20) - im mniejsza liczba, tym młodsza kategoria
    if (category.startsWith("U")) {
      const age = parseInt(category.replace("U", ""));
      return age || 999;
    }

    // Kategorie AGE_ (np. AGE_16_17)
    if (category.startsWith("AGE_")) {
      const ageMatch = category.match(/AGE_(\d+)/);
      if (ageMatch) {
        return parseInt(ageMatch[1]);
      }
    }

    // Kategorie szkolne (CLASS_)
    if (category.includes("CLASS_")) {
      const classMatch = category.match(/CLASS_(\d+)/);
      if (classMatch) {
        // Im wyższa klasa, tym starsi uczniowie
        return parseInt(classMatch[1]) + 10; // +10 żeby były po kategoriach U
      }
    }

    // Specjalne kategorie
    const specialCategories: Record<string, number> = {
      SENIOR: 100, // Seniorzy na końcu
      WIELE: 999, // Kategorie mieszane na samym końcu
    };

    return specialCategories[category] || 50; // Domyślna wartość dla nieznanych kategorii
  };

  const getFilteredAndSortedItems = () => {
    let filtered = scheduleItems;

    // Filtrowanie po płci
    if (filterGender !== "ALL") {
      filtered = filtered.filter((item) => item.event.gender === filterGender);
    }

    // Filtrowanie po kategorii
    if (filterCategory !== "ALL") {
      filtered = filtered.filter(
        (item) => item.event.category === filterCategory
      );
    }

    // Sortowanie
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "time":
          return a.scheduledTime.localeCompare(b.scheduledTime);
        case "event":
          // 1. Sortowanie według dystansu (od najmniejszego do największego)
          const distanceA = getEventSortValue(a.event);
          const distanceB = getEventSortValue(b.event);
          if (distanceA !== distanceB) {
            return distanceA - distanceB;
          }

          // 2. Jeśli dystanse są takie same, sortuj według kategorii wiekowej (od najmłodszej)
          const categoryA = getCategorySortValue(a.event.category);
          const categoryB = getCategorySortValue(b.event.category);
          if (categoryA !== categoryB) {
            return categoryA - categoryB;
          }

          // 3. Jeśli dystanse i kategorie są takie same, sortuj alfabetycznie
          return formatEventName(a.event).localeCompare(
            formatEventName(b.event)
          );
        case "category":
          return formatCategory(a.event.category).localeCompare(
            formatCategory(b.event.category)
          );
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Funkcja do grupowania pozycji według typu dla druku
  const getGroupedItemsForPrint = () => {
    const filteredItems = getFilteredAndSortedItems();

    const trackEvents = filteredItems.filter(
      (item) => item.event.type === EventType.TRACK
    );
    const fieldEvents = filteredItems.filter(
      (item) => item.event.type === EventType.FIELD
    );
    const otherEvents = filteredItems.filter(
      (item) =>
        item.event.type !== EventType.TRACK &&
        item.event.type !== EventType.FIELD
    );

    return {
      trackEvents,
      fieldEvents,
      otherEvents,
    };
  };

  // Funkcja do renderowania tabeli dla sekcji
  const renderSectionTable = (
    items: ScheduleItem[],
    showActions: boolean = true
  ) => (
    <Table className="print-table">
      <TableHeader>
        <TableRow>
          <TableHead className="print:w-[25%]">Konkurencja</TableHead>
          <TableHead className="print:w-[8%]">Płeć</TableHead>
          <TableHead className="print:w-[12%]">Kategoria</TableHead>
          <TableHead className="print:w-[10%]">Runda</TableHead>
          <TableHead className="print:w-[12%]">Data</TableHead>
          <TableHead className="print:w-[10%]">Godzina</TableHead>
          <TableHead className="print:w-[23%]">Awans/medal</TableHead>
          {showActions && <TableHead className="print:hidden">Akcje</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={showActions ? 8 : 7}
              className="text-center py-8 text-gray-500"
            >
              Brak pozycji w tej sekcji.
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="event-name">
                <div className="font-medium">{formatEventName(item.event)}</div>
                {item.event.distance &&
                  item.event.name !== item.event.distance && (
                    <div className="text-sm text-gray-500 print:text-xs">
                      {item.event.name}
                    </div>
                  )}
              </TableCell>
              <TableCell className="text-center">
                {formatGender(item.event.gender)}
              </TableCell>
              <TableCell className="text-center">
                {formatCategory(item.event.category)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {formatRound(item.round, item.roundName)}
                </Badge>
                {item.seriesCount > 1 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {editingItem === `${item.id}-series` ? (
                      <Input
                        type="number"
                        min="1"
                        value={item.seriesCount}
                        onChange={(e) =>
                          handleEditItem(
                            item,
                            "seriesCount",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 h-6 text-xs"
                        onBlur={() => setEditingItem(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingItem(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                        onClick={() => setEditingItem(`${item.id}-series`)}
                      >
                        {item.seriesCount} serii
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center gap-1 print:justify-center">
                  <Calendar className="w-4 h-4 text-gray-400 print:hidden" />
                  <span className="print:font-normal">
                    {competition
                      ? format(new Date(competition.startDate), "dd/MM/yyyy")
                      : "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="time-cell">
                <div className="flex items-center gap-1 print:justify-center">
                  <Clock className="w-4 h-4 text-gray-400 print:hidden" />
                  {editingItem === item.id ? (
                    <Input
                      type="time"
                      value={item.scheduledTime}
                      onChange={(e) =>
                        handleEditItem(item, "scheduledTime", e.target.value)
                      }
                      className="w-20"
                      onBlur={() => setEditingItem(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingItem(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                      onClick={() => setEditingItem(item.id)}
                    >
                      {item.scheduledTime}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="notes-cell">
                <div className="text-sm print:text-xs">
                  {formatAdvancement(item)}
                </div>
                {item.notes ? (
                  <div className="text-xs text-gray-500 mt-1 print:text-xs print:italic">
                    {editingItem === `${item.id}-notes` ? (
                      <Input
                        value={item.notes}
                        onChange={(e) =>
                          handleEditItem(item, "notes", e.target.value)
                        }
                        className="w-full h-6 text-xs"
                        onBlur={() => setEditingItem(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingItem(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                        onClick={() => setEditingItem(`${item.id}-notes`)}
                      >
                        {item.notes}
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    className="text-xs text-gray-400 mt-1 cursor-pointer hover:bg-gray-100 px-1 rounded"
                    onClick={() => {
                      handleEditItem(item, "notes", "Dodaj uwagę...");
                      setEditingItem(`${item.id}-notes`);
                    }}
                  >
                    + Dodaj uwagę
                  </div>
                )}
              </TableCell>
              {showActions && (
                <TableCell className="print:hidden">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateItem(item)}
                      title="Duplikuj pozycję"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item.id)}
                      title="Edytuj"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Usuń"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  // Funkcja do renderowania profesjonalnego programu atletycznego
  const renderAthleticsProgram = (items: ScheduleItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Brak pozycji w tej sekcji.
        </div>
      );
    }

    return (
      <div className="athletics-program">
        <div className="athletics-program-header">
          <div>Godz.</div>
          <div>Konkurencja</div>
          <div>Płeć</div>
          <div>Kategoria</div>
          <div>Runda</div>
          <div>Uwagi</div>
        </div>
        {items.map((item) => (
          <div key={item.id} className="athletics-program-row">
            <div className={`athletics-time`}>{item.scheduledTime}</div>
            <div className="athletics-event">
              <div className="athletics-event-main">
                {formatEventName(item.event)}
              </div>
              {item.event.distance &&
                item.event.name !== item.event.distance && (
                  <div className="athletics-event-details">
                    {item.event.name}
                  </div>
                )}
              {item.seriesCount > 1 && (
                <div className="athletics-event-details">
                  {item.seriesCount} serii
                </div>
              )}
            </div>
            <div
              className={`athletics-gender gender-${item.event.gender.toLowerCase()}`}
            >
              {formatGender(item.event.gender)}
            </div>
            <div className="athletics-category">
              {formatCategory(item.event.category)}
            </div>
            <div
              className={`athletics-round round-${item.round.toLowerCase()}`}
            >
              {formatRound(item.round, item.roundName)}
            </div>
            <div className="athletics-notes">
              {formatAdvancement(item)}
              {item.notes && (
                <div style={{ marginTop: "2px" }}>{item.notes}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kompaktowy nagłówek do druku */}
      <div className="hidden print:block athletics-header">
        {selectedLogoId && logos.find((logo) => logo.id === selectedLogoId) && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${logos.find((logo) => logo.id === selectedLogoId)?.url}`}
            alt="Logo"
            className="athletics-logo"
          />
        )}
        <div className="athletics-header-content">
          <div className="athletics-title-compact">
            {competition?.name || "Program Minutowy"}{" "}
            {competition?.location && `• ${competition.location}`}
          </div>
          <div className="athletics-date-compact">
            {competition?.startDate
              ? format(new Date(competition.startDate), "dd.MM.yyyy")
              : format(new Date(), "dd.MM.yyyy")}
          </div>
        </div>
      </div>

      {/* Header - widoczny tylko na ekranie */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Program minutowy</h2>
          <p className="text-gray-600">
            Zarządzaj programem w stylu Roster Athletics
          </p>
        </div>
        <div className="flex gap-2">
          {/* Selektor logo do druku */}
          {logos.length > 0 && (
            <Select
              value={selectedLogoId || ""}
              onValueChange={setSelectedLogoId}
            >
              <SelectTrigger className="w-40">
                <Image className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Wybierz logo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Bez logo</SelectItem>
                {logos.map((logo) => (
                  <SelectItem key={logo.id} value={logo.id}>
                    {logo.originalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Pobierz PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Drukuj
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Zapisywanie..." : "Zapisz"}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Zamknij
            </Button>
          )}
        </div>
      </div>

      {/* Program Settings */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Ustawienia programu</CardTitle>
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
              <Label htmlFor="programDescription">Opis</Label>
              <Input
                id="programDescription"
                value={programDescription}
                onChange={(e) => setProgramDescription(e.target.value)}
                placeholder="Opis programu (opcjonalnie)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Item Form */}
      {newItem && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Dodaj nową pozycję</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Konkurencja</Label>
                <Select
                  value={newItem.eventId}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, eventId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz konkurencję" />
                  </SelectTrigger>
                  <SelectContent>
                    {events?.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {formatEventName(event)} - {formatGender(event.gender)}{" "}
                        {formatCategory(event.category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Godzina</Label>
                <Input
                  type="time"
                  value={newItem.scheduledTime}
                  onChange={(e) =>
                    setNewItem({ ...newItem, scheduledTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Runda</Label>
                <Select
                  value={newItem.round}
                  onValueChange={(value: any) =>
                    setNewItem({ ...newItem, round: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUALIFICATION">Serie</SelectItem>
                    <SelectItem value="SEMIFINAL">Półfinał</SelectItem>
                    <SelectItem value="FINAL">Finał</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Liczba serii</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.seriesCount}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      seriesCount: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <Label>Finaliści (opcjonalnie)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.finalistsCount || ""}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      finalistsCount: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label>Czas trwania (min)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.duration}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      duration: parseInt(e.target.value) || 15,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Uwagi</Label>
              <Textarea
                value={newItem.notes || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, notes: e.target.value })
                }
                placeholder="Dodatkowe uwagi (opcjonalnie)"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveNewItem}>
                <Save className="w-4 h-4 mr-2" />
                Dodaj
              </Button>
              <Button variant="outline" onClick={() => setNewItem(null)}>
                Anuluj
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <CardTitle>Pełny program minutowy</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerateAuto}
                disabled={!events || events.length === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                Generuj automatycznie
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkEdit(!showBulkEdit)}
                disabled={scheduleItems.length === 0}
              >
                <Clock className="w-4 h-4 mr-2" />
                Przesuń czasy
              </Button>
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj pozycję
              </Button>
            </div>
          </div>

          {/* Filtry i sortowanie */}
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Sortuj:</Label>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Czas</SelectItem>
                  <SelectItem value="event">Konkurencja</SelectItem>
                  <SelectItem value="category">Kategoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Płeć:</Label>
              <Select
                value={filterGender}
                onValueChange={(value: any) => setFilterGender(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Wszystkie</SelectItem>
                  <SelectItem value="MALE">Mężczyźni</SelectItem>
                  <SelectItem value="FEMALE">Kobiety</SelectItem>
                  <SelectItem value="MIXED">Mieszane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Kategoria:</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Wszystkie</SelectItem>
                  {Array.from(
                    new Set(scheduleItems.map((item) => item.event.category))
                  ).map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Masowe przesuwanie czasów */}
          {showBulkEdit && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    Przesuń wszystkie czasy o:
                  </Label>
                  <Input
                    type="number"
                    value={bulkTimeShift}
                    onChange={(e) =>
                      setBulkTimeShift(parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-600">minut</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkTimeShift}
                    disabled={bulkTimeShift === 0}
                  >
                    Zastosuj
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBulkEdit(false)}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Wprowadź liczbę dodatnią aby przesunąć w przód, ujemną aby
                przesunąć wstecz.
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Widok na ekranie - jedna tabela */}
          <div className="overflow-x-auto print:hidden">
            {renderSectionTable(getFilteredAndSortedItems(), true)}
          </div>

          {/* Widok do druku - sekcje tematyczne */}
          <div className="hidden print:block">
            {(() => {
              const { trackEvents, fieldEvents, otherEvents } =
                getGroupedItemsForPrint();

              const hasAnyEvents =
                trackEvents.length > 0 ||
                fieldEvents.length > 0 ||
                otherEvents.length > 0;

              if (!hasAnyEvents) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    Brak pozycji w programie. Kliknij "Dodaj pozycję" lub
                    "Generuj automatycznie" aby rozpocząć.
                  </div>
                );
              }

              return (
                <>
                  {/* Sekcja biegów */}
                  {trackEvents.length > 0 && (
                    <div className="athletics-section">
                      <div className="athletics-section-header">
                        Konkurencje Biegowe
                      </div>
                      {renderAthleticsProgram(trackEvents)}
                    </div>
                  )}

                  {/* Sekcja konkurencji technicznych */}
                  {fieldEvents.length > 0 && (
                    <div className="athletics-section">
                      <div className="athletics-section-header">
                        Konkurencje Techniczne
                      </div>
                      {renderAthleticsProgram(fieldEvents)}
                    </div>
                  )}

                  {/* Sekcja innych konkurencji */}
                  {otherEvents.length > 0 && (
                    <div className="athletics-section">
                      <div className="athletics-section-header">
                        Inne Konkurencje
                      </div>
                      {renderAthleticsProgram(otherEvents)}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Profesjonalna stopka atletyczna */}
            {scheduleItems.length > 0 && (
              <div className="athletics-footer">
                <div className="athletics-stats">
                  <div>Łączna liczba pozycji: {scheduleItems.length}</div>
                  <div>
                    Konkurencje biegowe:{" "}
                    {
                      scheduleItems.filter(
                        (item) => item.event.type === EventType.TRACK
                      ).length
                    }
                  </div>
                  <div>
                    Konkurencje techniczne:{" "}
                    {
                      scheduleItems.filter(
                        (item) => item.event.type === EventType.FIELD
                      ).length
                    }
                  </div>
                  <div>
                    Wygenerowano: {format(new Date(), "dd.MM.yyyy HH:mm")}
                  </div>
                </div>
                <div style={{ marginTop: "8px", textAlign: "center" }}>
                  Program minutowy wygenerowany przez system zarządzania
                  zawodami lekkoatletycznymi
                </div>
              </div>
            )}
          </div>

          {/* Statystyki programu */}
          {scheduleItems.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg print:hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">
                    Łączna liczba pozycji
                  </div>
                  <div className="text-gray-600">{scheduleItems.length}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Konkurencje biegowe
                  </div>
                  <div className="text-gray-600">
                    {
                      scheduleItems.filter(
                        (item) => item.event.type === EventType.TRACK
                      ).length
                    }
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Konkurencje techniczne
                  </div>
                  <div className="text-gray-600">
                    {
                      scheduleItems.filter(
                        (item) => item.event.type === EventType.FIELD
                      ).length
                    }
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Szacowany czas trwania
                  </div>
                  <div className="text-gray-600">
                    {scheduleItems.length > 0 &&
                      (() => {
                        const firstTime = scheduleItems.sort((a, b) =>
                          a.scheduledTime.localeCompare(b.scheduledTime)
                        )[0]?.scheduledTime;
                        const lastItem = scheduleItems.sort((a, b) =>
                          b.scheduledTime.localeCompare(a.scheduledTime)
                        )[0];
                        if (firstTime && lastItem) {
                          const [lastHours, lastMinutes] =
                            lastItem.scheduledTime.split(":").map(Number);
                          const endTime =
                            lastHours * 60 +
                            lastMinutes +
                            (lastItem.duration || 15);
                          const [firstHours, firstMinutesStart] = firstTime
                            .split(":")
                            .map(Number);
                          const startTime = firstHours * 60 + firstMinutesStart;
                          const totalMinutes = endTime - startTime;
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          return `${hours}h ${minutes}min`;
                        }
                        return "-";
                      })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
