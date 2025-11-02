"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateRelayTeamDialog } from "@/components/relay-teams/CreateRelayTeamDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCompetition } from "@/hooks/useCompetitions";
import { useRelayTeams } from "@/hooks/useRelayTeams";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, Eye, Plus, Trophy, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function RelayTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const { data: competition, isLoading: competitionLoading } =
    useCompetition(competitionId);
  const {
    data: teams,
    isLoading: teamsLoading,
    error,
  } = useRelayTeams(competitionId);
  const { user } = useAuthStore();

  const handleViewTeam = (teamId: string) => {
    router.push(`/competitions/${competitionId}/relay-teams/${teamId}`);
  };

  const isLoading = competitionLoading || teamsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Ładowanie zespołów sztafetowych...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Błąd podczas ładowania zespołów</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => router.back()}
            >
              Wróć
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Zespoły sztafetowe"
          description={
            competition
              ? `${competition.name} • ${format(new Date(competition.startDate), "dd MMM yyyy", { locale: pl })}`
              : undefined
          }
          backButtonFallback={`/competitions/${competitionId}`}
        >
          {user &&
            (user.role === UserRole.ADMIN ||
              user.role === UserRole.ORGANIZER ||
              user.role === UserRole.COACH ||
              user.role === UserRole.ATHLETE) && (
              <CreateRelayTeamDialog
                competitionId={competitionId}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj zespół sztafetowy
                  </Button>
                }
              />
            )}
        </PageHeader>

        {/* Teams List */}
        {teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team: any) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      {team.club && (
                        <p className="text-sm text-gray-600 mt-1">
                          {team.club}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {team.members?.length || 0}/6
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      variant={
                        (team.members?.filter((m: any) => !m.isReserve)
                          .length || 0) >= 4
                          ? "default"
                          : "secondary"
                      }
                    >
                      {(team.members?.filter((m: any) => !m.isReserve).length ||
                        0) >= 4
                        ? "Gotowy"
                        : "Niekompletny"}
                    </Badge>
                  </div>

                  {/* Members Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Podstawowy skład:</span>
                      <span className="font-medium">
                        {team.members?.filter((m: any) => !m.isReserve)
                          .length || 0}
                        /4
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rezerwowi:</span>
                      <span className="font-medium">
                        {team.members?.filter((m: any) => m.isReserve).length ||
                          0}
                        /2
                      </span>
                    </div>
                  </div>

                  {/* Recent Members */}
                  {(team.members?.length || 0) > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Członkowie:</p>
                      <div className="space-y-1">
                        {team.members
                          ?.filter((m: any) => !m.isReserve)
                          .sort((a: any, b: any) => a.position - b.position)
                          .slice(0, 3)
                          .map((member: any) => (
                            <div
                              key={member.id}
                              className="flex items-center text-sm"
                            >
                              <Badge
                                variant="outline"
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2"
                              >
                                {member.position}
                              </Badge>
                              <span className="truncate">
                                {member.athlete.firstName}{" "}
                                {member.athlete.lastName}
                              </span>
                            </div>
                          ))}
                        {(team.members?.filter((m: any) => !m.isReserve)
                          .length || 0) > 3 && (
                          <p className="text-xs text-gray-500">
                            i{" "}
                            {(team.members?.filter((m: any) => !m.isReserve)
                              .length || 0) - 3}{" "}
                            więcej...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-gray-600">
                        {team.registrations?.length || 0} rejestracji
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-gray-600">
                        {team.results?.length || 0} wyników
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewTeam(team.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Zobacz szczegóły
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Brak zespołów sztafetowych
              </h3>
              <p className="text-gray-600 mb-6">
                Nie utworzono jeszcze żadnych zespołów sztafetowych dla tych
                zawodów.
              </p>
              <CreateRelayTeamDialog
                competitionId={competitionId}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Utwórz pierwszy zespół
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Informacje o zespołach sztafetowych
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Zespół może mieć maksymalnie 6 członków (4 podstawowych +
                    2 rezerwowych)
                  </li>
                  <li>
                    • Do rejestracji w konkurencji wymaganych jest minimum 4
                    podstawowych członków
                  </li>
                  <li>
                    • Pozycje 1-4 są dla podstawowych członków, pozycje 5-6 dla
                    rezerwowych
                  </li>
                  <li>
                    • Każdy zespół musi mieć unikalną nazwę w ramach zawodów
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
