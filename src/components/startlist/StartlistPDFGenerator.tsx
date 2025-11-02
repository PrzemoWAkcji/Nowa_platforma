"use client";

import { Button } from "@/components/ui/button";
import { Competition, Event, Heat as GlobalHeat } from "@/types";
import domtoimage from "dom-to-image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Printer } from "lucide-react";
import React, { useRef, useState } from "react";
import { RosterStyleProtocol } from "./RosterStyleProtocol";
import styles from "./StartlistPDFGenerator.module.css";
import { TrackProtocol } from "./TrackProtocol";

// Local types for PDF generation - simplified versions
interface StartlistRegistration {
  id: string;
  athlete: {
    firstName: string;
    lastName: string;
    club?: string;
    yearOfBirth?: number;
  };
  seedTime?: string;
  bibNumber?: string;
  personalBest?: string;
  seasonBest?: string;
}

// Używamy globalnych typów Heat i HeatLane z @/types

interface StartlistPDFGeneratorProps {
  event: Event;
  competition: Competition;
  heats: GlobalHeat[];
  registrations: StartlistRegistration[];
  isFieldEvent: boolean;
  isFirstEvent?: boolean; // Dodajemy prop do kontrolowania łamania stron
}

export const StartlistPDFGenerator: React.FC<StartlistPDFGeneratorProps> = ({
  event,
  competition,
  heats,
  registrations,
  isFieldEvent,
  isFirstEvent = true,
}) => {
  const startlistRef = useRef<HTMLDivElement>(null);
  const heatsRef = useRef<HTMLDivElement>(null);
  const protocolRef = useRef<HTMLDivElement>(null);
  const [numberOfTrials, setNumberOfTrials] = useState<3 | 4 | 6>(3);
  const [showDebug, setShowDebug] = useState(false);

  // Funkcja drukowania bezpośredniego
  const printElement = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    if (!elementRef.current) {
      alert("Błąd: Element do drukowania nie został znaleziony");
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
          <title>Lista startowa - ${event?.name || "Drukowanie"}</title>
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
              font-family: 'Arial', sans-serif;
              font-size: 10px;
              line-height: 1.1;
              color: #000000 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Professional table styling */
            table, .grid {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 0 !important;
              table-layout: fixed !important;
            }
            

            
            .border-2 {
              border: 2px solid #000000 !important;
            }
            
            .border-black {
              border-color: #000000 !important;
            }
            
            .border-b {
              border-bottom: 1px solid #000000 !important;
            }
            
            .border-gray-300 {
              border-color: #cccccc !important;
            }
            
            .bg-gray-100 {
              background-color: #f5f5f5 !important;
            }
            
            .bg-gray-50 {
              background-color: #fafafa !important;
            }
            
            .bg-white {
              background-color: #ffffff !important;
            }
            
            /* Typography */
            .font-bold { font-weight: bold !important; }
            .font-medium { font-weight: 500 !important; }
            .font-semibold { font-weight: 600 !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-xs { font-size: 8px !important; }
            .text-sm { font-size: 9px !important; }
            .text-base { font-size: 10px !important; }
            .text-lg { font-size: 11px !important; }
            .text-xl { font-size: 12px !important; }
            .text-2xl { font-size: 14px !important; }
            
            /* Colors for print */
            .text-gray-600 { color: #666666 !important; }
            .text-gray-400 { color: #999999 !important; }
            .text-blue-600 { color: #000000 !important; font-weight: bold !important; }
            .text-green-600 { color: #000000 !important; }
            
            /* Grid system - używamy CSS Grid zamiast table */
            .grid { 
              display: grid !important; 
              width: 100% !important; 
              grid-template-columns: 
                minmax(30px, 0.8fr)  /* Lp */
                minmax(30px, 0.8fr)  /* Nr */
                minmax(200px, 7fr)   /* Imię i nazwisko */
                minmax(40px, 1fr)    /* Rocznik */
                minmax(120px, 5fr)   /* Klub */
                minmax(50px, 1fr)    /* PB */
                minmax(50px, 1fr)    /* SB */
                !important;
              gap: 0 !important;
            }
            .grid > div { 
              display: block !important; 
              vertical-align: middle !important; 
            }
            
            /* Spacing */
            .py-1 { padding-top: 1px !important; padding-bottom: 1px !important; }
            .py-2 { padding-top: 2px !important; padding-bottom: 2px !important; }
            .py-3 { padding-top: 3px !important; padding-bottom: 3px !important; }
            .px-1 { padding-left: 1px !important; padding-right: 1px !important; }
            .px-3 { padding-left: 3px !important; padding-right: 3px !important; }
            .mb-2 { margin-bottom: 2px !important; }
            .mb-4 { margin-bottom: 4px !important; }
            .mb-6 { margin-bottom: 6px !important; }
            .mb-8 { margin-bottom: 8px !important; }
            .mt-4 { margin-top: 4px !important; }
            .mt-8 { margin-top: 8px !important; }
            
            /* Text handling */
            .truncate { 
              overflow: hidden !important; 
              text-overflow: ellipsis !important; 
              white-space: nowrap !important; 
            }
            .leading-tight { line-height: 1.1 !important; }
            .min-h-\\[20px\\] { min-height: 20px !important; }
            
            /* Grid cell styling */
            .grid > div {
              padding: 2px 1px !important;
              border-right: 1px solid #cccccc !important;
              vertical-align: middle !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            
            .grid > div:last-child {
              border-right: none !important;
            }
            
            /* Hide debug elements */
            .border-red-500,
            .border-blue-500,
            .border-green-500 {
              border-color: transparent !important;
            }
            
            /* Small list page layout */
            .smallListPage {
              height: 100vh !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
            }
            
            .smallListPage .footer {
              margin-top: auto !important;
            }
            
            @media print {
              body { 
                margin: 0 !important; 
                padding: 10mm !important;
              }
              .page-break-before { 
                page-break-before: always !important; 
              }
              .print\\:break-before-page {
                page-break-before: always !important;
              }
              
              /* Small list print layout */
              .smallListPage {
                height: 100vh !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
              
              .smallListPage .footer {
                position: absolute !important;
                bottom: 10mm !important;
                left: 10mm !important;
                right: 10mm !important;
                margin-top: auto !important;
              }
            }
          </style>
        </head>
        <body>
          ${elementRef.current.innerHTML}
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

  const generatePDF = async (
    elementRef: React.RefObject<HTMLDivElement | null>,
    filename: string
  ) => {
    if (!elementRef.current) {
      alert("Błąd: Element do drukowania nie został znaleziony");
      return;
    }

    // Sprawdź wymiary elementu
    const rect = elementRef.current.getBoundingClientRect();
    // Jeśli element ma zerowe wymiary, spróbuj go tymczasowo pokazać
    if (rect.width === 0 || rect.height === 0) {
      const originalStyle = elementRef.current.style.cssText;
      elementRef.current.style.position = "static";
      elementRef.current.style.left = "auto";
      elementRef.current.style.visibility = "visible";
      elementRef.current.style.opacity = "1";

      // Poczekaj chwilę na renderowanie
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newRect = elementRef.current.getBoundingClientRect();
      // Przywróć oryginalny styl po renderowaniu
      setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.style.cssText = originalStyle;
        }
      }, 1000);
    }

    try {
      let imgData: string;

      try {
        // Spróbuj dom-to-image (lepiej obsługuje nowoczesne CSS)
        imgData = await domtoimage.toPng(elementRef.current, {
          width: rect.width || 794,
          height: rect.height || 1123,
          bgcolor: "#ffffff",
          style: {
            color: "#000000",
            backgroundColor: "#ffffff",
          },
        });
      } catch (domError) {
        // Fallback do html2canvas
        const canvas = await html2canvas(elementRef.current, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: rect.width || 794,
          height: rect.height || 1123,
        });

        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error("Canvas ma zerowe wymiary - element może być ukryty");
        }

        imgData = canvas.toDataURL("image/png");
      }

      // Utwórz tymczasowy obraz, żeby uzyskać wymiary
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgData;
      });

      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (img.height * imgWidth) / img.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      alert(
        `Wystąpił błąd podczas generowania PDF: ${error instanceof Error ? error.message : "Nieznany błąd"}`
      );
    }
  };

  // const formatDate = (dateString: string) => { // Obecnie nieużywane
  //   return new Date(dateString).toLocaleDateString('pl-PL', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  return (
    <>
      {/* Przyciski drukowania i PDF */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant="outline"
          onClick={() => {
            printElement(startlistRef);
          }}
        >
          <Printer className="h-4 w-4 mr-2" />
          Drukuj - Lista startowa
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            generatePDF(startlistRef, `lista-startowa-${event.name}.pdf`);
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          PDF - Lista startowa
        </Button>

        {heats.length > 0 && (
          <>
            <Button
              variant="outline"
              onClick={() => {
                printElement(heatsRef);
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Drukuj - Serie
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                generatePDF(heatsRef, `serie-${event.name}.pdf`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF - Serie
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                printElement(protocolRef);
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Drukuj - Protokół
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                generatePDF(protocolRef, `protokol-${event.name}.pdf`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF - Protokół
            </Button>

            {/* Wybór liczby prób dla konkurencji technicznych */}
            {isFieldEvent && (
              <div className="flex items-center gap-2 ml-4">
                <label htmlFor="numberOfTrials" className="text-sm font-medium">
                  Liczba prób:
                </label>
                <select
                  id="numberOfTrials"
                  value={numberOfTrials}
                  onChange={(e) =>
                    setNumberOfTrials(Number(e.target.value) as 3 | 4 | 6)
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  aria-label="Wybierz liczbę prób"
                >
                  <option value={3}>3 próby</option>
                  <option value={4}>4 próby</option>
                  <option value={6}>6 prób</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* Przycisk debug */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          className="ml-4"
        >
          {showDebug ? "Ukryj Debug" : "Pokaż Debug"}
        </Button>
      </div>

      {/* Elementy do renderowania PDF - pozycjonowane poza ekranem ale widoczne */}
      <div
        ref={startlistRef}
        className={`${showDebug ? "relative" : "fixed left-[-9999px]"} top-0 w-[794px] bg-white p-4 border-2 border-red-500 print:static print:left-auto print:w-auto ${styles.pdfElement} ${styles.container}`}
      >
        <StartlistDocument
          event={event}
          competition={competition}
          registrations={registrations}
          heats={heats}
          isFieldEvent={isFieldEvent}
        />
      </div>

      {heats.length > 0 && (
        <div
          ref={heatsRef}
          className={`${showDebug ? "relative mt-4" : "fixed left-[-9999px]"} top-0 w-[794px] bg-white p-8 border-2 border-blue-500 print:static print:left-auto print:w-auto ${styles.pdfElement} ${styles.container}`}
        >
          <HeatsDocument
            event={event}
            competition={competition}
            heats={heats}
            isFieldEvent={isFieldEvent}
          />
        </div>
      )}

      {heats.length > 0 && (
        <div
          ref={protocolRef}
          className={`${showDebug ? "relative mt-4" : "fixed left-[-9999px]"} top-0 w-[794px] bg-white p-8 border-2 border-green-500 print:static print:left-auto print:w-auto ${styles.pdfElement} ${styles.container}`}
        >
          {isFieldEvent ? (
            <RosterStyleProtocol
              event={event}
              competition={competition}
              heats={heats}
              isFieldEvent={isFieldEvent}
              numberOfTrials={numberOfTrials}
            />
          ) : (
            <TrackProtocol
              event={event}
              competition={competition}
              heats={heats}
            />
          )}
        </div>
      )}
    </>
  );
};

// Komponent dokumentu listy startowej
export const StartlistDocument: React.FC<{
  event: Event;
  competition: Competition;
  registrations: StartlistRegistration[];
  heats: GlobalHeat[];
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Funkcja do znajdowania serii i toru zawodnika
  const findAthleteHeatAndLane = (registrationId: string) => {
    for (const heat of heats) {
      for (const lane of heat.lanes) {
        if (lane.registrationId === registrationId) {
          return { heatNumber: heat.heatNumber, laneNumber: lane.laneNumber };
        }
      }
    }
    return null;
  };

  // Funkcja do parsowania czasu i sortowania
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr || timeStr === "-") return 999999;

    // Obsługa formatów: "12.34", "1:23.45", "12.34/24" (z rokiem)
    const cleanTime = timeStr.split("/")[0].trim();

    if (cleanTime.includes(":")) {
      // Format mm:ss.ms
      const parts = cleanTime.split(":");
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    } else {
      // Format ss.ms
      return parseFloat(cleanTime) || 999999;
    }
  };

  // Sortowanie zawodników według nazwiska
  const sortedRegistrations = [...registrations].sort((a, b) => {
    const lastNameA = a.athlete?.lastName?.toLowerCase() || "";
    const lastNameB = b.athlete?.lastName?.toLowerCase() || "";

    if (lastNameA !== lastNameB) {
      return lastNameA.localeCompare(lastNameB, "pl");
    }

    // Jeśli nazwiska są takie same, sortuj według imienia
    const firstNameA = a.athlete?.firstName?.toLowerCase() || "";
    const firstNameB = b.athlete?.firstName?.toLowerCase() || "";

    return firstNameA.localeCompare(firstNameB, "pl");
  });

  // Podział na strony - maksymalnie 25 zawodników na stronę
  const ATHLETES_PER_PAGE = 25;
  const pages = [];
  for (let i = 0; i < sortedRegistrations.length; i += ATHLETES_PER_PAGE) {
    pages.push(sortedRegistrations.slice(i, i + ATHLETES_PER_PAGE));
  }

  // Funkcja do formatowania roku z czasu
  const extractYear = (timeStr: string): string => {
    if (!timeStr || !timeStr.includes("/")) return "";
    const year = timeStr.split("/")[1];
    return year ? `/${year}` : "";
  };

  // Funkcja do formatowania daty urodzenia
  const formatBirthDate = (athlete: any): string => {
    if (!athlete?.yearOfBirth) return "";
    return athlete.yearOfBirth.toString();
  };

  // Poprawione łamanie stron - każda lista (oprócz pierwszej) zaczyna się na nowej stronie
  const pageBreakClass = !isFirstEvent ? "page-break-before" : "";

  // Wszystkie listy mieszczą się na jednej stronie A4
  const containerClass = "min-h-fit";

  return (
    <>
      {pages.map((pageRegistrations, pageIndex) => (
        <div
          key={pageIndex}
          className={`${containerClass} bg-white p-2 ${styles.professionalStartlist} ${pageIndex === 0 ? pageBreakClass : "page-break-before"}`}
        >
          {/* Główna zawartość */}
          <div>
            {/* Nagłówek */}
            <div className={`text-center mb-3 ${styles.header}`}>
              {/* Logo zawodów */}
              {competition.logos &&
              competition.logos.filter((logo) => logo.isVisible !== false)
                .length > 0 ? (
                <div className="flex justify-center items-center space-x-4 mb-2 h-10">
                  {competition.logos
                    .filter((logo) => logo.isVisible !== false)
                    .slice(0, 5)
                    .map((logo) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={logo.id}
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${logo.url}`}
                        alt={logo.originalName}
                        className="max-h-8 max-w-14 object-contain"
                      />
                    ))}
                </div>
              ) : null}

              <h1
                className={`text-base font-bold mb-1 ${styles.competitionTitle}`}
              >
                {competition.name}
              </h1>
              <p className="text-xs font-medium mb-1">
                {competition.location?.toUpperCase()},{" "}
                {formatDate(competition.startDate)}
              </p>
              <h2 className="text-sm font-bold mt-1 mb-1">Lista startowa</h2>
              <p className={`text-xs font-semibold ${styles.eventTitle}`}>
                {event.name} {event.gender === "MALE" ? "M" : "K"}
              </p>

              {/* Dodatkowe informacje o konkurencji */}
              <div className="mt-1 text-xs text-gray-600">
                <p>
                  Liczba zawodników: {sortedRegistrations.length}
                  {pages.length > 1 &&
                    ` | Strona ${pageIndex + 1} z ${pages.length}`}
                </p>
              </div>
            </div>

            {/* Tabela zawodników */}
            <table className="w-full border-collapse border-2 border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-2 py-2 text-center font-bold text-xs w-8">
                    Lp
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold text-xs w-8">
                    Nr
                  </th>
                  <th className="border border-black px-2 py-2 text-left font-bold text-xs">
                    Imię i nazwisko
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold text-xs w-16">
                    Rocznik
                  </th>
                  <th className="border border-black px-2 py-2 text-left font-bold text-xs">
                    Klub
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold text-xs w-12">
                    PB
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold text-xs w-12">
                    SB
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRegistrations.map((registration, index) => {
                  const globalIndex = pageIndex * ATHLETES_PER_PAGE + index;
                  const heatInfo = findAthleteHeatAndLane(registration.id);

                  // Osobno obsługuj PB i SB
                  const personalBest = registration.personalBest || "";
                  const seasonBest = registration.seasonBest || "";

                  const pbTimeWithoutYear = personalBest
                    ? personalBest.split("/")[0]
                    : "";
                  const pbYear = extractYear(personalBest);

                  const sbTimeWithoutYear = seasonBest
                    ? seasonBest.split("/")[0]
                    : "";
                  const sbYear = extractYear(seasonBest);

                  return (
                    <tr
                      key={registration.id}
                      className={
                        globalIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }
                    >
                      {/* Lp */}
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium text-xs">
                        {globalIndex + 1}
                      </td>

                      {/* Numer startowy */}
                      <td className="border border-gray-300 px-2 py-1 text-center text-xs">
                        {registration.bibNumber ? (
                          <span className="font-bold">
                            {registration.bibNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Imię i nazwisko */}
                      <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                        <span className="font-medium leading-tight">
                          {registration.athlete?.firstName}{" "}
                          <span className="font-bold">
                            {registration.athlete?.lastName?.toUpperCase()}
                          </span>
                        </span>
                      </td>

                      {/* Rocznik */}
                      <td className="border border-gray-300 px-2 py-1 text-center text-xs">
                        {formatBirthDate(registration.athlete)}
                      </td>

                      {/* Klub */}
                      <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                        <span className="leading-tight">
                          {registration.athlete?.club || "-"}
                        </span>
                      </td>

                      {/* Personal Best (PB) */}
                      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                        {pbTimeWithoutYear ? (
                          <div className="font-mono">
                            <div>{pbTimeWithoutYear}</div>
                            {pbYear && (
                              <div className="text-gray-600 text-xs">
                                {pbYear}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Season Best (SB) */}
                      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                        {sbTimeWithoutYear ? (
                          <div className="font-mono">
                            <div>{sbTimeWithoutYear}</div>
                            {sbYear && (
                              <div className="text-gray-600 text-xs">
                                {sbYear}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stopka - tylko na ostatniej stronie */}
          {pageIndex === pages.length - 1 && (
            <div className={`mt-3 space-y-2 ${styles.footer}`}>
              {/* Informacje o rekordach */}
              <div className="text-xs text-gray-600">
                <p>
                  PB - rekord życiowy z rokiem uzyskania, SB - rekord sezonu z
                  rokiem uzyskania
                </p>
              </div>

              {/* Informacje techniczne */}
              <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-2">
                <div>
                  <p className="font-medium">
                    {competition.name} - System zarządzania zawodami
                    lekkoatletycznymi
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    Druk:{" "}
                    {new Date().toLocaleString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

// Komponent dokumentu serii
export const HeatsDocument: React.FC<{
  event: Event;
  competition: Competition;
  heats: GlobalHeat[];
  isFieldEvent: boolean;
}> = ({ event, competition, heats, isFieldEvent }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      {heats.map((heat, heatIndex) => (
        <div
          key={heat.id}
          className={`space-y-6 ${heatIndex > 0 ? "page-break-before print:break-before-page" : ""}`}
        >
          {/* Nagłówek dla każdej serii */}
          <div className="text-center border-b pb-4">
            {/* Logo zawodów */}
            {competition.logos &&
            competition.logos.filter((logo) => logo.isVisible !== false)
              .length > 0 ? (
              <div className="flex justify-center items-center space-x-3 mb-4 h-16">
                {competition.logos
                  .filter((logo) => logo.isVisible !== false)
                  .slice(0, 5)
                  .map((logo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={logo.id}
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${logo.url}`}
                      alt={logo.originalName}
                      className="max-h-12 max-w-20 object-contain"
                    />
                  ))}
              </div>
            ) : (
              <div className="h-16 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                <span className="text-gray-400 text-sm">LOGO ZAWODÓW</span>
              </div>
            )}
            <h1 className="text-2xl font-bold">{competition.name}</h1>
            <p className="text-lg">{competition.location}</p>
            <p className="text-gray-600">{formatDate(competition.startDate)}</p>
            <h2 className="text-xl font-semibold mt-4">
              {isFieldEvent ? "FINAŁ" : `SERIA ${heat.heatNumber}`}
            </h2>
            <p className="text-lg">
              {event.name} {event.gender === "MALE" ? "M" : "K"}
            </p>
            {heat.lanes.filter((lane) => lane.athlete).length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Liczba zawodników:{" "}
                {heat.lanes.filter((lane) => lane.athlete).length}
              </p>
            )}
          </div>

          {/* Tabela zawodników w serii */}
          <div className="border-2 border-black mb-6">
            {/* Nagłówek tabeli */}
            <div className="bg-gray-100 border-b-2 border-black">
              <div className="grid grid-cols-12 gap-2 py-2 px-3 font-bold text-sm">
                <div className="col-span-1 text-center">Tor</div>
                <div className="col-span-1 text-center">Nr</div>
                <div className="col-span-5">Imię i nazwisko</div>
                <div className="col-span-1 text-center">Rocznik</div>
                <div className="col-span-3">Klub</div>
                <div className="col-span-1 text-center">Czas zgł.</div>
              </div>
            </div>

            {/* Wiersze zawodników */}
            {heat.lanes
              .filter((lane) => lane.athlete)
              .sort((a, b) => a.laneNumber - b.laneNumber)
              .map((lane, index) => {
                // Znajdź rejestrację z rekordami dla tego zawodnika
                const regWithRecords = registrations?.find(
                  (r) => r.id === lane.registrationId
                );

                return (
                  <div
                    key={lane.laneNumber}
                    className={`border-b border-gray-300 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <div className="grid grid-cols-12 gap-2 py-3 px-3 text-sm items-center">
                      {/* Tor */}
                      <div className="col-span-1 text-center">
                        <span className="font-bold text-lg bg-gray-200 px-2 py-1 rounded">
                          {lane.laneNumber}
                        </span>
                      </div>

                      {/* Nr startowy */}
                      <div className="col-span-1 text-center">
                        {lane.registration?.bibNumber ? (
                          <span className="font-bold text-base">
                            {lane.registration.bibNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>

                      {/* Imię i Nazwisko */}
                      <div className="col-span-5">
                        <span className="font-medium text-base">
                          {regWithRecords?.athlete?.firstName ||
                            lane.athlete?.firstName}{" "}
                          {(
                            regWithRecords?.athlete?.lastName ||
                            lane.athlete?.lastName
                          )?.toUpperCase()}
                        </span>
                      </div>

                      {/* Rocznik */}
                      <div className="col-span-1 text-center text-xs">
                        {regWithRecords?.athlete?.yearOfBirth ||
                          lane.athlete?.yearOfBirth ||
                          "-"}
                      </div>

                      {/* Klub */}
                      <div className="col-span-3 text-xs">
                        {regWithRecords?.athlete?.club ||
                          lane.athlete?.club ||
                          "-"}
                      </div>

                      {/* Czas zgłoszeniowy */}
                      <div className="col-span-1 text-center">
                        <span className="font-mono text-sm">
                          {(() => {
                            const seedTime =
                              regWithRecords?.seedTime ||
                              lane.registration?.seedTime ||
                              lane.seedTime;
                            return seedTime ? seedTime.split("/")[0] : "-";
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Informacje organizacyjne */}
          <div className="mt-8 space-y-6">
            {/* Statystyki */}
            <div className="bg-gray-50 p-4 rounded border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-bold text-lg">
                    {heat.lanes.filter((lane) => lane.athlete).length}
                  </div>
                  <div className="text-sm text-gray-600">Zawodników</div>
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {heat.lanes.length || 20}
                  </div>
                  <div className="text-sm text-gray-600">Dostępnych torów</div>
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {isFieldEvent ? "FINAŁ" : `SERIA ${heat.heatNumber}`}
                  </div>
                  <div className="text-sm text-gray-600">Runda</div>
                </div>
              </div>
            </div>

            {/* Podpisy sędziów */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="space-y-4">
                <h3 className="font-bold text-base border-b pb-2">SĘDZIOWIE</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Sędzia główny:
                    </div>
                    <div className="border-b border-gray-400 h-8"></div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Sędzia startowy:
                    </div>
                    <div className="border-b border-gray-400 h-8"></div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Sędzia na mecie:
                    </div>
                    <div className="border-b border-gray-400 h-8"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-base border-b pb-2">
                  INFORMACJE
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Godzina startu:
                    </div>
                    <div className="border-b border-gray-400 h-8"></div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Warunki atmosferyczne:
                    </div>
                    <div className="border-b border-gray-400 h-8"></div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Uwagi:</div>
                    <div className="border-b border-gray-400 h-8"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stopka */}
            <div className="mt-8 pt-4 border-t text-sm text-gray-500 text-center">
              <p>Data wydruku: {new Date().toLocaleString("pl-PL")}</p>
              <p className="mt-1">
                System zarządzania zawodami lekkoatletycznymi
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
