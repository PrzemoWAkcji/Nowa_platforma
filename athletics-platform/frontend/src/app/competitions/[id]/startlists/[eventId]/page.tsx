"use client";

import { PzlaBulkUpdateDialog } from "@/components/athletes/PzlaBulkUpdateDialog";
import { PzlaUpdateDialog } from "@/components/athletes/PzlaUpdateDialog";
import { QuickCombinedEventRegistration } from "@/components/combined-events/QuickCombinedEventRegistration";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AddAthleteModal } from "@/components/startlist/AddAthleteModal";
import { SeedingModal } from "@/components/startlist/SeedingModal";
import { StartlistPDFGenerator } from "@/components/startlist/StartlistPDFGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompetition } from "@/hooks/useCompetitions";
import { useDeleteEvent, useEvent } from "@/hooks/useEvents";
import { useEventHeats, useSaveStartlist } from "@/hooks/useHeats";
import {
  useDeleteRegistration,
  useRegistrations,
  useStartListSortedByRecords,
  useUpdateRegistration,
} from "@/hooks/useRegistrations";
import { Heat, HeatLane, Registration } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Download,
  FileText,
  Hash,
  Plus,
  Save,
  Settings,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Używamy globalnych typów z @/types

// Funkcja do pobierania godziny z programu minutowego
const getScheduledTimeFromEvent = (event: any): string | null => {
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

export default function EventStartlistPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const eventId = params.eventId as string;

  const [heats, setHeats] = useState<Heat[]>([]);
  // const [numberOfHeats] = useState(1); // Obecnie nieużywane
  const [lanesPerHeat] = useState(8);
  const [assignmentMethod] = useState<"manual" | "seedTime" | "random">(
    "seedTime"
  );
  const [manualAssignments, setManualAssignments] = useState<{
    [key: string]: string;
  }>({});
  const [editingBibNumber, setEditingBibNumber] = useState<string | null>(null);
  const [tempBibNumber, setTempBibNumber] = useState<string>("");
  const [showSeedingModal, setShowSeedingModal] = useState(false);
  const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
  const [showCombinedEventRegistration, setShowCombinedEventRegistration] =
    useState(false);
  const [showPzlaDialog, setShowPzlaDialog] = useState(false);
  const [selectedAthleteForPzla, setSelectedAthleteForPzla] = useState<
    string | null
  >(null);
  const [showPzlaBulkDialog, setShowPzlaBulkDialog] = useState(false);

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: competition } = useCompetition(competitionId);
  const { data: registrations } = useRegistrations({
    competitionId,
    eventId,
  });
  const { data: registrationsWithRecords } = useStartListSortedByRecords(
    competitionId,
    eventId,
    "PB"
  );
  const deleteEventMutation = useDeleteEvent();
  const updateRegistrationMutation = useUpdateRegistration();
  const deleteRegistrationMutation = useDeleteRegistration();
  const saveStartlistMutation = useSaveStartlist();
  const { data: existingHeats } = useEventHeats(eventId);

  // Sprawdź czy konkurencja jest techniczna (nie wymaga serii)
  const isFieldEvent = event?.type === "FIELD";

  // Sprawdź czy to wielobój
  const isCombinedEvent = event?.type === "COMBINED";

  // Sprawdź czy to bieg na 800m (można rozstawiać po 2 osoby na torze)
  const is800m =
    event?.name?.toLowerCase().includes("800m") ||
    event?.name?.toLowerCase().includes("800 m");

  // Ładuj istniejące serie z bazy danych
  useEffect(() => {
    if (
      existingHeats &&
      existingHeats.length > 0 &&
      registrations &&
      Array.isArray(registrations)
    ) {
      const loadedHeats: Heat[] = existingHeats.map(
        (heat: {
          id: string;
          heatNumber: number;
          maxLanes?: number;
          assignments?: Array<{
            lane: number;
            athlete: {
              id: string;
              firstName: string;
              lastName: string;
              club?: string;
            };
            bibNumber?: string;
          }>;
        }) => {
          // Utwórz wszystkie tory dla serii
          const lanes: HeatLane[] = [];
          const maxLanes = heat.maxLanes || 8;

          for (let laneNum = 1; laneNum <= maxLanes; laneNum++) {
            const assignment = (heat as any).assignments?.find(
              (a: any) => a.lane === laneNum
            );
            let athlete = undefined;

            if (assignment) {
              const registration = registrations.find(
                (reg) => reg.id === assignment.registrationId
              );
              if (registration && registration.athlete) {
                athlete = registration.athlete;
              }
            }

            lanes.push({
              id: `${heat.id}-${laneNum}`,
              heatId: heat.id,
              laneNumber: laneNum,
              athleteId: athlete?.id,
              registrationId: assignment?.registrationId,
              athlete: athlete,
              registration: assignment
                ? registrations.find((r) => r.id === assignment.registrationId)
                : undefined,
            });
          }

          return {
            id: `heat-${heat.heatNumber}`,
            eventId: eventId,
            heatNumber: heat.heatNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lanes,
          };
        }
      );

      setHeats(loadedHeats);
    }
  }, [existingHeats, registrations]);

  // Odświeżaj heats po zmianie registrations (np. po aktualizacji bibNumber)
  useEffect(() => {
    if (heats.length > 0 && registrations && Array.isArray(registrations)) {
      // Aktualizuj dane zawodników w heats na podstawie aktualnych registrations
      setHeats((prevHeats) =>
        prevHeats.map((heat) => ({
          ...heat,
          lanes: heat.lanes.map((lane) => {
            if (lane.athlete) {
              const updatedRegistration = registrations.find(
                (reg) => reg.id === lane.registrationId
              );
              if (updatedRegistration && updatedRegistration.athlete) {
                const updatedAthlete = {
                  ...lane.athlete,
                  bibNumber: updatedRegistration.bibNumber,
                  seedTime: updatedRegistration.seedTime,
                };
                return {
                  ...lane,
                  athlete: updatedAthlete,
                };
              }
            }
            return lane;
          }),
        }))
      );
    }
  }, [registrations, heats.length]);

  // Usunięto automatyczne generowanie - użytkownik musi ręcznie rozstawić

  // Funkcje obsługi przycisków
  const handleSeeding = () => {
    setShowSeedingModal(true);
  };

  const handleAddAthlete = () => {
    setShowAddAthleteModal(true);
  };

  const handleCombinedEventRegistration = () => {
    setShowCombinedEventRegistration(true);
  };

  const handleCombinedEventRegistrationSuccess = () => {
    setShowCombinedEventRegistration(false);
    // Odśwież dane rejestracji
    window.location.reload();
  };

  const handlePzlaIntegration = (athleteId: string) => {
    setSelectedAthleteForPzla(athleteId);
    setShowPzlaDialog(true);
  };

  const handlePzlaDialogClose = () => {
    setShowPzlaDialog(false);
    setSelectedAthleteForPzla(null);
  };

  const handlePzlaBulkUpdate = () => {
    setShowPzlaBulkDialog(true);
  };

  // Funkcja do utworzenia listy zawodników z przydzielonymi seriami i torami
  const getAthletesWithAssignments = () => {
    if (!heats || heats.length === 0) return [];

    const athletesWithAssignments: Array<{
      registration: Registration;
      heatNumber: number;
      laneNumber: number;
    }> = [];

    heats.forEach((heat) => {
      heat.lanes.forEach((lane) => {
        if (lane.athlete && registrations && Array.isArray(registrations)) {
          const registration = registrations.find(
            (reg) => reg.id === lane.registrationId
          );
          if (registration) {
            athletesWithAssignments.push({
              registration,
              heatNumber: heat.heatNumber,
              laneNumber: lane.laneNumber,
            });
          }
        }
      });
    });

    // Sortuj według serii i toru
    return athletesWithAssignments.sort((a, b) => {
      if (a.heatNumber !== b.heatNumber) {
        return a.heatNumber - b.heatNumber;
      }
      return a.laneNumber - b.laneNumber;
    });
  };

  // Funkcja automatycznego obliczania optymalnej liczby serii (zgodnie z przepisami World Athletics TR 16.3-16.4)
  // Najlepsi zawodnicy w ostatniej serii, zawodnicy bez czasu kwalifikacyjnego traktowani jako najsłabsi
  const calculateOptimalHeats = (
    athleteCount: number,
    eventType: string = "TRACK",
    maxLanes: number = 20,
    skipLane1: boolean = true,
    is800m: boolean = false
  ) => {
    // Określ maksymalną liczbę zawodników w serii według przepisów WA
    const getMaxAthletesPerHeat = (eventType: string, is800m: boolean) => {
      const adjustment = skipLane1 ? 1 : 0; // -1 bo pomijamy tor 1

      // Dla 800m - można rozstawiać po 2 osoby na torze (zgodnie z przepisami WA)
      if (is800m) {
        const availableLanes = maxLanes - adjustment;
        return availableLanes * 2; // 2 zawodników na tor
      }

      // Dla biegów sprinterskich (100m, 200m, 400m) - maksymalnie 8 zawodników
      if (eventType === "SPRINT") return Math.min(8, maxLanes - adjustment);
      // Dla biegów średnich i długich (800m+) - maksymalnie 20 zawodników
      if (eventType === "DISTANCE") return Math.min(20, maxLanes - adjustment);
      // Dla pozostałych biegów - standardowo 20
      return Math.min(20, maxLanes - adjustment);
    };

    const maxAthletesPerHeat = getMaxAthletesPerHeat(eventType, is800m);

    // Jeśli wszyscy zawodnicy zmieszczą się w jednej serii
    if (athleteCount <= maxAthletesPerHeat) {
      if (is800m) {
        // Dla 800m oblicz potrzebną liczbę torów (2 zawodników na tor)
        const lanesNeeded = Math.ceil(athleteCount / 2);
        const totalLanes = skipLane1 ? lanesNeeded + 1 : lanesNeeded;
        return { heats: 1, lanesPerHeat: Math.min(totalLanes, maxLanes) };
      } else {
        return {
          heats: 1,
          lanesPerHeat: skipLane1 ? athleteCount + 1 : athleteCount,
        }; // +1 żeby uwzględnić pominięty tor 1
      }
    }

    // Znajdź optymalny podział - MINIMALIZUJ LICZBĘ SERII
    let bestConfig = {
      heats: Math.ceil(athleteCount / maxAthletesPerHeat),
      lanesPerHeat: maxLanes,
    };

    // Sprawdź czy można zmieścić w mniejszej liczbie serii
    for (let heats = 1; heats <= Math.ceil(athleteCount / 2); heats++) {
      const avgAthletesPerHeat = Math.ceil(athleteCount / heats);

      // Sprawdź czy ta konfiguracja jest możliwa
      if (avgAthletesPerHeat <= maxAthletesPerHeat) {
        let lanesNeeded;
        if (is800m) {
          // Dla 800m oblicz potrzebną liczbę torów (2 zawodników na tor)
          lanesNeeded = Math.ceil(avgAthletesPerHeat / 2);
          if (skipLane1) lanesNeeded += 1;
        } else {
          lanesNeeded = skipLane1 ? avgAthletesPerHeat + 1 : avgAthletesPerHeat; // +1 dla pominiętego toru 1
        }

        if (lanesNeeded <= maxLanes) {
          bestConfig = { heats, lanesPerHeat: lanesNeeded };
          break; // Znaleźliśmy minimalną liczbę serii
        }
      }
    }

    return bestConfig;
  };

  // Funkcja szybkiego rozstawiania
  const handleQuickSeeding = async () => {
    if (
      !registrations ||
      !Array.isArray(registrations) ||
      !registrations.length
    ) {
      alert("Brak zawodników do rozstawienia");
      return;
    }

    // Określ typ konkurencji na podstawie nazwy
    const getEventType = (eventName: string) => {
      const name = eventName.toLowerCase();
      if (
        name.includes("100m") ||
        name.includes("200m") ||
        name.includes("400m") ||
        name.includes("110m") ||
        name.includes("100m płotki") ||
        name.includes("400m płotki")
      ) {
        return "SPRINT";
      }
      if (
        name.includes("800m") ||
        name.includes("1500m") ||
        name.includes("3000m") ||
        name.includes("5000m") ||
        name.includes("10000m") ||
        name.includes("maraton")
      ) {
        return "DISTANCE";
      }
      return "TRACK";
    };

    const eventType = getEventType(event?.name || "");
    const optimal = calculateOptimalHeats(
      registrations.length,
      eventType,
      20,
      true,
      is800m
    ); // Domyślnie 20 torów, z pominięciem toru 1

    const config = {
      numberOfHeats: optimal.heats,
      lanesPerHeat: optimal.lanesPerHeat,
      sortBy: "seedTime" as const,
      seedingMethod: "zigzag" as const,
      laneAssignment: "standard" as const,
      preferredLanes: "default" as const,
      skipLane1: true,
      autoCalculate: true,
      maxLanes: 10,
    };

    await handleSeedingConfig(config);
  };

  // Funkcja przypisywania według czasów kwalifikacyjnych
  function assignAthletesBySeedTime(
    heats: Heat[],
    athletes: Registration[],
    skipLane1: boolean = false,
    is800m: boolean = false
  ) {
    // Algorytm przypisywania według czasów kwalifikacyjnych
    // Najlepsi zawodnicy w ostatniej serii, w środkowych torach

    const effectiveLanesPerHeat = skipLane1 ? lanesPerHeat - 1 : lanesPerHeat;
    const athletesPerHeat = is800m
      ? effectiveLanesPerHeat * 2
      : effectiveLanesPerHeat; // Dla 800m po 2 na tor
    const totalCapacity = heats.length * athletesPerHeat;
    const athletesToAssign = athletes.slice(0, totalCapacity);

    // Podziel zawodników na grupy dla każdej serii
    const athleteGroups: Registration[][] = [];
    for (let i = 0; i < heats.length; i++) {
      athleteGroups.push([]);
    }

    // Przypisz zawodników do grup (najlepsi w ostatniej serii)
    let athleteIndex = 0;
    for (
      let heatIndex = heats.length - 1;
      heatIndex >= 0 && athleteIndex < athletesToAssign.length;
      heatIndex--
    ) {
      const group = athleteGroups[heatIndex];
      for (
        let j = 0;
        j < athletesPerHeat && athleteIndex < athletesToAssign.length;
        j++
      ) {
        const athlete = athletesToAssign[athleteIndex];
        if (athlete && athlete.athlete) {
          group.push(athlete);
        }
        athleteIndex++;
      }
    }

    // Przypisz zawodników do torów w każdej serii
    heats.forEach((heat, heatIndex) => {
      const group = athleteGroups[heatIndex];
      if (!group || group.length === 0) return;

      // Sortuj grupę według czasów (najlepsi pierwsi)
      const sortedGroup = group.sort((a, b) => {
        const timeA = a.seedTime ? parseFloat(a.seedTime) : Infinity;
        const timeB = b.seedTime ? parseFloat(b.seedTime) : Infinity;
        return timeA - timeB;
      });

      if (is800m) {
        // Dla 800m - specjalne rozstawianie
        const lanes = heat.lanes;
        let athleteIdx = 0;

        // Najpierw przypisz po jednym zawodniku na tor
        for (
          let laneNum = skipLane1 ? 2 : 1;
          laneNum <= lanesPerHeat && athleteIdx < sortedGroup.length;
          laneNum++
        ) {
          const lane = lanes.find((l) => l.laneNumber === laneNum);
          if (lane && sortedGroup[athleteIdx]) {
            const athlete = sortedGroup[athleteIdx];
            if (athlete && athlete.athlete) {
              lane.athlete = athlete.athlete;
              lane.registrationId = athlete.id;
              lane.registration = athlete as Partial<Registration>;
            }
            athleteIdx++;
          }
        }

        // Następnie przypisz drugich zawodników na tory
        for (
          let laneNum = skipLane1 ? 2 : 1;
          laneNum <= lanesPerHeat && athleteIdx < sortedGroup.length;
          laneNum++
        ) {
          const lane = lanes.find((l) => l.laneNumber === laneNum);
          if (lane && sortedGroup[athleteIdx]) {
            const athlete = sortedGroup[athleteIdx];
            if (athlete && athlete.athlete) {
              // TODO: Implementacja drugiego zawodnika dla 800m
            }
            athleteIdx++;
          }
        }
      } else {
        // Standardowe rozstawianie dla innych biegów
        // Najlepszy zawodnik w środkowym torze, pozostali na przemian na zewnątrz
        const centerLane = Math.ceil(lanesPerHeat / 2);
        const laneOrder: number[] = [centerLane];

        // Buduj kolejność torów na przemian w lewo i prawo od środka
        for (let offset = 1; offset < lanesPerHeat; offset++) {
          if (centerLane + offset <= lanesPerHeat) {
            laneOrder.push(centerLane + offset);
          }
          if (centerLane - offset >= (skipLane1 ? 2 : 1)) {
            laneOrder.push(centerLane - offset);
          }
        }

        // Przypisz zawodników do torów
        sortedGroup.forEach((athlete, index) => {
          if (index < laneOrder.length && athlete && athlete.athlete) {
            const laneNum = laneOrder[index];
            const lane = heat.lanes.find((l) => l.laneNumber === laneNum);
            if (lane) {
              lane.athlete = athlete.athlete;
              lane.registrationId = athlete.id;
              lane.registration = athlete as Partial<Registration>;
            }
          }
        });
      }
    });
  }

  // Funkcja obsługi rozstawiania
  const handleSeedingConfig = async (config: {
    numberOfHeats: number;
    lanesPerHeat: number;
    sortBy: "seedTime" | "name" | "bibNumber" | "club";
    seedingMethod: "zigzag" | "circle" | "random" | "manual" | "byTime";
    laneAssignment: "standard" | "random" | "manual" | "pairs" | "waterfall";
    preferredLanes: "default" | "inner" | "outer";
    skipLane1: boolean;
    autoCalculate: boolean;
    maxLanes?: number;
    customLanesPerHeat?: number[];
  }) => {
    try {
      if (
        !registrations ||
        !Array.isArray(registrations) ||
        !registrations.length
      ) {
        alert("Brak zawodników do rozstawienia");
        return;
      }

      const newHeats: Heat[] = [];

      // Sortuj zawodników według wybranej metody
      const sortedAthletes = [...registrations]
        .filter((registration) => registration.athlete)
        .sort((a, b) => {
          switch (config.sortBy) {
            case "seedTime":
              if (isFieldEvent) {
                const resultA = parseFieldResult(a.seedTime) || 0; // Brak wyniku = 0 (najsłabszy)
                const resultB = parseFieldResult(b.seedTime) || 0;
                return resultB - resultA; // Najlepsi na końcu dla konkurencji technicznych
              } else {
                // Zawodnicy bez czasu kwalifikacyjnego traktowani jako najsłabsi (999999)
                const timeA = parseTime(a.seedTime) || 999999; // Brak czasu = najsłabszy
                const timeB = parseTime(b.seedTime) || 999999;
                return timeA - timeB; // Najszybsi na końcu dla biegów
              }
            case "name":
              const nameA = `${a.athlete?.lastName} ${a.athlete?.firstName}`;
              const nameB = `${b.athlete?.lastName} ${b.athlete?.firstName}`;
              return nameA.localeCompare(nameB);
            case "bibNumber":
              const bibA = parseInt(a.bibNumber || "999");
              const bibB = parseInt(b.bibNumber || "999");
              return bibA - bibB;
            case "club":
              return (a.athlete?.club || "").localeCompare(
                b.athlete?.club || ""
              );
            default:
              return 0;
          }
        });

      if (isFieldEvent) {
        // Dla konkurencji technicznych - jedna seria
        const heat: Heat = {
          id: "heat-1",
          eventId: eventId,
          heatNumber: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lanes: [],
        };

        sortedAthletes.forEach((registration, index) => {
          if (registration.athlete) {
            heat.lanes.push({
              id: `lane-${index + 1}`,
              heatId: "heat-1",
              laneNumber: index + 1,
              athlete: registration.athlete,
              registrationId: registration.id,
              registration: registration,
            });
          }
        });

        newHeats.push(heat);
      } else {
        // Dla biegów - podział na serie
        const numberOfHeats = config.numberOfHeats;
        const lanesPerHeat = config.lanesPerHeat;

        // Utwórz puste serie
        for (let heatNum = 1; heatNum <= numberOfHeats; heatNum++) {
          const heat: Heat = {
            id: `heat-${heatNum}`,
            eventId: eventId,
            heatNumber: heatNum,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lanes: [],
          };

          // Określ liczbę torów dla tej serii
          const lanesForThisHeat = config.customLanesPerHeat
            ? config.customLanesPerHeat[heatNum - 1] || lanesPerHeat
            : lanesPerHeat;

          // Utwórz puste tory
          for (let laneNum = 1; laneNum <= lanesForThisHeat; laneNum++) {
            heat.lanes.push({
              id: `heat-${heatNum}-lane-${laneNum}`,
              heatId: `heat-${heatNum}`,
              laneNumber: laneNum,
              athlete: undefined,
              registrationId: undefined,
              registration: undefined,
            });
          }

          newHeats.push(heat);
        }

        // Przypisz zawodników według wybranej metody
        if (config.seedingMethod === "zigzag") {
          assignAthletesZigzag(
            newHeats,
            sortedAthletes,
            lanesPerHeat,
            config.skipLane1,
            is800m
          );
        } else if (config.seedingMethod === "byTime") {
          assignAthletesBySeedTime(
            newHeats,
            sortedAthletes,
            config.skipLane1,
            is800m
          );
        } else if (config.seedingMethod === "random") {
          assignAthletesRandomly(
            newHeats,
            sortedAthletes,
            config.skipLane1,
            is800m
          );
        } else {
          // Standardowe przypisanie
          assignAthletesStandard(
            newHeats,
            sortedAthletes,
            lanesPerHeat,
            config.skipLane1,
            is800m
          );
        }
      }

      setHeats(newHeats);
    } catch (error) {
      alert("Wystąpił błąd podczas rozstawiania");
    }
  };

  // Funkcja obsługi dodawania zawodnika
  const handleAddAthleteData = async (athleteData: {
    firstName: string;
    lastName: string;
    club?: string;
    seedTime?: string;
  }) => {
    try {
      // Tutaj będzie logika dodawania zawodnika
      // TODO: Implementacja API call do dodawania zawodnika
      alert("Funkcja dodawania zawodnika zostanie wkrótce zaimplementowana");
    } catch (error) {
      throw error;
    }
  };

  // Funkcja do generowania serii (obecnie nieużywana)
  /*
  const handleGenerateHeats = () => {
    if (!registrations || !Array.isArray(registrations) || !registrations.length) return;
    const newHeats: Heat[] = [];
    
    // Filtruj tylko rejestracje z zawodnikami i sortuj
    const sortedAthletes = [...registrations]
      .filter(registration => registration.athlete)
      .sort((a, b) => {
        if (isFieldEvent) {
          // Dla konkurencji technicznych sortuj według wyniku kwalifikacyjnego (najlepsi na końcu)
          // Zawodnicy bez wyniku (0) traktowani jako najsłabsi
          const resultA = parseFieldResult(a.seedTime) || 0; // Brak wyniku = najsłabszy
          const resultB = parseFieldResult(b.seedTime) || 0;
          return resultB - resultA; // Najlepsi na końcu
        } else {
          // Dla biegów sortuj według czasu (najszybsi na końcu)
          // Zawodnicy bez czasu kwalifikacyjnego (999999) traktowani jako najsłabsi
          const timeA = parseTime(a.seedTime) || 999999; // Brak czasu = najsłabszy
          const timeB = parseTime(b.seedTime) || 999999;
          return timeA - timeB; // Najszybsi na końcu
        }
      });

    if (isFieldEvent) {
      // Dla konkurencji technicznych - jedna seria z wszystkimi zawodnikami
      const heat: Heat = {
        id: 'heat-1',
        number: 1,
        lanes: []
      };

      // Dodaj wszystkich zawodników jako pozycje startowe
      sortedAthletes.forEach((registration, index) => {
        if (registration.athlete) {
          heat.lanes.push({
            number: index + 1,
            athlete: {
              id: registration.athlete.id,
              registrationId: registration.id,
              firstName: registration.athlete.firstName,
              lastName: registration.athlete.lastName,
              club: registration.athlete.club,
              bibNumber: registration.bibNumber,
              seedTime: registration.seedTime
            }
          });
        }
      });

      newHeats.push(heat);
    } else {
      // Dla biegów - standardowe serie
      for (let heatNum = 1; heatNum <= numberOfHeats; heatNum++) {
        const heat: Heat = {
          id: `heat-${heatNum}`,
          number: heatNum,
          lanes: []
        };

        // Utwórz tory
        for (let laneNum = 1; laneNum <= lanesPerHeat; laneNum++) {
          heat.lanes.push({
            number: laneNum,
            athlete: undefined
          });
        }

        newHeats.push(heat);
      }

      // Przypisz zawodników do serii i torów
      if (assignmentMethod === 'seedTime') {
        assignAthletesBySeedTime(newHeats, sortedAthletes);
      } else if (assignmentMethod === 'random') {
        assignAthletesRandomly(newHeats, sortedAthletes);
      }
    }

    setHeats(newHeats);
  };

  function assignAthletesBySeedTime(heats: Heat[], athletes: Registration[], skipLane1: boolean = false, is800m: boolean = false) {
    // Algorytm przypisywania według czasów kwalifikacyjnych
    // Najlepsi zawodnicy w ostatniej serii, w środkowych torach
    
    const effectiveLanesPerHeat = skipLane1 ? lanesPerHeat - 1 : lanesPerHeat;
    const athletesPerHeat = is800m ? effectiveLanesPerHeat * 2 : effectiveLanesPerHeat; // Dla 800m po 2 na tor
    const totalCapacity = heats.length * athletesPerHeat;
    const athletesToAssign = athletes.slice(0, totalCapacity);
    
    // Przypisz zawodników zaczynając od ostatniej serii
    let athleteIndex = 0;
    
    for (let heatIndex = heats.length - 1; heatIndex >= 0 && athleteIndex < athletesToAssign.length; heatIndex--) {
      const heat = heats[heatIndex];
      const centerLanes = getCenterLanes(lanesPerHeat, skipLane1);
      
      for (const laneNum of centerLanes) {
        if (athleteIndex >= athletesToAssign.length) break;
        
        const lane = heat.lanes.find(l => l.laneNumber === laneNum);
        if (lane) {
          const athlete = athletesToAssign[athleteIndex];
          if (athlete.athlete) {
            lane.athlete = athlete.athlete;
            lane.registrationId = athlete.id;
            lane.registration = athlete as Partial<Registration>;
          }
          athleteIndex++;
        }
      }
    }
  };
  */

  const assignAthletesRandomly = (
    heats: Heat[],
    athletes: Registration[],
    skipLane1: boolean = false,
    is800m: boolean = false
  ) => {
    // Losowe rozstawienie, ale zgodnie z przepisami WA - najlepsi w ostatniej serii
    const effectiveLanesPerHeat = skipLane1 ? lanesPerHeat - 1 : lanesPerHeat;
    const athletesPerHeat = is800m
      ? effectiveLanesPerHeat * 2
      : effectiveLanesPerHeat;
    const totalCapacity = heats.length * athletesPerHeat;
    const athletesToAssign = athletes.slice(0, totalCapacity);

    // Podziel zawodników na grupy dla każdej serii i wymieszaj w obrębie grup
    const athleteGroups: Array<Registration[]> = [];
    for (let i = 0; i < heats.length; i++) {
      const startIndex = i * athletesPerHeat;
      const endIndex = Math.min(
        startIndex + athletesPerHeat,
        athletesToAssign.length
      );
      const group = athletesToAssign.slice(startIndex, endIndex);
      // Wymieszaj zawodników w obrębie grupy
      athleteGroups.push(group.sort(() => Math.random() - 0.5));
    }

    // Przypisuj od ostatniej serii do pierwszej (najlepsi w ostatniej)
    for (let heatIndex = heats.length - 1; heatIndex >= 0; heatIndex--) {
      const heat = heats[heatIndex];
      const groupIndex = heats.length - 1 - heatIndex; // Odwróć indeks grupy
      const group = athleteGroups[groupIndex] || [];
      let groupAthleteIndex = 0;

      for (const lane of heat.lanes) {
        if (skipLane1 && lane.laneNumber === 1) continue;
        if (groupAthleteIndex >= group.length) break;

        // Pierwszy zawodnik na torze
        const athlete1 = group[groupAthleteIndex];
        if (athlete1?.athlete) {
          lane.athlete = athlete1.athlete;
          lane.registrationId = athlete1.id;
          lane.registration = athlete1 as Partial<Registration>;
        }
        groupAthleteIndex++;

        // TODO: Dla 800m - drugi zawodnik na tym samym torze (wymaga rozszerzenia HeatLane)
      }
    }
  };

  // Rozstawianie metodą zygzak (World Athletics)
  const assignAthletesZigzag = (
    heats: Heat[],
    athletes: Registration[],
    lanesPerHeat: number,
    skipLane1: boolean = false,
    is800m: boolean = false
  ) => {
    // Najlepsi zawodnicy w ostatniej serii, rozstawieni zygzakiem od środka
    const effectiveLanesPerHeat = skipLane1 ? lanesPerHeat - 1 : lanesPerHeat;
    const athletesPerHeat = is800m
      ? effectiveLanesPerHeat * 2
      : effectiveLanesPerHeat; // Dla 800m po 2 na tor
    const totalCapacity = heats.length * athletesPerHeat;
    const athletesToAssign = athletes.slice(0, totalCapacity);

    // Przypisz zawodników zaczynając od ostatniej serii
    let athleteIndex = 0;

    for (
      let heatIndex = heats.length - 1;
      heatIndex >= 0 && athleteIndex < athletesToAssign.length;
      heatIndex--
    ) {
      const heat = heats[heatIndex];
      const centerLanes = getCenterLanes(lanesPerHeat, skipLane1);

      for (const laneNum of centerLanes) {
        if (athleteIndex >= athletesToAssign.length) break;

        const lane = heat.lanes.find((l) => l.laneNumber === laneNum);
        if (lane) {
          const athlete = athletesToAssign[athleteIndex];
          if (athlete.athlete) {
            lane.athlete = athlete.athlete;
            lane.registrationId = athlete.id;
            lane.registration = athlete as Partial<Registration>;
          }
          athleteIndex++;
        }
      }
    }
  };

  // Standardowe rozstawianie (zgodnie z przepisami World Athletics - najlepsi w ostatniej serii)
  const assignAthletesStandard = (
    heats: Heat[],
    athletes: Registration[],
    lanesPerHeat: number,
    skipLane1: boolean = false,
    is800m: boolean = false
  ) => {
    const effectiveLanesPerHeat = skipLane1 ? lanesPerHeat - 1 : lanesPerHeat;
    const athletesPerHeat = is800m
      ? effectiveLanesPerHeat * 2
      : effectiveLanesPerHeat;
    const totalCapacity = heats.length * athletesPerHeat;
    const athletesToAssign = athletes.slice(0, totalCapacity);

    let athleteIndex = 0;

    // Przypisuj zawodników od ostatniej serii do pierwszej (najlepsi w ostatniej)
    for (
      let heatIndex = heats.length - 1;
      heatIndex >= 0 && athleteIndex < athletesToAssign.length;
      heatIndex--
    ) {
      const heat = heats[heatIndex];

      for (const lane of heat.lanes) {
        if (skipLane1 && lane.laneNumber === 1) continue;
        if (athleteIndex >= athletesToAssign.length) break;

        // Pierwszy zawodnik na torze
        const athlete1 = athletesToAssign[athleteIndex];
        if (athlete1?.athlete) {
          lane.athlete = athlete1.athlete;
          lane.registrationId = athlete1.id;
          lane.registration = athlete1 as Partial<Registration>;
        }
        athleteIndex++;

        // TODO: Dla 800m - drugi zawodnik na tym samym torze (wymaga rozszerzenia HeatLane)
      }
    }
  };

  const getCenterLanes = (
    totalLanes: number,
    skipLane1: boolean = false
  ): number[] => {
    // Zwraca numery torów od środka na zewnątrz
    const startLane = skipLane1 ? 2 : 1;
    const endLane = totalLanes;
    const availableLanes = endLane - startLane + 1;
    const center = Math.ceil(availableLanes / 2) + startLane - 1;
    const lanes: number[] = [];

    for (let i = 0; i < availableLanes; i++) {
      if (i % 2 === 0) {
        lanes.push(center + Math.floor(i / 2));
      } else {
        lanes.push(center - Math.ceil(i / 2));
      }
    }

    return lanes.filter((lane) => lane >= startLane && lane <= endLane);
  };

  const parseTime = (timeStr?: string): number | null => {
    if (!timeStr) return null;

    // Parsuj czas w formacie MM:SS.ss lub SS.ss
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    } else {
      return parseFloat(timeStr);
    }
  };

  const parseFieldResult = (resultStr?: string): number | null => {
    if (!resultStr) return null;

    // Parsuj wynik w konkurencjach technicznych (metry, centymetry)
    // Obsługuje formaty: "12.34", "12,34", "1234" (cm)
    const cleanStr = resultStr.replace(",", ".");
    const result = parseFloat(cleanStr);

    // Jeśli wynik jest większy niż 100, prawdopodobnie jest w centymetrach
    if (result > 100) {
      return result / 100; // Konwertuj cm na metry
    }

    return result;
  };

  // Nieużywana funkcja formatTime
  // const formatTime = (seconds: number): string => {
  //   if (seconds >= 60) {
  //     const mins = Math.floor(seconds / 60);
  //     const secs = (seconds % 60).toFixed(2);
  //     return `${mins}:${secs.padStart(5, '0')}`;
  //   }
  //   return seconds.toFixed(2);
  // };

  const handleManualAssignment = (
    heatId: string,
    laneNumber: number,
    athleteId: string
  ) => {
    const key = `${heatId}-${laneNumber}`;
    setManualAssignments((prev) => ({
      ...prev,
      [key]: athleteId,
    }));

    // Aktualizuj serie
    setHeats((prevHeats) => {
      return prevHeats.map((heat) => {
        if (heat.id === heatId) {
          return {
            ...heat,
            lanes: heat.lanes.map((lane) => {
              if (lane.laneNumber === laneNumber) {
                const athlete =
                  registrations && Array.isArray(registrations)
                    ? registrations.find((r) => r.athlete?.id === athleteId)
                        ?.athlete
                    : undefined;
                const registration =
                  registrations && Array.isArray(registrations)
                    ? registrations.find((r) => r.athlete?.id === athleteId)
                    : undefined;
                return {
                  ...lane,
                  athlete: athlete,
                  registrationId: registration?.id,
                  registration: registration,
                };
              }
              return lane;
            }),
          };
        }
        return heat;
      });
    });
  };

  const removeAthleteFromLane = (heatId: string, laneNumber: number) => {
    const key = `${heatId}-${laneNumber}`;
    setManualAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[key];
      return newAssignments;
    });

    setHeats((prevHeats) => {
      return prevHeats.map((heat) => {
        if (heat.id === heatId) {
          return {
            ...heat,
            lanes: heat.lanes.map((lane) => {
              if (lane.laneNumber === laneNumber) {
                return {
                  ...lane,
                  athlete: undefined,
                };
              }
              return lane;
            }),
          };
        }
        return heat;
      });
    });
  };

  const handleSaveStartlist = async () => {
    if (!heats || heats.length === 0) {
      alert("Brak serii do zapisania. Najpierw rozstaw zawodników.");
      return;
    }

    // Sprawdź czy są jakieś zawodnicy rozstawieni
    const hasAthletes = heats.some((heat) =>
      heat.lanes.some((lane) => lane.athlete)
    );

    if (!hasAthletes) {
      alert(
        "Brak rozstawionych zawodników. Najpierw rozstaw zawodników w seriach."
      );
      return;
    }

    if (
      confirm(
        "Czy na pewno chcesz zapisać listę startową? Istniejące rozstawienie zostanie nadpisane."
      )
    ) {
      try {
        await saveStartlistMutation.mutateAsync({ eventId, heats });
        alert("Lista startowa została zapisana pomyślnie!");
      } catch (error) {
        alert("Wystąpił błąd podczas zapisywania listy startowej");
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (
      confirm(
        "Czy na pewno chcesz usunąć tę konkurencję? Ta operacja jest nieodwracalna."
      )
    ) {
      try {
        await deleteEventMutation.mutateAsync(eventId);
        router.push(`/competitions/${competitionId}/startlists?tab=manage`);
      } catch (error) {
        alert("Wystąpił błąd podczas usuwania konkurencji");
      }
    }
  };

  const handleEditBibNumber = (
    registrationId: string,
    currentBibNumber: string
  ) => {
    setEditingBibNumber(registrationId);
    setTempBibNumber(currentBibNumber || "");
  };

  const handleSaveBibNumber = async (registrationId: string) => {
    try {
      const result = await updateRegistrationMutation.mutateAsync({
        id: registrationId,
        data: { bibNumber: tempBibNumber },
      });
      setEditingBibNumber(null);
      setTempBibNumber("");
    } catch (error) {
      alert("Wystąpił błąd podczas aktualizacji numeru startowego");
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
      confirm(
        `Czy na pewno chcesz usunąć zawodnika ${athleteName} z tej konkurencji? Ta operacja jest nieodwracalna.`
      )
    ) {
      try {
        await deleteRegistrationMutation.mutateAsync(registrationId);

        // Usuń zawodnika z wygenerowanych serii
        setHeats((prevHeats) => {
          return prevHeats.map((heat) => ({
            ...heat,
            lanes: heat.lanes.map((lane) => {
              if (lane.registrationId === registrationId) {
                return {
                  ...lane,
                  athlete: undefined,
                };
              }
              return lane;
            }),
          }));
        });

        alert("Zawodnik został usunięty z konkurencji");
      } catch (error) {
        alert("Wystąpił błąd podczas usuwania zawodnika");
      }
    }
  };

  // Funkcja zmiany toru zawodnika
  const handleLaneChange = (
    heatId: string,
    oldLaneNumber: number,
    newLaneNumber: number
  ) => {
    setHeats((prevHeats) => {
      return prevHeats.map((heat) => {
        if (heat.id === heatId) {
          const oldLane = heat.lanes.find(
            (l) => l.laneNumber === oldLaneNumber
          );
          const newLane = heat.lanes.find(
            (l) => l.laneNumber === newLaneNumber
          );

          if (oldLane && newLane) {
            // Zamień zawodników między torami
            const tempAthlete = oldLane.athlete;
            const tempRegistrationId = oldLane.registrationId;
            const tempRegistration = oldLane.registration;

            oldLane.athlete = newLane.athlete;
            oldLane.registrationId = newLane.registrationId;
            oldLane.registration = newLane.registration;

            newLane.athlete = tempAthlete;
            newLane.registrationId = tempRegistrationId;
            newLane.registration = tempRegistration;
          }
        }
        return heat;
      });
    });
  };

  // Funkcja dodawania zawodnika do serii
  const handleAddAthleteToHeat = (heatId: string, athleteId: string) => {
    const registration =
      registrations && Array.isArray(registrations)
        ? registrations.find((r) => r.athlete?.id === athleteId)
        : undefined;
    if (!registration?.athlete) return;

    setHeats((prevHeats) => {
      return prevHeats.map((heat) => {
        if (heat.id === heatId) {
          // Znajdź pierwszy wolny tor (pomijając tor 1 jeśli to ustawione)
          const availableLane = heat.lanes.find(
            (lane) =>
              !lane.athlete &&
              (lane.laneNumber > 1 || !heat.lanes.some((l) => l.athlete))
          );

          if (availableLane && registration.athlete) {
            availableLane.athlete = registration.athlete;
            availableLane.registrationId = registration.id;
            availableLane.registration = registration as Partial<Registration>;
          }
        }
        return heat;
      });
    });
  };

  const handleAutoAssignBibNumbers = async () => {
    if (
      !registrations ||
      !Array.isArray(registrations) ||
      !registrations.length
    )
      return;

    if (
      !confirm(
        "Czy na pewno chcesz automatycznie przypisać numery startowe wszystkim zawodnikom? Istniejące numery zostaną nadpisane."
      )
    ) {
      return;
    }

    try {
      // Przypisz numery startowe w kolejności alfabetycznej
      const sortedRegistrations = [...registrations].sort((a, b) => {
        const nameA =
          `${a.athlete?.lastName} ${a.athlete?.firstName}`.toLowerCase();
        const nameB =
          `${b.athlete?.lastName} ${b.athlete?.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      for (let i = 0; i < sortedRegistrations.length; i++) {
        const registration = sortedRegistrations[i];
        const bibNumber = (i + 1).toString();

        await updateRegistrationMutation.mutateAsync({
          id: registration.id,
          data: { bibNumber },
        });
      }

      alert("Numery startowe zostały automatycznie przypisane!");
    } catch (error) {
      alert(
        "Wystąpił błąd podczas automatycznego przypisywania numerów startowych"
      );
    }
  };

  if (eventLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie listy startowej...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Nie znaleziono konkurencji</p>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>
                  {(() => {
                    // Sprawdź czy w nazwie wydarzenia jest już kategoria wiekowa
                    const eventName = event.name.toLowerCase();

                    // Wyciągnij kategorię wiekową z nazwy
                    const ageMatch = eventName.match(
                      /\b(u\d+|[km]\s*u\d+|m\d+|k\d+|młodzik|junior|senior|master|weteran)\b/
                    );

                    if (ageMatch && event.category === "WIELE") {
                      // Jeśli znaleziono kategorię w nazwie i event.category to "WIELE", użyj kategorii z nazwy
                      const ageCategory = ageMatch[1].toUpperCase();
                      return `${ageCategory} - ${event.gender}`;
                    }

                    return `${event.category} - ${event.gender}`;
                  })()}
                </span>
                {(() => {
                  const scheduledTime = getScheduledTimeFromEvent(event);
                  return scheduledTime ? (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <Clock className="h-4 w-4" />
                      {formatScheduledTime(scheduledTime)}
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {event &&
            competition &&
            registrations &&
            Array.isArray(registrations) &&
            registrations.length > 0 ? (
              <StartlistPDFGenerator
                event={event}
                competition={competition}
                registrations={
                  registrations?.map((reg) => {
                    const regWithRecords = registrationsWithRecords?.find(
                      (r) => r.id === reg.id
                    );
                    return {
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
                      personalBest:
                        regWithRecords?.records?.personalBest?.result,
                      seasonBest: regWithRecords?.records?.seasonBest?.result,
                    };
                  }) || []
                }
                heats={heats}
                isFieldEvent={isFieldEvent}
              />
            ) : null}
            <Button
              variant="outline"
              onClick={handleSaveStartlist}
              disabled={saveStartlistMutation.isPending}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStartlistMutation.isPending
                ? "Zapisywanie..."
                : "Zapisz listę startową"}
            </Button>
            <Button variant="outline" onClick={handleDeleteEvent}>
              <Trash2 className="h-4 w-4 mr-2" />
              Usuń konkurencję
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {registrations &&
          Array.isArray(registrations) &&
          registrations.length > 0 ? (
            <>
              {/* Lista zawodników na górze */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        {(() => {
                          const athletesWithAssignments =
                            getAthletesWithAssignments();
                          const hasAssignments =
                            athletesWithAssignments.length > 0;
                          return hasAssignments
                            ? `Lista startowa - rozstawieni zawodnicy (${registrations.length})`
                            : `Lista zawodników (${registrations.length})`;
                        })()}
                      </span>
                      {!isFieldEvent && (
                        <span className="text-sm font-normal text-blue-600 mt-1">
                          Sugerowane rozstawienie (WA):{" "}
                          {(() => {
                            const eventType = (() => {
                              const name = event?.name?.toLowerCase() || "";
                              if (
                                name.includes("100m") ||
                                name.includes("200m") ||
                                name.includes("400m") ||
                                name.includes("110m") ||
                                name.includes("płotki")
                              )
                                return "SPRINT";
                              if (
                                name.includes("800m") ||
                                name.includes("1500m") ||
                                name.includes("3000m") ||
                                name.includes("5000m") ||
                                name.includes("10000m")
                              )
                                return "DISTANCE";
                              return "TRACK";
                            })();
                            const optimal = calculateOptimalHeats(
                              registrations.length,
                              eventType,
                              20,
                              true
                            );
                            const maxPerHeat =
                              eventType === "SPRINT"
                                ? 8
                                : eventType === "DISTANCE"
                                  ? 20
                                  : 20;

                            // Oblicz rzeczywisty rozkład zawodników
                            const baseAthletesPerHeat = Math.floor(
                              registrations.length / optimal.heats
                            );
                            const extraAthletes =
                              registrations.length % optimal.heats;

                            const skipLane1 = true; // Domyślnie pomijamy tor 1
                            const startLane = skipLane1 ? 2 : 1;

                            if (optimal.heats === 1) {
                              return `1 seria po ${registrations.length} zawodników (tory ${startLane}-${optimal.lanesPerHeat})`;
                            } else {
                              // Niektóre serie będą miały +1 zawodnika
                              const fullHeats = extraAthletes; // serie z +1 zawodnikiem
                              const normalHeats = optimal.heats - extraAthletes; // serie ze standardową liczbą

                              let description = `${optimal.heats} serie: `;
                              if (normalHeats > 0) {
                                description += `${normalHeats}×${baseAthletesPerHeat}`;
                              }
                              if (fullHeats > 0) {
                                if (normalHeats > 0) description += " + ";
                                description += `${fullHeats}×${
                                  baseAthletesPerHeat + 1
                                }`;
                              }
                              description += ` zawodników (tory ${startLane}-${optimal.lanesPerHeat}, maks. ${maxPerHeat}/seria)`;

                              return description;
                            }
                          })()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleQuickSeeding}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Rozstaw automatycznie
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSeeding}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Ustawienia rozstawiania
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={
                          isCombinedEvent
                            ? handleCombinedEventRegistration
                            : handleAddAthlete
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isCombinedEvent ? "Dodaj do wieloboju" : "Dodaj"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAutoAssignBibNumbers}
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        Auto-numeracja
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePzlaBulkUpdate}
                        title="Zaktualizuj rekordy wszystkich zawodników z PZLA"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Masowa aktualizacja PZLA
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const athletesWithAssignments =
                        getAthletesWithAssignments();
                      const hasAssignments = athletesWithAssignments.length > 0;

                      if (!hasAssignments) {
                        // Pokaż standardową listę bez przydziałów
                        return registrations.map((registration) => (
                          <div
                            key={registration.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {registration.bibNumber || "?"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {registration.athlete?.displayName ||
                                    `${registration.athlete?.firstName} ${registration.athlete?.lastName}`}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {registration.athlete?.club && (
                                    <span>
                                      Klub: {registration.athlete.club}
                                    </span>
                                  )}
                                  {/* Sprawdź czy mamy dane z rekordami */}
                                  {(() => {
                                    const regWithRecords =
                                      registrationsWithRecords?.find(
                                        (r) => r.id === registration.id
                                      );
                                    if (regWithRecords?.records) {
                                      return (
                                        <div className="flex items-center gap-3">
                                          {regWithRecords.records
                                            .personalBest ? (
                                            <span>
                                              PB:{" "}
                                              {
                                                regWithRecords.records
                                                  .personalBest.result
                                              }
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">
                                              PB: -
                                            </span>
                                          )}
                                          {regWithRecords.records.seasonBest ? (
                                            <span>
                                              SB:{" "}
                                              {
                                                regWithRecords.records
                                                  .seasonBest.result
                                              }
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">
                                              SB: -
                                            </span>
                                          )}
                                        </div>
                                      );
                                    } else {
                                      // Fallback - pokaż przynajmniej puste PB/SB
                                      return (
                                        <div className="flex items-center gap-3">
                                          <span className="text-gray-400">
                                            PB: -
                                          </span>
                                          <span className="text-gray-400">
                                            SB: -
                                          </span>
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {editingBibNumber === registration.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    value={tempBibNumber}
                                    onChange={(e) =>
                                      setTempBibNumber(e.target.value)
                                    }
                                    className="w-20"
                                    placeholder="Nr"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveBibNumber(registration.id)
                                    }
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEditBibNumber}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleEditBibNumber(
                                      registration.id,
                                      registration.bibNumber || ""
                                    )
                                  }
                                >
                                  <Hash className="h-4 w-4 mr-1" />
                                  {registration.bibNumber
                                    ? "Edytuj nr"
                                    : "Dodaj nr"}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePzlaIntegration(
                                    registration.athlete?.id || ""
                                  )
                                }
                                title="Pobierz rekordy z PZLA"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PZLA
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteRegistration(
                                    registration.id,
                                    `${registration.athlete?.firstName} ${registration.athlete?.lastName}`
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ));
                      } else {
                        // Po rozstawieniu - nie pokazuj listy zawodników, tylko informację
                        return (
                          <div className="text-center py-4 text-gray-600">
                            <p>
                              Zawodnicy zostali rozstawieni w seriach poniżej.
                            </p>
                            <p className="text-sm mt-1">
                              Możesz edytować numery startowe i numery seryjne
                              bezpośrednio w seriach.
                            </p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          <div className="space-y-6">
            {heats.length > 0 ? (
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
                                <div className="flex-1">
                                  {lane.athlete ? (
                                    <div className="mb-2">
                                      <p className="font-medium">
                                        {(() => {
                                          const regWithRecords =
                                            registrationsWithRecords?.find(
                                              (r) =>
                                                r.id === lane.registrationId
                                            );
                                          return (
                                            regWithRecords?.athlete
                                              ?.displayName ||
                                            `${lane.athlete.firstName} ${lane.athlete.lastName}`
                                          );
                                        })()}
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
                                        {/* Sprawdź czy mamy dane z rekordami */}
                                        {(() => {
                                          const regWithRecords =
                                            registrationsWithRecords?.find(
                                              (r) =>
                                                r.id === lane.registrationId
                                            );
                                          if (regWithRecords?.records) {
                                            return (
                                              <div className="flex items-center gap-3">
                                                {regWithRecords.records
                                                  .personalBest ? (
                                                  <span>
                                                    PB:{" "}
                                                    {
                                                      regWithRecords.records
                                                        .personalBest.result
                                                    }
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400">
                                                    PB: -
                                                  </span>
                                                )}
                                                {regWithRecords.records
                                                  .seasonBest ? (
                                                  <span>
                                                    SB:{" "}
                                                    {
                                                      regWithRecords.records
                                                        .seasonBest.result
                                                    }
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400">
                                                    SB: -
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          } else {
                                            // Fallback - pokaż przynajmniej puste PB/SB
                                            return (
                                              <div className="flex items-center gap-3">
                                                <span className="text-gray-400">
                                                  PB: -
                                                </span>
                                                <span className="text-gray-400">
                                                  SB: -
                                                </span>
                                              </div>
                                            );
                                          }
                                        })()}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 mb-2">
                                      Brak przypisanego zawodnika
                                    </div>
                                  )}

                                  {/* TODO: Drugi zawodnik dla 800m - wymaga rozszerzenia HeatLane */}
                                </div>
                              </div>
                              {assignmentMethod === "manual" && (
                                <div className="flex gap-2">
                                  <Select
                                    value={
                                      manualAssignments[
                                        `${heat.id}-${lane.laneNumber}`
                                      ] || ""
                                    }
                                    onValueChange={(athleteId) =>
                                      handleManualAssignment(
                                        heat.id,
                                        lane.laneNumber,
                                        athleteId
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue placeholder="Wybierz zawodnika" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {registrations &&
                                      Array.isArray(registrations)
                                        ? registrations
                                            .filter((r) => r.athlete)
                                            .map((registration) => (
                                              <SelectItem
                                                key={registration.athlete!.id}
                                                value={registration.athlete!.id}
                                              >
                                                {registration.athlete!
                                                  .displayName ||
                                                  `${registration.athlete!.firstName} ${registration.athlete!.lastName}`}
                                              </SelectItem>
                                            ))
                                        : null}
                                    </SelectContent>
                                  </Select>
                                  {lane.athlete && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handlePzlaIntegration(
                                            lane.athlete?.id || ""
                                          )
                                        }
                                        title="Pobierz rekordy z PZLA"
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        PZLA
                                      </Button>
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
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Wyświetlanie dla biegów - tory (tylko zajęte tory)
                        <div className="space-y-3">
                          {heat.lanes
                            .filter((lane) => lane.athlete) // Pokazuj tylko zajęte tory
                            .sort((a, b) => a.laneNumber - b.laneNumber) // Sortuj według numeru toru
                            .map((lane) => (
                              <div
                                key={lane.laneNumber}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      T{lane.laneNumber}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {(() => {
                                        const regWithRecords =
                                          registrationsWithRecords?.find(
                                            (r) => r.id === lane.registrationId
                                          );
                                        return (
                                          regWithRecords?.athlete
                                            ?.displayName ||
                                          `${lane.athlete?.firstName} ${lane.athlete?.lastName}`
                                        );
                                      })()}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      {lane.athlete?.club && (
                                        <span>Klub: {lane.athlete.club}</span>
                                      )}
                                      {lane.registration?.bibNumber && (
                                        <span>
                                          Nr startowy:{" "}
                                          {lane.registration.bibNumber}
                                        </span>
                                      )}

                                      {lane.registration?.seedTime && (
                                        <span>
                                          Czas: {lane.registration.seedTime}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Edycja numeru startowego */}
                                  {editingBibNumber === lane.registrationId ? (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="text"
                                        value={tempBibNumber}
                                        onChange={(e) =>
                                          setTempBibNumber(e.target.value)
                                        }
                                        className="w-16 h-8"
                                        placeholder="Nr"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSaveBibNumber(
                                            lane.registrationId || ""
                                          )
                                        }
                                        className="h-8 px-2"
                                      >
                                        <Save className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancelEditBibNumber}
                                        className="h-8 px-2"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleEditBibNumber(
                                          lane.registrationId || "",
                                          lane.registration?.bibNumber || ""
                                        )
                                      }
                                      className="h-8 px-2 text-xs"
                                    >
                                      <Hash className="h-3 w-3 mr-1" />
                                      Nr
                                    </Button>
                                  )}

                                  {/* Dropdown do zmiany toru */}
                                  <Select
                                    value={lane.laneNumber.toString()}
                                    onValueChange={(newLaneStr) =>
                                      handleLaneChange(
                                        heat.id,
                                        lane.laneNumber,
                                        parseInt(newLaneStr)
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-16 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from(
                                        { length: 10 },
                                        (_, i) => i + 1
                                      ).map((laneNum) => (
                                        <SelectItem
                                          key={laneNum}
                                          value={laneNum.toString()}
                                        >
                                          T{laneNum}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handlePzlaIntegration(
                                        lane.athlete?.id || ""
                                      )
                                    }
                                    title="Pobierz rekordy z PZLA"
                                    className="h-8 px-2 text-xs"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    PZLA
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      removeAthleteFromLane(
                                        heat.id,
                                        lane.laneNumber
                                      )
                                    }
                                    className="h-8 px-2"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                          {/* Przycisk dodawania zawodnika do serii */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Select
                              onValueChange={(athleteId) =>
                                handleAddAthleteToHeat(heat.id, athleteId)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Dodaj zawodnika do serii..." />
                              </SelectTrigger>
                              <SelectContent>
                                {registrations && Array.isArray(registrations)
                                  ? registrations
                                      .filter(
                                        (r) =>
                                          r.athlete &&
                                          !heat.lanes.some(
                                            (l) => l.registrationId === r.id
                                          )
                                      )
                                      .map((registration) => (
                                        <SelectItem
                                          key={registration.athlete!.id}
                                          value={registration.athlete!.id}
                                        >
                                          {registration.athlete!.displayName ||
                                            `${registration.athlete!.firstName} ${registration.athlete!.lastName}`}
                                        </SelectItem>
                                      ))
                                  : null}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Brak wygenerowanej listy startowej
                    </p>
                    <p className="text-sm mb-4">
                      {isCombinedEvent
                        ? "Zarejestruj zawodników na wielobój, aby wygenerować listę startową."
                        : "Użyj przycisku powyżej, aby wygenerować listę startową dla tej konkurencji."}
                    </p>
                    {isCombinedEvent && (
                      <Button
                        onClick={handleCombinedEventRegistration}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Zarejestruj na wielobój
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modale */}
      <SeedingModal
        isOpen={showSeedingModal}
        onClose={() => setShowSeedingModal(false)}
        registrations={Array.isArray(registrations) ? registrations : []}
        heats={heats}
        isFieldEvent={isFieldEvent}
        onSeed={handleSeedingConfig}
      />

      <AddAthleteModal
        isOpen={showAddAthleteModal}
        onClose={() => setShowAddAthleteModal(false)}
        onAdd={handleAddAthleteData}
        eventId={eventId}
        competitionId={competitionId}
      />

      <Dialog
        open={showCombinedEventRegistration}
        onOpenChange={setShowCombinedEventRegistration}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rejestracja na wielobój</DialogTitle>
          </DialogHeader>
          <QuickCombinedEventRegistration
            competitionId={competitionId}
            onSuccess={handleCombinedEventRegistrationSuccess}
            onCancel={() => setShowCombinedEventRegistration(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedAthleteForPzla && (
        <PzlaUpdateDialog
          isOpen={showPzlaDialog}
          onClose={handlePzlaDialogClose}
          athleteId={selectedAthleteForPzla}
        />
      )}

      <PzlaBulkUpdateDialog
        isOpen={showPzlaBulkDialog}
        onClose={() => setShowPzlaBulkDialog(false)}
      />
    </DashboardLayout>
  );
}
