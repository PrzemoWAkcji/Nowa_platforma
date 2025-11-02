"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRelayTeamEventRegistrations } from "@/hooks/useRelayTeams";
import { Event } from "@/types";
import { Download, FileText, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RelayStartListExportProps {
  event: Event;
}

export function RelayStartListExport({ event }: RelayStartListExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { data: registrations } = useRelayTeamEventRegistrations(event.id);

  const sortedRegistrations =
    registrations?.sort((a: any, b: any) => {
      if (a.seedTime && b.seedTime) {
        return a.seedTime.localeCompare(b.seedTime);
      }
      if (a.seedTime && !b.seedTime) return -1;
      if (!a.seedTime && b.seedTime) return 1;
      return (a.team?.name || "").localeCompare(b.team?.name || "");
    }) || [];

  const generateCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("Brak danych do eksportu");
      return;
    }

    const headers = [
      "Pozycja",
      "Nazwa zespołu",
      "Klub",
      "Czas zgłoszeniowy",
      "Członek 1",
      "Członek 2",
      "Członek 3",
      "Członek 4",
      "Rezerwowy 1",
      "Rezerwowy 2",
    ];

    const rows = sortedRegistrations.map((registration: any, index: any) => {
      const mainMembers = (registration.team?.members || [])
        .filter((m: any) => !m.isReserve)
        .sort((a: any, b: any) => a.position - b.position);

      const reserves = (registration.team?.members || [])
        .filter((m: any) => m.isReserve)
        .sort((a: any, b: any) => a.position - b.position);

      return [
        index + 1,
        registration.team?.name || "Nieznany zespół",
        registration.team?.club || "",
        registration.seedTime || "",
        mainMembers[0]
          ? `${mainMembers[0].athlete.firstName} ${mainMembers[0].athlete.lastName}`
          : "",
        mainMembers[1]
          ? `${mainMembers[1].athlete.firstName} ${mainMembers[1].athlete.lastName}`
          : "",
        mainMembers[2]
          ? `${mainMembers[2].athlete.firstName} ${mainMembers[2].athlete.lastName}`
          : "",
        mainMembers[3]
          ? `${mainMembers[3].athlete.firstName} ${mainMembers[3].athlete.lastName}`
          : "",
        reserves[0]
          ? `${reserves[0].athlete.firstName} ${reserves[0].athlete.lastName}`
          : "",
        reserves[1]
          ? `${reserves[1].athlete.firstName} ${reserves[1].athlete.lastName}`
          : "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell: any) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `lista_startowa_${event.name.replace(/\s+/g, "_")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintableHTML = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("Brak danych do wydruku");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lista startowa - ${event.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .event-info { margin-bottom: 20px; }
          .team { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
          .team-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
          .team-name { font-size: 18px; font-weight: bold; }
          .seed-time { font-size: 16px; color: #0066cc; font-weight: bold; }
          .members { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .member { padding: 5px; background: #f5f5f5; }
          .reserves { margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; }
          .position { background: #333; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; }
          @media print {
            body { margin: 0; }
            .team { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Lista startowa</h1>
          <h2>${event.name}</h2>
          <p>${event.gender} • ${event.category}</p>
        </div>
        
        ${sortedRegistrations
          .map((registration: any, index: any) => {
            const mainMembers = (registration.team?.members || [])
              .filter((m: any) => !m.isReserve)
              .sort((a: any, b: any) => a.position - b.position);

            const reserves = (registration.team?.members || [])
              .filter((m: any) => m.isReserve)
              .sort((a: any, b: any) => a.position - b.position);

            return `
            <div class="team">
              <div class="team-header">
                <div>
                  <span class="position">${index + 1}</span>
                  <span class="team-name">${registration.team?.name || "Nieznany zespół"}</span>
                  ${registration.team?.club ? `<br><small>${registration.team.club}</small>` : ""}
                </div>
                ${registration.seedTime ? `<div class="seed-time">${registration.seedTime}</div>` : ""}
              </div>
              
              <div class="members">
                ${mainMembers
                  .map(
                    (member: any) => `
                  <div class="member">
                    <strong>${member.position}.</strong> ${member.athlete.firstName} ${member.athlete.lastName}
                    ${member.athlete.club ? `<br><small>${member.athlete.club}</small>` : ""}
                  </div>
                `
                  )
                  .join("")}
              </div>
              
              ${
                reserves.length > 0
                  ? `
                <div class="reserves">
                  <strong>Rezerwowi:</strong>
                  <div class="members">
                    ${reserves
                      .map(
                        (member: any) => `
                      <div class="member">
                        <strong>${member.position}.</strong> ${member.athlete.firstName} ${member.athlete.lastName}
                        ${member.athlete.club ? `<br><small>${member.athlete.club}</small>` : ""}
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          `;
          })
          .join("")}
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleExport = async (format: "csv" | "print") => {
    setIsExporting(true);
    try {
      if (format === "csv") {
        generateCSV();
        toast.success("Lista startowa została wyeksportowana do CSV");
      } else {
        generatePrintableHTML();
      }
    } catch {
      toast.error("Błąd podczas eksportu");
    } finally {
      setIsExporting(false);
    }
  };

  if (!registrations || registrations.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Eksportowanie..." : "Eksportuj"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          Eksportuj do CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("print")}>
          <Printer className="h-4 w-4 mr-2" />
          Drukuj listę startową
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
