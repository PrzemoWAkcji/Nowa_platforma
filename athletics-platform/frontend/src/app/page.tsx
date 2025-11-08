"use client";

import { LoginModal } from "@/components/auth/login-modal";
import { CompetitionDetailsModal } from "@/components/competition-details-modal";
import { DemoModal } from "@/components/demo-modal";
import { RegistrationModal } from "@/components/registration-modal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import { Competition as APICompetition } from "@/types";
import { competitionsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle,
  Eye,
  Globe,
  LogOut,
  MapPin,
  Medal,
  Menu,
  Play,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// Types
type CompetitionCategory = "Mistrzostwa" | "Memoriał" | "Młodzież" | "Bieg";
type CompetitionStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  club: string;
  events: string[];
}

interface Competition {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: CompetitionStatus;
  registrations: number;
  maxRegistrations: number;
  category: CompetitionCategory;
  featured: boolean;
  liveResults: boolean;
}

// Funkcja do mapowania API competition na lokalny typ
const mapApiCompetitionToLocal = (apiComp: APICompetition): Competition => {
  // Określ kategorię na podstawie nazwy zawodów
  let category: CompetitionCategory = "Mistrzostwa";
  if (apiComp.name.toLowerCase().includes("memoriał")) {
    category = "Memoriał";
  } else if (
    apiComp.name.toLowerCase().includes("młodzież") ||
    apiComp.name.toLowerCase().includes("junior")
  ) {
    category = "Młodzież";
  } else if (apiComp.name.toLowerCase().includes("bieg")) {
    category = "Bieg";
  }

  return {
    id: apiComp.id,
    name: apiComp.name,
    location: apiComp.location,
    startDate: apiComp.startDate,
    endDate: apiComp.endDate,
    status: apiComp.status as CompetitionStatus,
    registrations: apiComp._count?.registrations || 0,
    maxRegistrations: apiComp.maxParticipants || 500, // domyślna wartość
    category,
    featured:
      apiComp.status === "REGISTRATION_OPEN" || apiComp.status === "ONGOING", // zawody otwarte lub w trakcie są wyróżnione
    liveResults: apiComp.liveResultsEnabled || false,
  };
};

const statusColors: Record<CompetitionStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-blue-100 text-blue-800",
  REGISTRATION_OPEN: "bg-green-100 text-green-800",
  REGISTRATION_CLOSED: "bg-yellow-100 text-yellow-800",
  ONGOING: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<CompetitionStatus, string> = {
  DRAFT: "Szkic",
  PUBLISHED: "Opublikowane",
  REGISTRATION_OPEN: "Rejestracja otwarta",
  REGISTRATION_CLOSED: "Rejestracja zamknięta",
  ONGOING: "W trakcie",
  COMPLETED: "Zakończone",
  CANCELLED: "Anulowane",
};

const categoryColors: Record<CompetitionCategory, string> = {
  Mistrzostwa: "bg-gradient-to-r from-yellow-400 to-orange-500",
  Memoriał: "bg-gradient-to-r from-purple-500 to-pink-500",
  Młodzież: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Bieg: "bg-gradient-to-r from-green-500 to-teal-500",
};

// Progress Bar Component
const ProgressBar: React.FC<{
  percentage: number;
  className?: string;
}> = ({ percentage, className = "" }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty(
        "--progress-width",
        `${percentage}%`
      );
    }
  }, [percentage]);

  return <div ref={progressRef} className={`progress-bar ${className}`} />;
};

export default function Home() {
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, login, logout, initAuth } = useAuthStore();
  
  const { data: apiCompetitions, isLoading: competitionsLoading, error: competitionsError } = useQuery({
    queryKey: ["competitions-public"],
    queryFn: async () => {
      const response = await competitionsApi.getPublic();
      return response.data;
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal states
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [registrationCompetition, setRegistrationCompetition] =
    useState<Competition | null>(null);

  // Initialize auth on component mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Redirect to dashboard after login
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const competitions = apiCompetitions
    ? apiCompetitions.map(mapApiCompetitionToLocal)
    : [];

  // Filtrowanie zawodów
  const filteredCompetitions = competitions.filter((competition) => {
    const matchesSearch =
      competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || competition.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || competition.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const featuredCompetitions = filteredCompetitions.filter(
    (comp) => comp.featured
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Modal handlers
  const handleViewDetails = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsDetailsModalOpen(true);
  };

  const handleRegister = (competition: Competition) => {
    setRegistrationCompetition(competition);
    setIsRegistrationModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const handleRegisterFromModal = (competitionId: string) => {
    const competition = competitions.find((comp) => comp.id === competitionId);
    if (competition) {
      handleRegister(competition);
    }
  };

  const handleRegistrationSubmit = (data: RegistrationData) => {
    // Tutaj można dodać logikę wysyłania danych do API
    showToast({
      type: "success",
      title: "Rejestracja zakończona pomyślnie!",
      message: `Zostałeś zapisany na zawody "${registrationCompetition?.name}"`,
    });
  };

  const scrollToCompetitions = () => {
    const element = document.getElementById("competitions");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast({
      type: "info",
      title: "Wylogowano",
      message: "Do zobaczenia!",
    });
  };

  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      await login(email, password);

      showToast({
        type: "success",
        title: "Zalogowano pomyślnie!",
        message: `Witaj z powrotem!`,
      });

      // Wait for state update and redirect
      setTimeout(() => {
        const stateAfterDelay = useAuthStore.getState();
        if (stateAfterDelay.isAuthenticated && stateAfterDelay.user) {
          router.push("/dashboard");
        }
      }, 200);
    } catch (error) {
      showToast({
        type: "error",
        title: "Błąd logowania",
        message:
          error instanceof Error ? error.message : "Nie udało się zalogować",
      });
    }
  };

  // Obsługa stanów ładowania i błędów
  if (competitionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie zawodów...</p>
          <p className="mt-2 text-sm text-gray-500">
            Jeśli to trwa długo,{" "}
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 underline"
            >
              odśwież stronę
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (competitionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Błąd podczas ładowania zawodów: {(competitionsError as Error).message}
          </p>
          <Button onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Debug Panel */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
        <h3 className="font-bold mb-2">🔍 Debug Auth State</h3>
        <p>Authenticated: {isAuthenticated ? "✅" : "❌"}</p>
        <p>User: {user?.email || "None"}</p>
        <p>Role: {user?.role || "None"}</p>
        <button
          onClick={() => {
            const state = useAuthStore.getState();
            console.log("Current state:", state);
          }}
          className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
        >
          Log State
        </button>
      </div>

      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-white" />
                <span className="text-xl font-bold text-white">
                  Athletics Platform
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={scrollToCompetitions}
                className="text-white/90 hover:text-white transition-colors"
              >
                Zawody
              </button>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="text-white/90 hover:text-white transition-colors"
              >
                Demo
              </button>
              <a
                href="#"
                className="text-white/90 hover:text-white transition-colors"
              >
                O nas
              </a>
              <a
                href="#"
                className="text-white/90 hover:text-white transition-colors"
              >
                Kontakt
              </a>
            </div>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                // Logged in state
                <div className="flex items-center space-x-3">
                  <div className="text-white text-sm">
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <span className="font-medium">{user.firstName}</span>
                    </div>
                    <div className="text-white/70 text-xs">{user.role}</div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj
                  </Button>
                </div>
              ) : (
                // Not logged in state
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Zaloguj się
                  </Button>
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Dołącz
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20">
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => {
                  scrollToCompetitions();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-800 hover:text-blue-600 transition-colors py-2"
              >
                Zawody
              </button>
              <button
                onClick={() => {
                  setIsDemoModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-800 hover:text-blue-600 transition-colors py-2"
              >
                Demo
              </button>
              <a
                href="#"
                className="block text-gray-800 hover:text-blue-600 transition-colors py-2"
              >
                O nas
              </a>
              <a
                href="#"
                className="block text-gray-800 hover:text-blue-600 transition-colors py-2"
              >
                Kontakt
              </a>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated && user ? (
                  // Logged in mobile state
                  <>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center text-gray-800">
                        <span className="mr-2 text-lg">👤</span>
                        <div>
                          <div className="font-medium">{user.firstName}</div>
                          <div className="text-sm text-gray-600">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Wyloguj się
                    </Button>
                  </>
                ) : (
                  // Not logged in mobile state
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Zaloguj się
                    </Button>
                    <Button
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Dołącz do nas
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-pattern-dots"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-white/90 text-sm font-medium">
                  Platforma Lekkoatletyczna
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {isAuthenticated && user ? (
                <>
                  Witaj, {user.firstName}!
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    👤 {user.role}
                  </span>
                </>
              ) : (
                <>
                  Twoja Pasja
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    Nasza Technologia
                  </span>
                </>
              )}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isAuthenticated && user
                ? `Zarządzaj swoimi zawodami, śledź wyniki i rozwijaj swoją karierę sportową jako ${user.role}.`
                : "Nowoczesna platforma do zarządzania zawodami lekkoatletycznymi. Odkryj nadchodzące wydarzenia, śledź wyniki na żywo i bądź częścią społeczności."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={scrollToCompetitions}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Search className="mr-2 h-5 w-5" />
                Przeglądaj Zawody
              </Button>
              {isAuthenticated && user ? (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Zobacz Demo
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
                >
                  <User className="mr-2 h-5 w-5" />
                  Zaloguj się
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <Trophy className="h-8 w-8 text-yellow-300/60" />
        </div>
        <div className="absolute top-32 right-20 animate-pulse">
          <Medal className="h-6 w-6 text-orange-300/60" />
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-1000">
          <Target className="h-7 w-7 text-green-300/60" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={150} suffix="+" />
              </div>
              <div className="text-gray-600">Zawodów rocznie</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={5000} suffix="+" />
              </div>
              <div className="text-gray-600">Aktywnych zawodników</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="text-gray-600">Zadowolenia użytkowników</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Dostępność systemu</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Competitions */}
      {featuredCompetitions.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Wyróżnione Zawody
                </h2>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Najważniejsze wydarzenia lekkoatletyczne, które nie mogą Cię
                ominąć
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredCompetitions.map((competition) => (
                <Card
                  key={competition.id}
                  className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm"
                >
                  <div className="relative">
                    <div
                      className={`h-48 ${categoryColors[competition.category]} flex items-center justify-center relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 text-center text-white">
                        <Trophy className="h-12 w-12 mx-auto mb-2" />
                        <div className="text-sm font-medium opacity-90">
                          {competition.category}
                        </div>
                      </div>
                      {competition.liveResults && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {competition.name}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {competition.location}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {formatDate(competition.startDate)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={`${statusColors[competition.status]} border-0`}
                        >
                          {statusLabels[competition.status]}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>
                            {competition.registrations}/
                            {competition.maxRegistrations} uczestników
                          </span>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <ProgressBar
                            percentage={
                              (competition.registrations /
                                competition.maxRegistrations) *
                              100
                            }
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetails(competition)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Zobacz szczegóły
                        </Button>
                        {competition.status === "REGISTRATION_OPEN" && (
                          <Button
                            onClick={() => handleRegister(competition)}
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Zapisz się
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section id="competitions" className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Wszystkie Zawody
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Znajdź zawody, które Cię interesują i weź udział w emocjonujących
              rywalizacjach
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Szukaj zawodów lub lokalizacji..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                  <SelectValue placeholder="Status zawodów" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value="REGISTRATION_OPEN">
                    Rejestracja otwarta
                  </SelectItem>
                  <SelectItem value="PUBLISHED">Opublikowane</SelectItem>
                  <SelectItem value="ONGOING">W trakcie</SelectItem>
                  <SelectItem value="COMPLETED">Zakończone</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                  <SelectValue placeholder="Kategoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie kategorie</SelectItem>
                  <SelectItem value="Mistrzostwa">Mistrzostwa</SelectItem>
                  <SelectItem value="Memoriał">Memoriały</SelectItem>
                  <SelectItem value="Młodzież">Młodzież</SelectItem>
                  <SelectItem value="Bieg">Biegi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Competition Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition) => (
              <Card
                key={competition.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <div className="relative">
                  <div
                    className={`h-32 ${categoryColors[competition.category]} flex items-center justify-center relative`}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-white text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-1" />
                      <div className="text-xs font-medium">
                        {competition.category}
                      </div>
                    </div>
                    {competition.liveResults && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                        LIVE
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {competition.name}
                      </h3>
                      <Badge
                        className={`${statusColors[competition.status]} border-0 text-xs`}
                      >
                        {statusLabels[competition.status]}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{competition.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span>{formatDate(competition.startDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span>
                          {competition.registrations}/
                          {competition.maxRegistrations}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                      <ProgressBar
                        percentage={
                          (competition.registrations /
                            competition.maxRegistrations) *
                          100
                        }
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                      />
                    </div>

                    <Button
                      onClick={() => handleViewDetails(competition)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-sm"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Zobacz szczegóły
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {filteredCompetitions.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Brak wyników
                </h3>
                <p className="text-gray-600">
                  Nie znaleziono zawodów spełniających wybrane kryteria.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-pattern-dots"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Gotowy na następny poziom?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy zawodników, którzy już korzystają z naszej
            platformy. Zarządzaj swoimi startami, śledź wyniki i rozwijaj swoją
            karierę sportową.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated && user ? (
              <>
                <Button
                  size="lg"
                  onClick={scrollToCompetitions}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Moje Zawody
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Dowiedz się więcej
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full"
                >
                  <User className="mr-2 h-5 w-5" />
                  Zaloguj się
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Dowiedz się więcej
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Debug Login Test */}
      <section className="py-4 bg-yellow-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">
              🔧 Debug Test Logowania
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                onClick={async () => {
                  console.log("🚀 DEBUG: Rozpoczynam test logowania...");
                  console.log("🔍 DEBUG: Aktualny stan przed logowaniem:", {
                    isAuthenticated,
                    user: user?.email,
                  });

                  try {
                    await handleLogin({
                      email: "organizer@athletics.pl",
                      password: "password123",
                    });

                    // Sprawdź stan po krótkim opóźnieniu
                    setTimeout(() => {
                      const currentState = useAuthStore.getState();
                      console.log("🔍 DEBUG: Stan po handleLogin:", {
                        isAuthenticated: currentState.isAuthenticated,
                        user: currentState.user?.email,
                      });
                    }, 500);
                  } catch (error) {
                    console.error("🔍 DEBUG: Błąd w handleLogin:", error);
                  }
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                🔧 DEBUG Login Test
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Test Accounts Info */}
      <section className="py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">🧪 Konta Testowe</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <div className="text-red-300 font-medium mb-2">
                  👑 Administrator
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  <div>admin@athletics.pl</div>
                  <div>password123</div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleLogin({
                      email: "admin@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  Zaloguj jako Admin
                </Button>
              </div>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="text-blue-300 font-medium mb-2">🏃‍♂️ Trener</div>
                <div className="text-sm text-gray-300 mb-3">
                  <div>coach@athletics.pl</div>
                  <div>password123</div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleLogin({
                      email: "coach@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  Zaloguj jako Trener
                </Button>
              </div>
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="text-green-300 font-medium mb-2">
                  🏆 Zawodnik
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  <div>athlete@athletics.pl</div>
                  <div>password123</div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleLogin({
                      email: "athlete@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  Zaloguj jako Zawodnik
                </Button>
              </div>
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <div className="text-purple-300 font-medium mb-2">
                  📋 Organizator
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  <div>organizer@athletics.pl</div>
                  <div>password123</div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleLogin({
                      email: "organizer@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  Zaloguj jako Organizator
                </Button>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Kliknij przycisk &quot;Zaloguj jako...&quot; aby natychmiast
              przetestować daną rolę, lub użyj tych danych w modalu logowania.
            </p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <CompetitionDetailsModal
        competition={selectedCompetition}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onRegister={handleRegisterFromModal}
      />

      <RegistrationModal
        competitionName={registrationCompetition?.name || ""}
        competitionId={registrationCompetition?.id || ""}
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSubmit={handleRegistrationSubmit}
      />

      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
