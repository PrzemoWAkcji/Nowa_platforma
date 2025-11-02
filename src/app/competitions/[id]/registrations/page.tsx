"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UpdateRecordsFromCsvModal } from "@/components/registrations/UpdateRecordsFromCsvModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { useCompetition } from "@/hooks/useCompetitions";
import {
  useConfirmRegistration,
  useDeleteAllRegistrationsByCompetition,
  useDeleteRegistration,
  useRegistrationsPublic,
  useRejectRegistration,
} from "@/hooks/useRegistrations";
import { useToast } from "@/hooks/useToast";
import { PaymentStatus, Registration, RegistrationStatus } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const statusColors = {
  [RegistrationStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [RegistrationStatus.CONFIRMED]: "bg-green-100 text-green-800",
  [RegistrationStatus.CANCELLED]: "bg-red-100 text-red-800",
  [RegistrationStatus.REJECTED]: "bg-red-100 text-red-800",
  [RegistrationStatus.WAITLIST]: "bg-blue-100 text-blue-800",
};

const statusLabels = {
  [RegistrationStatus.PENDING]: "Oczekująca",
  [RegistrationStatus.CONFIRMED]: "Potwierdzona",
  [RegistrationStatus.CANCELLED]: "Anulowana",
  [RegistrationStatus.REJECTED]: "Odrzucona",
  [RegistrationStatus.WAITLIST]: "Lista oczekujących",
};

const paymentStatusColors = {
  [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [PaymentStatus.PROCESSING]: "bg-blue-100 text-blue-800",
  [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800",
  [PaymentStatus.FAILED]: "bg-red-100 text-red-800",
  [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-800",
};

const paymentStatusLabels = {
  [PaymentStatus.PENDING]: "Oczekująca",
  [PaymentStatus.PROCESSING]: "Przetwarzana",
  [PaymentStatus.COMPLETED]: "Opłacona",
  [PaymentStatus.FAILED]: "Nieudana",
  [PaymentStatus.REFUNDED]: "Zwrócona",
};

function RegistrationCard({
  registration,
  onConfirm,
  onReject,
  onDelete,
}: {
  registration: Registration;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {registration.athlete?.firstName} {registration.athlete?.lastName}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {registration.athlete?.club || "Brak klubu"}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={statusColors[registration.status]}>
                {statusLabels[registration.status]}
              </Badge>
              <Badge
                className={paymentStatusColors[registration.paymentStatus]}
              >
                {paymentStatusLabels[registration.paymentStatus]}
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>
              {format(new Date(registration.createdAt), "dd MMM yyyy", {
                locale: pl,
              })}
            </div>
            {registration.bibNumber && (
              <div className="font-medium mt-1">
                Nr: {registration.bibNumber}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Data rejestracji:{" "}
            {format(new Date(registration.createdAt), "dd MMM yyyy HH:mm", {
              locale: pl,
            })}
          </div>
          {registration.athlete?.category && (
            <div className="text-sm text-gray-600">
              <strong>Kategoria:</strong> {registration.athlete.category}
            </div>
          )}
          {registration.paymentAmount && (
            <div className="text-sm text-gray-600">
              <strong>Opłata:</strong> {registration.paymentAmount} PLN
            </div>
          )}
          {registration.seedTime && (
            <div className="text-sm text-gray-600">
              <strong>Czas kwalifikacyjny:</strong> {registration.seedTime}
            </div>
          )}
          {registration.notes && (
            <div className="text-sm text-gray-600">
              <strong>Uwagi:</strong> {registration.notes}
            </div>
          )}
          {registration.events && registration.events.length > 0 && (
            <div className="text-sm text-gray-600">
              <strong>Konkurencje:</strong>{" "}
              {registration.events.map((e) => e.event?.name).join(", ")}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            {registration.status === RegistrationStatus.PENDING && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={() => onConfirm?.(registration.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Potwierdź
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => onReject?.(registration.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Odrzuć
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => onDelete?.(registration.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Usuń
            </Button>
          </div>
          <Link href={`/registrations/${registration.id}`}>
            <Button variant="outline" size="sm">
              Zobacz szczegóły
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompetitionRegistrationsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "ALL">(
    "ALL"
  );

  const { data: competition, isLoading: competitionLoading } =
    useCompetition(competitionId);
  const {
    data: registrations,
    isLoading,
    error,
  } = useRegistrationsPublic({ competitionId });
  const confirmRegistrationMutation = useConfirmRegistration();
  const rejectRegistrationMutation = useRejectRegistration();
  const deleteRegistrationMutation = useDeleteRegistration();
  const deleteAllRegistrationsMutation =
    useDeleteAllRegistrationsByCompetition();
  const { registrationMessages } = useToast();

  // Funkcje obsługi rejestracji
  const handleConfirmRegistration = async (registrationId: string) => {
    try {
      await confirmRegistrationMutation.mutateAsync(registrationId);
      registrationMessages.confirmed();
    } catch (error) {
      console.error("Error confirming registration:", error);
      registrationMessages.error("potwierdzania");
    }
  };

  const handleRejectRegistration = async (registrationId: string) => {
    if (confirm("Czy na pewno chcesz odrzucić tę rejestrację?")) {
      try {
        await rejectRegistrationMutation.mutateAsync(registrationId);
        registrationMessages.rejected();
      } catch (error) {
        console.error("Error rejecting registration:", error);
        registrationMessages.error("odrzucania");
      }
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (
      confirm(
        "Czy na pewno chcesz usunąć tę rejestrację? Ta operacja jest nieodwracalna."
      )
    ) {
      try {
        await deleteRegistrationMutation.mutateAsync(registrationId);
        registrationMessages.deleted();
      } catch (error) {
        console.error("Error deleting registration:", error);
        registrationMessages.error("usuwania");
      }
    }
  };

  const handleDeleteAllRegistrations = async () => {
    if (
      confirm(
        `Czy na pewno chcesz usunąć WSZYSTKIE ${Array.isArray(registrations) ? registrations.length : 0} rejestracji? Ta operacja jest nieodwracalna i pozwoli na usunięcie zawodów.`
      )
    ) {
      try {
        const result =
          await deleteAllRegistrationsMutation.mutateAsync(competitionId);
        alert(
          `Usunięto ${result.deletedCount} rejestracji. Teraz możesz usunąć zawody.`
        );
      } catch (error) {
        console.error("Error deleting all registrations:", error);
        alert("Wystąpił błąd podczas usuwania rejestracji.");
      }
    }
  };

  const filteredRegistrations = Array.isArray(registrations)
    ? registrations.filter((registration) => {
        const matchesSearch =
          searchTerm === "" ||
          `${registration.athlete?.firstName} ${registration.athlete?.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          registration.athlete?.club
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || registration.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  if (isLoading || competitionLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie rejestracji...</p>
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
            <p className="text-red-600">Błąd podczas ładowania rejestracji</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Spróbuj ponownie
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rejestracje - {competition?.name}
            </h1>
            <p className="text-gray-600">
              Zarządzaj rejestracjami na zawody{" "}
              {competition?.location && `w ${competition.location}`}
            </p>
            {competition?.startDate && (
              <p className="text-sm text-gray-500 mt-1">
                Data zawodów:{" "}
                {format(new Date(competition.startDate), "dd MMMM yyyy", {
                  locale: pl,
                })}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Link href={`/competitions/${competitionId}`}>
              <Button variant="outline">Powrót do zawodów</Button>
            </Link>
            <UpdateRecordsFromCsvModal competitionId={competitionId} />
            {Array.isArray(registrations) && registrations.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteAllRegistrations}
                disabled={deleteAllRegistrationsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteAllRegistrationsMutation.isPending
                  ? "Usuwanie..."
                  : `Usuń wszystkie (${registrations.length})`}
              </Button>
            )}
            <Link href={`/registrations/create?competitionId=${competitionId}`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nowa rejestracja
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Szukaj po imieniu, nazwisku lub klubie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <RefreshButton />
            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("ALL")}
            >
              Wszystkie
            </Button>
            {Object.entries(statusLabels).map(([status, label]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as RegistrationStatus)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(registrations) ? registrations.length : 0}
              </div>
              <p className="text-sm text-gray-600">Wszystkich rejestracji</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {Array.isArray(registrations)
                  ? registrations.filter(
                      (r) => r.status === RegistrationStatus.PENDING
                    ).length
                  : 0}
              </div>
              <p className="text-sm text-gray-600">Oczekujących</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(registrations)
                  ? registrations.filter(
                      (r) => r.status === RegistrationStatus.CONFIRMED
                    ).length
                  : 0}
              </div>
              <p className="text-sm text-gray-600">Potwierdzonych</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {Array.isArray(registrations)
                  ? registrations.filter(
                      (r) => r.status === RegistrationStatus.CANCELLED
                    ).length
                  : 0}
              </div>
              <p className="text-sm text-gray-600">Anulowanych</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Array.isArray(registrations)
                  ? registrations.filter(
                      (r) => r.paymentStatus === PaymentStatus.COMPLETED
                    ).length
                  : 0}
              </div>
              <p className="text-sm text-gray-600">Opłaconych</p>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Grid */}
        {filteredRegistrations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "ALL"
                  ? "Brak wyników"
                  : "Brak rejestracji"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "ALL"
                  ? "Spróbuj zmienić kryteria wyszukiwania."
                  : "Nie ma jeszcze żadnych rejestracji na te zawody."}
              </p>
              {!searchTerm && statusFilter === "ALL" && (
                <Link
                  href={`/registrations/create?competitionId=${competitionId}`}
                >
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Utwórz pierwszą rejestrację
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onConfirm={handleConfirmRegistration}
                onReject={handleRejectRegistration}
                onDelete={handleDeleteRegistration}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
