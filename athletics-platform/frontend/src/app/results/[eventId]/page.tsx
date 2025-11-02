"use client";

import { useParams } from "next/navigation";
// import { useRouter } from 'next/navigation'; // Obecnie nieużywane
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvents";
import { useResults } from "@/hooks/useResults";
import { Clock, Printer, Trophy, Wind, Zap } from "lucide-react";

export default function EventResultsPage() {
  const params = useParams();
  // const router = useRouter(); // Obecnie nieużywane
  const eventId = params.eventId as string;

  const { data: event } = useEvents();
  const { data: results } = useResults();

  // Filtruj wyniki dla tej konkurencji
  const eventResults =
    results?.filter((result) => result.eventId === eventId) || [];
  const currentEvent = event?.find((e) => e.id === eventId);

  // Grupuj wyniki według serii (na podstawie notatek z importu)
  const groupedResults = eventResults.reduce(
    (groups: Record<string, typeof eventResults>, result) => {
      const heatMatch = result.notes?.match(/Seria:\s*(\d+|N\/A)/);
      const heat = heatMatch ? heatMatch[1] : "Nieznana";

      if (!groups[heat]) {
        groups[heat] = [];
      }
      groups[heat].push(result);
      return groups;
    },
    {}
  );

  // Sortuj wyniki w każdej serii według pozycji
  Object.keys(groupedResults).forEach((heat) => {
    groupedResults[heat].sort((a, b) => {
      if (a.position && b.position) return a.position - b.position;
      if (a.position) return -1;
      if (b.position) return 1;
      return 0;
    });
  });

  if (!currentEvent) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p>Ładowanie konkurencji...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={currentEvent.name}
          description={`${currentEvent.category} • ${currentEvent.gender === "MALE" ? "Mężczyźni" : "Kobiety"}`}
          backButtonFallback="/results"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">
                {eventResults.length} wyników
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Drukuj
              </Button>
            </div>
          </div>
        </PageHeader>

        {/* Nagłówek wyników - widoczny przy druku */}
        <div className="print:block hidden">
          <div className="text-center mb-6">
            {/* Logo zawodów - placeholder, będzie pobierane z API */}
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="h-16 border-2 border-dashed border-gray-300 flex items-center justify-center px-4">
                <span className="text-gray-400 text-sm">LOGO ZAWODÓW</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">WYNIKI KONKURENCJI</h1>
            <h2 className="text-xl font-semibold mb-2">{currentEvent.name}</h2>
            <p className="text-lg">
              {currentEvent.category} •{" "}
              {currentEvent.gender === "MALE" ? "Mężczyźni" : "Kobiety"}
            </p>
          </div>
        </div>

        {/* Wyniki według serii */}
        {Object.keys(groupedResults).length > 1 ? (
          <Tabs
            defaultValue={Object.keys(groupedResults)[0]}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-auto">
              {Object.keys(groupedResults).map((heat) => (
                <TabsTrigger key={heat} value={heat}>
                  Seria {heat}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedResults).map(
              ([heat, heatResults]: [string, typeof eventResults]) => (
                <TabsContent key={heat} value={heat}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Seria {heat}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResultsTable
                        results={heatResults.map((result) => ({
                          id: result.id,
                          position: result.position,
                          performance: result.result,
                          wind: result.wind,
                          notes: result.notes,
                          athlete: {
                            firstName: result.athlete?.firstName || "",
                            lastName: result.athlete?.lastName || "",
                            club: result.athlete?.club,
                            licenseNumber: result.athlete?.licenseNumber,
                          },
                          isDNS: result.isDNS,
                          isDNF: result.isDNF,
                          isDQ: result.isDQ,
                          reaction: result.reaction,
                        }))}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            )}
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Wyniki konkurencji</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsTable
                results={eventResults.map((result) => ({
                  id: result.id,
                  position: result.position,
                  performance: result.result,
                  wind: result.wind,
                  notes: result.notes,
                  athlete: {
                    firstName: result.athlete?.firstName || "",
                    lastName: result.athlete?.lastName || "",
                    club: result.athlete?.club,
                    licenseNumber: result.athlete?.licenseNumber,
                  },
                  isDNS: result.isDNS,
                  isDNF: result.isDNF,
                  isDQ: result.isDQ,
                  reaction: result.reaction,
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Podsumowanie */}
        {eventResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Podsumowanie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      eventResults.filter(
                        (r) => r.isValid && !r.isDNS && !r.isDNF && !r.isDQ
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Ważne wyniki</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {eventResults.filter((r) => r.isDNS).length}
                  </div>
                  <div className="text-sm text-gray-600">DNS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {eventResults.filter((r) => r.isDNF).length}
                  </div>
                  <div className="text-sm text-gray-600">DNF</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {eventResults.filter((r) => r.isDQ).length}
                  </div>
                  <div className="text-sm text-gray-600">DQ</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function ResultsTable({
  results,
}: {
  results: Array<{
    id: string;
    position?: number;
    performance: string;
    wind?: string;
    notes?: string;
    athlete: {
      firstName: string;
      lastName: string;
      club?: string;
      licenseNumber?: string;
    };
    isDNS?: boolean;
    isDNF?: boolean;
    isDQ?: boolean;
    reaction?: string;
  }>;
}) {
  const formatTime = (timeString: string) => {
    if (!timeString) return "-";

    if (timeString.match(/^\d+\.\d+$/)) {
      return `${timeString}s`;
    }

    if (timeString.match(/^\d+:\d+\.\d+$/)) {
      return timeString;
    }

    return timeString;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500">🥇 1</Badge>;
    if (position === 2) return <Badge className="bg-gray-400">🥈 2</Badge>;
    if (position === 3) return <Badge className="bg-amber-600">🥉 3</Badge>;
    return <Badge variant="outline">{position}</Badge>;
  };

  const getStatusBadge = (result: {
    isDNS?: boolean;
    isDNF?: boolean;
    isDQ?: boolean;
  }) => {
    if (result.isDNS) return <Badge variant="destructive">DNS</Badge>;
    if (result.isDNF) return <Badge variant="destructive">DNF</Badge>;
    if (result.isDQ) return <Badge variant="destructive">DQ</Badge>;
    return null;
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Brak wyników w tej serii
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Pozycja</th>
            <th className="text-left py-2">Zawodnik</th>
            <th className="text-left py-2">Klub</th>
            <th className="text-left py-2">Wynik</th>
            <th className="text-left py-2">Wiatr</th>
            <th className="text-left py-2">Reakcja</th>
            <th className="text-left py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b hover:bg-gray-50">
              <td className="py-3">
                {result.position ? getPositionBadge(result.position) : "-"}
              </td>
              <td className="py-3">
                <div>
                  <div className="font-medium">
                    {result.athlete.firstName} {result.athlete.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.athlete.licenseNumber}
                  </div>
                </div>
              </td>
              <td className="py-3 text-sm text-gray-600">
                {result.athlete.club}
              </td>
              <td className="py-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-mono">
                    {formatTime(result.performance)}
                  </span>
                </div>
              </td>
              <td className="py-3">
                {result.wind && (
                  <div className="flex items-center space-x-1">
                    <Wind className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{result.wind}m/s</span>
                  </div>
                )}
              </td>
              <td className="py-3">
                {result.reaction && (
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{result.reaction}s</span>
                  </div>
                )}
              </td>
              <td className="py-3">{getStatusBadge(result)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
