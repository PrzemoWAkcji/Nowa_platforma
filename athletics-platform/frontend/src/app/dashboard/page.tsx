"use client";

import { CompetitionAdminPanel } from "@/components/admin/CompetitionAdminPanel";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Filter,
  MapPin,
  Medal,
  Plus,
  Search,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAthletes } from "@/hooks/useAthletes";
import { useCompetitions } from "@/hooks/useCompetitions";
import { useIsClient } from "@/hooks/useIsClient";
import { useAuthStore } from "@/store/authStore";
import { Competition, CompetitionStatus, UserRole } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function DashboardPage() {
  // Wszystkie hooks muszą być na górze
  const { isAuthenticated, user, initAuth } = useAuthStore();
  const router = useRouter();
  const isClient = useIsClient();
  const [showLoading, setShowLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pobierz dane - hooks zawsze muszą być wywoływane
  const {
    data: competitions,
    isLoading: competitionsLoading,
    error: competitionsError,
  } = useCompetitions(isClient); // Pobieraj tylko po stronie klienta
  const {
    data: athletes,
    isLoading: athletesLoading,
    error: athletesError,
  } = useAthletes(
    undefined,
    isClient // Pobieraj tylko po stronie klienta
  );

  // Wszystkie useMemo hooks muszą być na górze
  const userCompetitions = useMemo(() => {
    return user?.role === UserRole.ORGANIZER
      ? competitions?.filter((c) => c.createdById === user.id) || []
      : competitions || [];
  }, [competitions, user?.role, user?.id]);

  const filteredCompetitions = useMemo(() => {
    return (
      userCompetitions?.filter((competition) => {
        const matchesSearch =
          competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          competition.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || competition.status === statusFilter;
        return matchesSearch && matchesStatus;
      }) || []
    );
  }, [userCompetitions, searchTerm, statusFilter]);

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.DRAFT:
        return <Badge variant="secondary">Szkic</Badge>;
      case CompetitionStatus.PUBLISHED:
        return <Badge variant="outline">Opublikowane</Badge>;
      case CompetitionStatus.REGISTRATION_OPEN:
        return <Badge className="bg-green-500">Rejestracja otwarta</Badge>;
      case CompetitionStatus.REGISTRATION_CLOSED:
        return <Badge className="bg-orange-500">Rejestracja zamknięta</Badge>;
      case CompetitionStatus.ONGOING:
        return <Badge className="bg-blue-500">W trakcie</Badge>;
      case CompetitionStatus.COMPLETED:
        return <Badge className="bg-gray-500">Zakończone</Badge>;
      case CompetitionStatus.CANCELLED:
        return <Badge variant="destructive">Anulowane</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const dashboardTitle = useMemo(() => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return "Panel administratora";
      case UserRole.ORGANIZER:
        return "Panel organizatora";
      case UserRole.COACH:
        return "Panel trenera";
      case UserRole.ATHLETE:
        return "Panel zawodnika";
      default:
        return "Dashboard";
    }
  }, [user?.role]);

  const dashboardDescription = useMemo(() => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return "Zarządzanie całą platformą lekkoatletyczną";
      case UserRole.ORGANIZER:
        return "Zarządzanie Twoimi zawodami i wydarzeniami";
      case UserRole.COACH:
        return "Zarządzanie zawodnikami i ich rejestracje";
      case UserRole.ATHLETE:
        return "Twoje rejestracje i wyniki";
      default:
        return "Przegląd aktywności platformy lekkoatletycznej";
    }
  }, [user?.role]);

  // Initialize auth on component mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Sprawdź tylko po stronie klienta
    if (!isClient) return;

    // Daj więcej czasu na rehydrację store po logowaniu
    const timer = setTimeout(() => {
      if (!isAuthenticated && !user) {
        router.push("/");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isClient, isAuthenticated, user, router]);

  // Wyłączam checkAuth żeby nie powodował wylogowania
  // useEffect(() => {
  //   if (isAuthenticated && user && token) {
  //     //     const timer = setTimeout(() => {
  //       checkAuth();
  //     }, 5000);
  //
  //     return () => clearTimeout(timer);
  //   }
  // }, [isAuthenticated, user, token, checkAuth]);

  const isLoading = competitionsLoading || athletesLoading;

  // Timeout dla ładowania - jeśli trwa zbyt długo, pokaż dashboard z błędem
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 sekund timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isClient) return;

    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 500); // Zmniejszono z 2000ms do 500ms

    return () => clearTimeout(timer);
  }, [isClient]);

  // Zmienne już zdefiniowane wyżej

  // Nie renderuj nic podczas SSR
  if (!isClient) {
    return null;
  }

  // Pokaż loading jeśli ładujemy lub nie ma użytkownika
  if (showLoading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {showLoading
              ? "Ładowanie aplikacji..."
              : "Sprawdzanie uwierzytelnienia..."}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Store: {isAuthenticated ? "✅" : "❌"} | User: {user ? "✅" : "❌"}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !loadingTimeout) {
    // Dla adminów bez lewego menu
    if (user?.role === UserRole.ADMIN) {
      return (
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Jeśli timeout lub błąd, pokaż dashboard z informacją o problemie
  if (loadingTimeout || competitionsError || athletesError) {
    console.warn("Dashboard loading timeout or error:", {
      loadingTimeout,
      competitionsError,
      athletesError,
    });
  }

  // Duplikaty usunięte - hooks już zdefiniowane wyżej

  // Jeśli wybrano konkretne zawody do zarządzania, pokaż panel administratora
  if (selectedCompetition) {
    return (
      <DashboardLayout>
        <CompetitionAdminPanel
          competition={selectedCompetition}
          onBack={() => setSelectedCompetition(null)}
        />
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
              {dashboardTitle}
            </h1>
            <p className="text-gray-600">{dashboardDescription}</p>
          </div>
          {(user?.role === UserRole.ADMIN ||
            user?.role === UserRole.ORGANIZER) && (
            <Link href="/competitions/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nowe zawody
              </Button>
            </Link>
          )}
        </div>

        {/* Filters - tylko dla adminów i organizatorów */}
        {(user?.role === UserRole.ADMIN ||
          user?.role === UserRole.ORGANIZER) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Szukaj zawodów..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie statusy</SelectItem>
                      <SelectItem value={CompetitionStatus.DRAFT}>
                        Szkice
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.PUBLISHED}>
                        Opublikowane
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.REGISTRATION_OPEN}>
                        Rejestracja otwarta
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.REGISTRATION_CLOSED}>
                        Rejestracja zamknięta
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.ONGOING}>
                        W trakcie
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.COMPLETED}>
                        Zakończone
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.CANCELLED}>
                        Anulowane
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === UserRole.ORGANIZER
                  ? "Twoje zawody"
                  : "Wszystkie zawody"}
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userCompetitions?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aktywne zawody
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userCompetitions?.filter(
                  (c) =>
                    c.status === CompetitionStatus.REGISTRATION_OPEN ||
                    c.status === CompetitionStatus.ONGOING
                ).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zawodnicy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{athletes?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejestracje</CardTitle>
              <Medal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userCompetitions?.reduce(
                  (sum, comp) => sum + (comp._count?.registrations || 0),
                  0
                ) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === UserRole.ORGANIZER
                ? "Twoje zawody"
                : "Wszystkie zawody"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCompetitions && filteredCompetitions.length > 0 ? (
              <div className="space-y-4">
                {filteredCompetitions.map((competition) => (
                  <Card
                    key={competition.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {competition.name}
                            </h3>
                            {getStatusBadge(competition.status)}
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(
                                new Date(competition.startDate),
                                "dd MMM yyyy",
                                { locale: pl }
                              )}
                              {competition.endDate &&
                                competition.startDate !==
                                  competition.endDate && (
                                  <span>
                                    {" "}
                                    -{" "}
                                    {format(
                                      new Date(competition.endDate),
                                      "dd MMM yyyy",
                                      { locale: pl }
                                    )}
                                  </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {competition.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {competition._count?.registrations || 0}{" "}
                              rejestracji
                            </div>
                          </div>

                          {competition.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {competition.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {(user?.role === UserRole.ADMIN ||
                            user?.role === UserRole.ORGANIZER) && (
                            <Button
                              onClick={() =>
                                setSelectedCompetition(competition)
                              }
                              size="sm"
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Zarządzaj
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Brak zawodów
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Nie znaleziono zawodów spełniających kryteria wyszukiwania."
                    : "Nie masz jeszcze żadnych zawodów."}
                </p>
                {!searchTerm &&
                  statusFilter === "all" &&
                  (user?.role === UserRole.ADMIN ||
                    user?.role === UserRole.ORGANIZER) && (
                    <Link href="/competitions/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Utwórz pierwsze zawody
                      </Button>
                    </Link>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
