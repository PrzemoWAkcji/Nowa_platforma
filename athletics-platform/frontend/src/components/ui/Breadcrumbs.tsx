"use client";

import { useCompetition } from "@/hooks/useCompetitions";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Mapowanie ścieżek na czytelne nazwy
const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  competitions: "Zawody",
  athletes: "Zawodnicy",
  "my-athletes": "Moi zawodnicy",
  registrations: "Rejestracje",
  results: "Wyniki",
  events: "Konkurencje",
  rankings: "Rankingi",
  "combined-events": "Wieloboje",
  records: "Rekordy",
  users: "Użytkownicy",
  admin: "Administracja",
  settings: "Ustawienia",
  participants: "Uczestnicy",
  "minute-program": "Program minutowy",
  startlists: "Listy startowe",
  "relay-teams": "Sztafety",
  create: "Utwórz",
  edit: "Edytuj",
  import: "Import",
  visibility: "Widoczność",
};

// Mapowanie ścieżek na ikony
const pathIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: Home,
};

function generateBreadcrumbsFromPath(
  pathname: string,
  competitionName?: string
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Zawsze dodaj Dashboard jako pierwszy element
  breadcrumbs.push({
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  });

  // Jeśli jesteśmy na dashboard, zwróć tylko dashboard
  if (pathname === "/dashboard") {
    return breadcrumbs;
  }

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Pomiń UUID-like segmenty (prawdopodobnie ID)
    if (
      segment.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      continue;
    }

    // Pomiń numeryczne ID
    if (/^\d+$/.test(segment)) {
      continue;
    }

    // Sprawdź czy to ID zawodów (segment po "competitions")
    if (i > 0 && segments[i - 1] === "competitions" && segment.length > 10) {
      // To prawdopodobnie ID zawodów - użyj nazwy zawodów jeśli jest dostępna
      if (competitionName) {
        breadcrumbs.push({
          label: competitionName,
          href: currentPath,
        });
      }
      continue;
    }

    const label =
      pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const icon = pathIcons[segment];

    breadcrumbs.push({
      label,
      href: currentPath,
      icon,
    });
  }

  return breadcrumbs;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Sprawdź czy ścieżka zawiera ID zawodów
  const competitionId = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const competitionsIndex = segments.indexOf("competitions");
    if (competitionsIndex !== -1 && segments[competitionsIndex + 1]) {
      return segments[competitionsIndex + 1];
    }
    return null;
  }, [pathname]);

  // Pobierz dane zawodów jeśli mamy ID
  const { data: competition } = useCompetition(competitionId || "");

  const breadcrumbItems = useMemo(() => {
    return items || generateBreadcrumbsFromPath(pathname, competition?.name);
  }, [items, pathname, competition?.name]);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-gray-500 mb-4 ${className}`}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            )}

            {isLast ? (
              <span className="flex items-center font-medium text-gray-900">
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
