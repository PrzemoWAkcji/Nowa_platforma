"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { Bell, ChevronRight, Home, LogOut, Search, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Mapowanie ścieżek na czytelne nazwy
const getPageTitle = (pathname: string): string => {
  const pathLabels: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/competitions": "Zawody",
    "/athletes": "Zawodnicy",
    "/my-athletes": "Moi zawodnicy",
    "/registrations": "Rejestracje",
    "/results": "Wyniki",
    "/events": "Konkurencje",
    "/rankings": "Rankingi",
    "/combined-events": "Wieloboje",
    "/records": "Rekordy",
    "/users": "Użytkownicy",
    "/admin": "Administracja",
    "/settings": "Ustawienia",
    "/participants": "Uczestnicy",
    "/minute-program": "Program minutowy",
  };

  // Sprawdź dokładne dopasowanie
  if (pathLabels[pathname]) {
    return pathLabels[pathname];
  }

  // Sprawdź wzorce dla dynamicznych ścieżek
  if (pathname.includes("/competitions/") && pathname.includes("/startlists")) {
    return "Listy startowe";
  }
  if (
    pathname.includes("/competitions/") &&
    pathname.includes("/minute-program")
  ) {
    return "Program minutowy";
  }
  if (pathname.includes("/competitions/") && pathname.includes("/settings")) {
    return "Ustawienia zawodów";
  }
  if (
    pathname.includes("/competitions/") &&
    pathname.includes("/relay-teams")
  ) {
    return "Sztafety";
  }
  if (pathname.includes("/competitions/") && pathname.endsWith("/create")) {
    return "Nowe zawody";
  }
  if (pathname.includes("/competitions/") && !pathname.includes("/")) {
    return "Szczegóły zawodów";
  }
  if (pathname.includes("/athletes/create")) {
    return "Nowy zawodnik";
  }
  if (pathname.includes("/registrations/create")) {
    return "Nowa rejestracja";
  }
  if (pathname.includes("/results/create")) {
    return "Nowy wynik";
  }
  if (pathname.includes("/results/import")) {
    return "Import wyników";
  }

  // Fallback - użyj ostatniego segmentu ścieżki
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
};

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const currentPageTitle = getPageTitle(pathname);

  const handleLogout = () => {
    logout();
    // Wyczyść też localStorage jako backup
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    router.push("/login");
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-6">
      {/* Logo */}
      <div className="flex items-center">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 hover:opacity-80"
        >
          <Trophy className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">
            Athletics Platform
          </span>
        </Link>
      </div>

      {/* Current Page Indicator */}
      <div className="flex items-center ml-6 text-sm text-gray-500">
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-medium text-gray-700">{currentPageTitle}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Szukaj zawodów, zawodników..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Przycisk do strony głównej */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-gray-600 hover:text-gray-900"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>

        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User info and logout */}
        <div className="flex items-center space-x-3">
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
