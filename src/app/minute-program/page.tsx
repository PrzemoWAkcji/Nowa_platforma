"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentCompetition } from "@/store/currentCompetitionStore";
import { CompetitionLogo } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  Plus,
  Printer,
  Share2,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface MinuteProgramItem {
  time: string;
  eventName: string;
  round: string;
  series?: string;
  finalists?: string;
  notes?: string;
}

interface MinuteProgramGroup {
  time: string;
  events: MinuteProgramItem[];
}

interface MinuteProgram {
  competition: {
    id: string;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    logos?: CompetitionLogo[];
  };
  schedule: {
    id: string;
    name: string;
    description?: string;
  };
  timeGroups: MinuteProgramGroup[];
}

interface Competition {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function MinuteProgramPage() {
  const [selectedCompetitionId, setSelectedCompetitionId] =
    useState<string>("");
  const router = useRouter();
  const { currentCompetitionId, isInCompetitionContext } =
    useCurrentCompetition();

  // Sprawdź czy użytkownik przyszedł z kontekstu zawodów
  React.useEffect(() => {
    // Sprawdź localStorage dla ostatnio wybranych zawodów
    const lastCompetitionId = localStorage.getItem("lastSelectedCompetitionId");

    // Sprawdź referrer - czy użytkownik przyszedł ze strony zawodów
    const referrer = document.referrer;
    const competitionMatch = referrer.match(/\/competitions\/([^\/]+)/);

    if (competitionMatch && competitionMatch[1]) {
      const competitionIdFromReferrer = competitionMatch[1];
      // Przekieruj bezpośrednio do strony programu minutowego dla tych zawodów
      router.replace(
        `/competitions/${competitionIdFromReferrer}/minute-program`
      );
      return;
    }

    if (lastCompetitionId && !selectedCompetitionId) {
      setSelectedCompetitionId(lastCompetitionId);
    }
  }, [selectedCompetitionId, router]);

  // Pobierz listę zawodów
  const { data: competitions } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const response = await fetch("/api/competitions");
      if (!response.ok) throw new Error("Failed to fetch competitions");
      return response.json() as Promise<Competition[]>;
    },
  });

  // Pobierz program minutowy dla wybranych zawodów
  const {
    data: minuteProgram,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["minute-program", selectedCompetitionId],
    queryFn: async () => {
      if (!selectedCompetitionId) return null;
      const response = await fetch(
        `/api/organization/schedules/competitions/${selectedCompetitionId}/minute-program`
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("NO_SCHEDULE");
        }
        throw new Error("Failed to fetch minute program");
      }
      return response.json() as Promise<MinuteProgram>;
    },
    enabled: !!selectedCompetitionId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info("Funkcja pobierania PDF będzie dostępna wkrótce");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Program minutowy - ${minuteProgram?.competition.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link skopiowany do schowka");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 print:space-y-4">
          <PageHeader
            title="Program minutowy"
            description="Przeglądaj programy minutowe zawodów"
            className="print:hidden"
          >
            {minuteProgram && (
              <>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Udostępnij
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Pobierz PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Drukuj
                </Button>
              </>
            )}
          </PageHeader>

          {/* Ostrzeżenie gdy użytkownik ma kontekst zawodów */}
          {isInCompetitionContext && currentCompetitionId && (
            <Card className="print:hidden border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-900 mb-1">
                      Szybszy dostęp do programu minutowego
                    </h3>
                    <p className="text-sm text-orange-800 mb-3">
                      Przeglądasz zawody, ale używasz globalnej strony programu
                      minutowego. Możesz przejść bezpośrednio do programu dla
                      tych zawodów.
                    </p>
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/competitions/${currentCompetitionId}/minute-program`
                        )
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Przejdź do programu tych zawodów
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wybór zawodów - ukryty przy druku */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Wybierz zawody
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Select
                    value={selectedCompetitionId}
                    onValueChange={(value) => {
                      setSelectedCompetitionId(value);
                      // Zapisz wybrane zawody w localStorage
                      localStorage.setItem("lastSelectedCompetitionId", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz zawody..." />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions?.map((competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{competition.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {format(
                                new Date(competition.startDate),
                                "dd.MM.yyyy"
                              )}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCompetitionId && (
                  <Link
                    href={`/competitions/${selectedCompetitionId}/organization`}
                  >
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Zarządzaj programem
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Komunikaty o błędach */}
          {!selectedCompetitionId && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Wybierz zawody
                </h3>
                <p className="text-gray-600 mb-4">
                  Aby wyświetlić program minutowy, wybierz zawody z listy
                  powyżej.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Wskazówka:</p>
                  <p>
                    Jeśli przeglądasz konkretne zawody, użyj przycisku
                    &quot;Program minutowy&quot; na stronie zawodów lub w sekcji
                    &quot;Organizacja zawodów&quot; - będzie szybciej!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && selectedCompetitionId && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && selectedCompetitionId && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-orange-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Brak programu minutowego
                </h3>
                <p className="text-gray-600 mb-4">
                  Program minutowy nie został jeszcze utworzony dla tych
                  zawodów.
                </p>
                <Link
                  href={`/competitions/${selectedCompetitionId}/organization`}
                >
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Utwórz program minutowy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Program minutowy */}
          {minuteProgram && (
            <>
              {/* Nagłówek programu - widoczny przy druku */}
              <div className="print:block hidden">
                <div className="text-center mb-6">
                  {/* Logo zawodów */}
                  {minuteProgram.competition.logos &&
                    minuteProgram.competition.logos.filter(
                      (logo) => logo.isVisible !== false
                    ).length > 0 && (
                      <div className="flex justify-center items-center space-x-4 mb-4">
                        {minuteProgram.competition.logos
                          .filter((logo) => logo.isVisible !== false)
                          .slice(0, 8)
                          .map((logo) => (
                            <Image
                              key={logo.id}
                              src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${logo.url}`}
                              alt={logo.originalName}
                              width={60}
                              height={60}
                              className="max-h-16 max-w-24 object-contain"
                            />
                          ))}
                      </div>
                    )}
                  <h1 className="text-2xl font-bold mb-2">
                    {minuteProgram.competition.name}
                  </h1>
                  <div className="text-lg mb-2">
                    {minuteProgram.competition.location}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(
                      new Date(minuteProgram.competition.startDate),
                      "dd MMMM yyyy",
                      { locale: pl }
                    )}
                    {minuteProgram.competition.startDate !==
                      minuteProgram.competition.endDate && (
                      <>
                        {" "}
                        -{" "}
                        {format(
                          new Date(minuteProgram.competition.endDate),
                          "dd MMMM yyyy",
                          { locale: pl }
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-4 text-xl font-semibold">
                    PROGRAM MINUTOWY
                  </div>
                  {minuteProgram.schedule.description && (
                    <div className="text-sm text-gray-600 mt-2">
                      {minuteProgram.schedule.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Informacje o zawodach - tylko na ekranie */}
              <Card className="print:hidden">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">Data</div>
                        <div className="text-sm text-gray-600">
                          {format(
                            new Date(minuteProgram.competition.startDate),
                            "dd MMMM yyyy",
                            { locale: pl }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold">Miejsce</div>
                        <div className="text-sm text-gray-600">
                          {minuteProgram.competition.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-semibold">Konkurencji</div>
                        <div className="text-sm text-gray-600">
                          {minuteProgram.timeGroups.reduce(
                            (sum, group) => sum + group.events.length,
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program minutowy */}
              <div className="space-y-4 print:space-y-2">
                {minuteProgram.timeGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="print:break-inside-avoid">
                    {/* Separator czasowy */}
                    <div className="flex items-center gap-4 mb-3 print:mb-2">
                      <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full print:bg-transparent print:border print:border-gray-300">
                        <Clock className="w-4 h-4 text-blue-600 print:text-black" />
                        <span className="font-mono text-lg font-bold text-blue-900 print:text-black">
                          {group.time}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Wydarzenia w danej godzinie */}
                    <div className="space-y-2 ml-4 print:ml-2">
                      {group.events.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="print:break-inside-avoid"
                        >
                          <Card className="print:border print:border-gray-300 print:shadow-none">
                            <CardContent className="p-4 print:p-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold print:text-base">
                                      {event.eventName}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className="print:border-gray-400"
                                    >
                                      {event.round}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-gray-600 print:text-black">
                                    {event.series && (
                                      <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {event.series}
                                      </span>
                                    )}
                                    {event.finalists && (
                                      <span className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4" />
                                        {event.finalists}
                                      </span>
                                    )}
                                    {event.notes && (
                                      <span className="italic">
                                        {event.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {minuteProgram.timeGroups.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Program jest pusty
                    </h3>
                    <p className="text-gray-600">
                      Brak pozycji w programie minutowym.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stopka dla druku */}
              <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
                <div>
                  Program minutowy wygenerowany:{" "}
                  {format(new Date(), "dd.MM.yyyy HH:mm")}
                </div>
                <div className="mt-1">
                  System zarządzania zawodami lekkoatletycznymi
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
