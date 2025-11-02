"use client";

import { Button } from "@/components/ui/button";
import { useAllStartListsForCompetition } from "@/hooks/useRegistrations";
import { Competition, Event, Heat, Registration } from "@/types";
import { ArrowLeft, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import styles from "./PrintAllStartlists.module.css";
import { HeatsDocument, StartlistDocument } from "./StartlistPDFGenerator";

// Helper function to convert global types to startlist types
const convertRegistrationToStartlist = (registration: Registration) => ({
  id: registration.id,
  athlete: {
    firstName:
      registration.athlete?.displayName?.split(" ")[0] ||
      registration.athlete?.firstName ||
      "",
    lastName:
      registration.athlete?.displayName?.split(" ").slice(1).join(" ") ||
      registration.athlete?.lastName ||
      "",
    displayName: registration.athlete?.displayName,
    club: registration.athlete?.club,
    yearOfBirth: registration.athlete?.dateOfBirth
      ? new Date(registration.athlete.dateOfBirth).getFullYear()
      : undefined,
  },
  seedTime: registration.seedTime,
  bibNumber: registration.bibNumber,
  personalBest: registration.records?.personalBest?.result,
  seasonBest: registration.records?.seasonBest?.result,
});

const convertHeatsToStartlist = (heats: any[]): Heat[] =>
  heats.map((heat) => ({
    id: heat.id,
    eventId: heat.eventId || "",
    heatNumber: heat.number || heat.heatNumber,
    createdAt: heat.createdAt || new Date().toISOString(),
    updatedAt: heat.updatedAt || new Date().toISOString(),
    lanes: heat.lanes.map((lane: any) => ({
      id: lane.id || `lane-${lane.number || lane.laneNumber}`,
      heatId: heat.id,
      laneNumber: lane.number || lane.laneNumber,
      athleteId: lane.athlete?.id,
      registrationId: lane.athlete?.registrationId,
      athlete: lane.athlete
        ? {
            id: lane.athlete.id || "",
            firstName: lane.athlete.firstName || "",
            lastName: lane.athlete.lastName || "",
            club: lane.athlete.club,
          }
        : undefined,
      registration: lane.athlete
        ? {
            id: lane.athlete.registrationId || "",
            bibNumber: lane.athlete.bibNumber,
            seedTime: lane.athlete.seedTime,
          }
        : undefined,
      seedTime: lane.athlete?.seedTime,
    })),
  }));

// Wrapper component dla pojedynczego eventu
const EventStartlistWrapper: React.FC<{
  event: Event;
  competition: Competition;
  registrations: Registration[];
  heats: Array<{
    id: string;
    number: number;
    heatNumber: number;
    lanes: Array<{
      number: number;
      laneNumber: number;
      athlete?: { firstName: string; lastName: string; club?: string };
    }>;
  }>;
  isFieldEvent: boolean;
  isFirstEvent?: boolean;
  shouldBreakPage?: boolean;
}> = ({
  event,
  competition,
  registrations,
  heats,
  isFieldEvent,
  isFirstEvent = true,
  shouldBreakPage = false,
}) => {
  const convertedRegistrations = (registrations || []).map(
    convertRegistrationToStartlist
  );
  const convertedHeats = convertHeatsToStartlist(heats);

  return (
    <StartlistDocument
      event={event}
      competition={competition}
      registrations={convertedRegistrations}
      heats={convertedHeats}
      isFieldEvent={isFieldEvent}
      isFirstEvent={isFirstEvent}
      shouldBreakPage={shouldBreakPage}
    />
  );
};

interface PrintAllStartlistsProps {
  competition: Competition;
  competitionId: string;
}

export const PrintAllStartlists: React.FC<PrintAllStartlistsProps> = ({
  competition,
  competitionId,
}) => {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Pobierz wszystkie listy startowe jednym żądaniem
  const { data: allStartLists, isLoading } = useAllStartListsForCompetition(
    competitionId,
    "PB"
  );

  // Przygotuj dane dla wszystkich konkurencji
  const eventsWithData = (allStartLists || []).map((startListData, index) => {
    const event = competition.events?.find(
      (e) => e.id === startListData.eventId
    );
    return {
      event: event || {
        id: startListData.eventId,
        name: startListData.eventName,
        type: startListData.eventType as any,
        category: startListData.eventCategory,
      },
      registrations: startListData.registrations,
      heats: [], // Heats będą generowane w komponencie
      isFieldEvent: startListData.eventType === "FIELD",
      index,
    };
  });

  useEffect(() => {
    // Ustaw gotowość gdy dane są załadowane
    if (!isLoading && allStartLists) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, allStartLists]);

  const handlePrint = () => {
    if (!printRef.current) {
      alert("Błąd: Elementy do drukowania nie zostały znalezione");
      return;
    }

    // Utwórz nowe okno do drukowania
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(
        "Nie można otworzyć okna drukowania. Sprawdź blokadę wyskakujących okien."
      );
      return;
    }

    // Skopiuj style z głównej strony
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

    // Przygotuj HTML do drukowania
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Wszystkie listy startowe - ${competition.name}</title>
          <meta charset="UTF-8">
          <style>
            ${styles}
            
            /* Reset and base styles */
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body { 
              margin: 0; 
              padding: 8mm; 
              font-family: Arial, sans-serif;
              font-size: 8px;
              line-height: 1.0;
              color: #000000 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: #000000 !important;
              background: #ffffff !important;
            }
            * {
              color: #000000 !important;
              background-color: transparent !important;
            }
            .text-blue-600 { color: #2563eb !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-400 { color: #9ca3af !important; }
            .font-bold { font-weight: bold !important; }
            .font-medium { font-weight: 500 !important; }
            .border-b { border-bottom: 1px solid #cccccc !important; }
            .border-2 { border: 2px solid #cccccc !important; }
            .border-dashed { border-style: dashed !important; }
            .page-break-before { page-break-before: always; }
            
            /* Table layout for startlist */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 10px !important;
            }
            
            th, td {
              border: 1px solid #000000 !important;
              padding: 4px 2px !important;
              vertical-align: middle !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              font-size: 10px !important;
              line-height: 1.2 !important;
            }
            
            th {
              background-color: #f0f0f0 !important;
              font-weight: bold !important;
              text-align: center !important;
              font-size: 11px !important;
            }
            
            /* Column widths */
            th:nth-child(1), td:nth-child(1) { width: 30px !important; } /* Lp */
            th:nth-child(2), td:nth-child(2) { width: 30px !important; } /* Nr */
            th:nth-child(3), td:nth-child(3) { width: auto !important; } /* Imię i nazwisko */
            th:nth-child(4), td:nth-child(4) { width: 50px !important; } /* Rocznik */
            th:nth-child(5), td:nth-child(5) { width: auto !important; } /* Klub */
            th:nth-child(6), td:nth-child(6) { width: 50px !important; } /* PB */
            th:nth-child(7), td:nth-child(7) { width: 50px !important; } /* SB */
            
            @media print {
              body { margin: 0; padding: 8mm; }
              .page-break-before { page-break-before: always !important; }
              
              /* Ensure each startlist starts on new page */
              .professionalStartlist.page-break-before {
                page-break-before: always !important;
              }
              
              table {
                font-size: 9px !important;
              }
              
              th, td {
                padding: 2px 1px !important;
                font-size: 9px !important;
                line-height: 1.1 !important;
              }
              
              th {
                font-size: 10px !important;
                padding: 3px 2px !important;
              }
              
              /* Smaller column widths for print */
              th:nth-child(1), td:nth-child(1) { width: 25px !important; } /* Lp */
              th:nth-child(2), td:nth-child(2) { width: 25px !important; } /* Nr */
              th:nth-child(4), td:nth-child(4) { width: 40px !important; } /* Rocznik */
              th:nth-child(6), td:nth-child(6) { width: 45px !important; } /* PB */
              th:nth-child(7), td:nth-child(7) { width: 45px !important; } /* SB */
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Poczekaj na załadowanie i drukuj
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handleAutoPrint = () => {
    if (isReady) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Wszystkie listy startowe
            </h1>
            <p className="text-gray-600">{competition.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Drukuj wszystkie
          </Button>
          <Button
            variant="outline"
            onClick={handleAutoPrint}
            disabled={!isReady || isLoading}
          >
            <Printer className="h-4 w-4 mr-2" />
            {isLoading
              ? "Ładowanie danych..."
              : isReady
                ? "Auto-drukuj"
                : "Przygotowywanie..."}
          </Button>
        </div>
      </div>

      {/* Podgląd wszystkich list startowych */}
      <div ref={printRef} className={`space-y-8 ${styles.printContainer}`}>
        {eventsWithData.map((eventData, index) => {
          // Inteligentne łamanie stron:
          // - Pierwsza konkurencja: bez łamania
          // - Kolejne konkurencje: łamanie tylko jeśli poprzednia miała dużo zawodników (>15)
          const shouldBreakPage = index > 0; // Zawsze łam stronę dla kolejnych konkurencji

          return (
            <div
              key={eventData.event.id}
              className={shouldBreakPage ? styles.pageBreakBefore : ""}
            >
              <div className="bg-white p-8 rounded-lg shadow mb-4">
                <EventStartlistWrapper
                  event={eventData.event}
                  competition={competition}
                  registrations={eventData.registrations}
                  heats={eventData.heats}
                  isFieldEvent={eventData.isFieldEvent}
                  isFirstEvent={index === 0}
                  shouldBreakPage={shouldBreakPage}
                />
              </div>

              {/* Serie jeśli istnieją */}
              {eventData.heats && eventData.heats.length > 0 && (
                <div
                  className={`bg-white p-8 rounded-lg shadow ${styles.pageBreakBefore}`}
                >
                  <HeatsDocument
                    event={eventData.event}
                    competition={competition}
                    heats={convertHeatsToStartlist(eventData.heats)}
                    isFieldEvent={eventData.isFieldEvent}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informacja o liczbie stron */}
      <div className="mt-6 text-center text-gray-600">
        <p>
          Przygotowano {eventsWithData.length} list startowych do drukowania
        </p>
      </div>
    </div>
  );
};
