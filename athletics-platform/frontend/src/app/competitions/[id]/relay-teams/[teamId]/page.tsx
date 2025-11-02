"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RelayTeamMembersManager } from "@/components/relay-teams/RelayTeamMembersManager";
import { RelayTeamRegistrationDialog } from "@/components/relay-teams/RelayTeamRegistrationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDeleteRelayTeam,
  useFixRelayTeamMembers,
  useRelayTeam,
} from "@/hooks/useRelayTeams";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowLeft, Calendar, Edit, Trash2, Trophy, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RelayTeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const competitionId = params.id as string;

  const { data: team, isLoading, error } = useRelayTeam(teamId);

  // Debug - sprawdź czy dane zespołu się zmieniają
  const deleteTeam = useDeleteRelayTeam();
  const fixMembers = useFixRelayTeamMembers();
  const { user } = useAuthStore();

  const handleEdit = () => {
    // TODO: Implementacja edycji zespołu
    toast.info("Funkcja edycji będzie dostępna wkrótce");
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Czy na pewno chcesz usunąć ten zespół? Ta operacja jest nieodwracalna."
      )
    ) {
      try {
        await deleteTeam.mutateAsync(teamId);
        toast.success("Zespół został usunięty");
        router.push(`/competitions/${competitionId}/relay-teams`);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Błąd podczas usuwania zespołu"
        );
      }
    }
  };

  const handleBack = () => {
    router.push(`/competitions/${competitionId}/relay-teams`);
  };

  const handleFixMembers = async () => {
    if (
      confirm(
        "Czy na pewno chcesz naprawić członków zespołu? Zostanie zachowanych tylko pierwszych 6 członków."
      )
    ) {
      try {
        await fixMembers.mutateAsync(teamId);
        toast.success("Członkowie zespołu zostali naprawieni");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Błąd podczas naprawy członków"
        );
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie zespołu...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Błąd podczas ładowania zespołu</p>
            <Button variant="outline" className="mt-2" onClick={handleBack}>
              Wróć do listy zespołów
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
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wróć
              </Button>
            </div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {team.members?.length || 0}/6 członków
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              {team.club && (
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  {team.club}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Utworzony{" "}
                {format(new Date(team.createdAt), "dd MMM yyyy", {
                  locale: pl,
                })}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {user &&
              (user.role === UserRole.ADMIN ||
                user.role === UserRole.ORGANIZER ||
                user.role === UserRole.COACH ||
                user.id === team.createdById) && (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleDelete}
                    disabled={deleteTeam.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteTeam.isPending ? "Usuwanie..." : "Usuń"}
                  </Button>
                  {/* Tymczasowy przycisk do naprawy danych */}
                  {team && team.members && team.members.length > 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700"
                      onClick={handleFixMembers}
                      disabled={fixMembers.isPending}
                    >
                      🔧{" "}
                      {fixMembers.isPending
                        ? "Naprawiam..."
                        : `Napraw (${team.members.length}/6)`}
                    </Button>
                  )}
                </>
              )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members */}
          <div className="lg:col-span-2">
            <RelayTeamMembersManager
              key={`${team.id}-${team.members?.length || 0}`}
              team={team}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informacje o zespole</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nazwa:</span>
                  <span className="font-medium">{team.name}</span>
                </div>
                {team.club && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Klub:</span>
                    <span className="font-medium">{team.club}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Członkowie:</span>
                  <span className="font-medium">
                    {team.members?.length || 0}/6
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejestracje:</span>
                  <span className="font-medium">
                    {team.registrations?.length || 0}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Utworzony przez:</span>
                  <span className="font-medium">
                    {team.createdBy?.firstName} {team.createdBy?.lastName}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Registrations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rejestracje do konkurencji</CardTitle>
                  <RelayTeamRegistrationDialog
                    team={team}
                    trigger={
                      <Button size="sm">
                        <Trophy className="h-4 w-4 mr-2" />
                        Zarejestruj
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                {(team.registrations?.length || 0) > 0 ? (
                  <div className="space-y-3">
                    {team.registrations?.map((registration: any) => (
                      <div
                        key={registration.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-medium">
                          {registration.event.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {registration.event.gender} •{" "}
                          {registration.event.category}
                        </p>
                        {registration.seedTime && (
                          <p className="text-sm text-blue-600">
                            Czas zgłoszeniowy: {registration.seedTime}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Brak rejestracji do konkurencji
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
