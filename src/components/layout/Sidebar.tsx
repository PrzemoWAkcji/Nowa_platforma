"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import {
  Database,
  Home,
  LogOut,
  Plus,
  Search,
  Settings,
  Shield,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const getNavigationSections = (userRole?: UserRole) => {
  const sections = [];

  // ZAWODY - uproszczone dla wszystkich ról
  if (userRole === UserRole.ADMIN) {
    sections.push({
      title: "ZAWODY",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Wszystkie zawody", href: "/competitions", icon: Search },
      ],
    });
  } else if (userRole === UserRole.ORGANIZER) {
    sections.push({
      title: "ZAWODY",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Dodaj zawody", href: "/competitions/create", icon: Plus },
        { name: "Moje zawody", href: "/competitions", icon: Search },
      ],
    });
  } else if (userRole === UserRole.COACH) {
    sections.push({
      title: "ZAWODY",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Przeglądaj zawody", href: "/competitions", icon: Search },
      ],
    });
  } else if (userRole === UserRole.ATHLETE) {
    sections.push({
      title: "ZAWODY",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Przeglądaj zawody", href: "/competitions", icon: Search },
      ],
    });
  }

  // BAZA - różne dla różnych ról
  if (userRole === UserRole.ADMIN) {
    sections.push({
      title: "BAZA",
      items: [
        { name: "Zawodnicy", href: "/athletes", icon: Users },
        { name: "Dodaj zawodnika", href: "/athletes/create", icon: UserPlus },
        { name: "Rekordy", href: "/records", icon: Database },
        { name: "Użytkownicy", href: "/users", icon: Shield },
      ],
    });
  } else if (userRole === UserRole.COACH) {
    sections.push({
      title: "BAZA",
      items: [
        { name: "Moi zawodnicy", href: "/my-athletes", icon: Users },
        { name: "Dodaj zawodnika", href: "/athletes/create", icon: UserPlus },
        { name: "Wszyscy zawodnicy", href: "/athletes", icon: Search },
      ],
    });
  } else if (userRole === UserRole.ORGANIZER) {
    sections.push({
      title: "BAZA",
      items: [
        { name: "Zawodnicy", href: "/athletes", icon: Users },
        { name: "Rekordy", href: "/records", icon: Database },
      ],
    });
  } else if (userRole === UserRole.ATHLETE) {
    sections.push({
      title: "BAZA",
      items: [
        { name: "Zawodnicy", href: "/athletes", icon: Users },
        { name: "Rekordy", href: "/records", icon: Database },
      ],
    });
  }

  return sections;
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const navigationSections = getNavigationSections(user?.role);

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 bg-white">
        <Trophy className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">
          Athletics Platform
        </span>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title}>
            {/* Section Title */}
            <div className="flex items-center mb-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings and Logout */}
      <div className="px-4 py-4 border-t border-gray-200 bg-white space-y-2">
        <Link
          href="/settings"
          className={cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            pathname === "/settings"
              ? "bg-blue-100 text-blue-900"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Settings
            className={cn(
              "mr-3 h-5 w-5 flex-shrink-0",
              pathname === "/settings"
                ? "text-blue-600"
                : "text-gray-400 group-hover:text-gray-600"
            )}
          />
          Ustawienia
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Wyloguj
        </Button>
      </div>
    </div>
  );
}
