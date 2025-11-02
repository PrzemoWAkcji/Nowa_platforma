"use client";

import { useCompetitions } from "@/hooks/useCompetitions";
import { Competition as APICompetition } from "@/types";

// Skopiuj funkcję mapowania
type CompetitionCategory = "Mistrzostwa" | "Memoriał" | "Młodzież" | "Bieg";
type CompetitionStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

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
    maxRegistrations: apiComp.maxParticipants || 500,
    category,
    featured:
      apiComp.status === "REGISTRATION_OPEN" || apiComp.status === "ONGOING",
    liveResults: apiComp.liveResultsEnabled || false,
  };
};

export default function TestCompetitionsPage() {
  const { data: apiCompetitions, isLoading, error } = useCompetitions();

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Competitions API</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Ładowanie zawodów...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Competitions API</h1>
        <div className="text-red-600">
          <p>Błąd podczas ładowania zawodów:</p>
          <pre className="mt-2 p-4 bg-red-50 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const competitions = apiCompetitions
    ? apiCompetitions.map(mapApiCompetitionToLocal)
    : [];
  const featuredCompetitions = competitions.filter((comp) => comp.featured);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Competitions API</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Statystyki</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {apiCompetitions?.length || 0}
            </div>
            <p className="text-sm text-gray-600">Zawody z API</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <div className="text-2xl font-bold text-green-600">
              {competitions.length}
            </div>
            <p className="text-sm text-gray-600">Zmapowane zawody</p>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {featuredCompetitions.length}
            </div>
            <p className="text-sm text-gray-600">Wyróżnione zawody</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dane z API</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(apiCompetitions, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Zmapowane zawody</h2>
        <div className="space-y-4">
          {competitions.map((comp) => (
            <div key={comp.id} className="border p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{comp.name}</h3>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      comp.status === "REGISTRATION_OPEN"
                        ? "bg-green-100 text-green-800"
                        : comp.status === "ONGOING"
                          ? "bg-purple-100 text-purple-800"
                          : comp.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {comp.status}
                  </span>
                  {comp.featured && (
                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                      Wyróżnione
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">📍 {comp.location}</p>
              <p className="text-gray-600 text-sm mb-1">
                👥 {comp.registrations}/{comp.maxRegistrations} rejestracji
              </p>
              <p className="text-gray-600 text-sm mb-1">🏷️ {comp.category}</p>
              <p className="text-gray-600 text-sm">
                📅 {new Date(comp.startDate).toLocaleDateString("pl-PL")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
