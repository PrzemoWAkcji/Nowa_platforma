"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRelayTeamEventRegistrations } from "@/hooks/useRelayTeams";
import { Event } from "@/types";
import { Clock, Edit, Settings, Trophy, User, Users } from "lucide-react";
import { CreateRelayTeamDialog } from "./CreateRelayTeamDialog";
import { RelayStartListExport } from "./RelayStartListExport";
import { RelayTeamMembersManager } from "./RelayTeamMembersManager";
import { RelayTeamRegistrationDialog } from "./RelayTeamRegistrationDialog";

interface RelayEventStartListProps {
  event: Event;
}

export function RelayEventStartList({ event }: RelayEventStartListProps) {
  // const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null); // Obecnie nieużywane
  const {
    data: registrations,
    isLoading,
    error,
  } = useRelayTeamEventRegistrations(event.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Lista startowa - {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Ładowanie...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Lista startowa - {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Błąd podczas ładowania listy startowej</p>
        </CardContent>
      </Card>
    );
  }

  const sortedRegistrations =
    registrations?.sort((a: any, b: any) => {
      // Sortuj według czasu zgłoszeniowego (najlepszy na końcu)
      if (a.seedTime && b.seedTime) {
        return a.seedTime.localeCompare(b.seedTime);
      }
      if (a.seedTime && !b.seedTime) return -1;
      if (!a.seedTime && b.seedTime) return 1;
      return (a.team?.name || "").localeCompare(b.team?.name || "");
    }) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Lista startowa - {event.name}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {sortedRegistrations.length} zespołów
            </Badge>
            <CreateRelayTeamDialog
              competitionId={event.competitionId}
              trigger={
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Dodaj zespół
                </Button>
              }
            />
            <RelayStartListExport event={event} />
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {event.gender} • {event.category}
        </p>
      </CardHeader>
      <CardContent>
        {sortedRegistrations.length > 0 ? (
          <div className="space-y-4">
            {sortedRegistrations.map((registration: any, index: any) => (
              <div key={registration.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {registration.team?.name || "Nieznany zespół"}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {registration.team?.club && (
                            <p className="text-sm text-gray-600">
                              {registration.team.club}
                            </p>
                          )}
                          {registration.team && (
                            <Badge
                              variant={
                                (registration.team.members?.filter(
                                  (m: any) => !m.isReserve
                                )?.length || 0) >= 4
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {registration.team.members?.filter(
                                (m: any) => !m.isReserve
                              )?.length || 0}
                              /4 podstawowych
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {registration.seedTime && (
                      <div className="flex items-center text-blue-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-mono font-semibold">
                          {registration.seedTime}
                        </span>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Zarządzaj składem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Zarządzanie składem - {registration.team?.name}
                            </DialogTitle>
                            <DialogDescription>
                              Zarządzaj składem zespołu sztafetowego. Możesz
                              dodawać i usuwać członków zespołu.
                            </DialogDescription>
                          </DialogHeader>
                          {registration.team && (
                            <RelayTeamMembersManager team={registration.team} />
                          )}
                        </DialogContent>
                      </Dialog>

                      {registration.team && (
                        <RelayTeamRegistrationDialog
                          team={registration.team}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edytuj rejestrację
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Skład zespołu */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Skład zespołu:
                  </h4>

                  {/* Podstawowy skład */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(registration.team?.members || [])
                      .filter((member: any) => !member.isReserve)
                      .sort((a: any, b: any) => a.position - b.position)
                      .map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <Badge
                            variant="secondary"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          >
                            {member.position}
                          </Badge>
                          <span>
                            {member.athlete.firstName} {member.athlete.lastName}
                          </span>
                          {member.athlete.club && (
                            <span className="text-gray-500">
                              ({member.athlete.club})
                            </span>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Rezerwowi */}
                  {(registration.team?.members || []).some(
                    (member: any) => member.isReserve
                  ) && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Rezerwowi:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(registration.team?.members || [])
                          .filter((member: any) => member.isReserve)
                          .sort((a: any, b: any) => a.position - b.position)
                          .map((member: any) => (
                            <div
                              key={member.id}
                              className="flex items-center space-x-2 text-sm text-gray-600"
                            >
                              <Badge
                                variant="outline"
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                              >
                                {member.position}
                              </Badge>
                              <span>
                                {member.athlete.firstName}{" "}
                                {member.athlete.lastName}
                              </span>
                              {member.athlete.club && (
                                <span className="text-gray-400">
                                  ({member.athlete.club})
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak zarejestrowanych zespołów</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
