"use client";

import { PzlaIntegrationDialog } from "@/components/athletes/PzlaIntegrationDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAthlete, useAthleteStats } from "@/hooks/useAthletes";
import { Category, Gender, Result } from "@/types";
import { differenceInYears, format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Calendar,
  Edit,
  MapPin,
  Medal,
  Target,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const genderLabels = {
  [Gender.MALE]: "Mężczyzna",
  [Gender.FEMALE]: "Kobieta",
  [Gender.MIXED]: "Mieszane",
};

const categoryLabels: Record<Category, string> = {
  [Category.WIELE]: "Wiele kategorii",
  [Category.AGE_0_11]: "0-11 lat",
  [Category.AGE_5]: "5 lat",
  [Category.AGE_6]: "6 lat",
  [Category.AGE_7]: "7 lat",
  [Category.AGE_8]: "8 lat",
  [Category.AGE_9]: "9 lat",
  [Category.AGE_10]: "10 lat",
  [Category.AGE_11]: "11 lat",
  [Category.AGE_12]: "12 lat",
  [Category.AGE_13]: "13 lat",
  [Category.AGE_14]: "14 lat",
  [Category.AGE_15]: "15 lat",
  [Category.AGE_16]: "16 lat",
  [Category.AGE_17]: "17 lat",
  [Category.AGE_18]: "18 lat",
  [Category.AGE_19]: "19 lat",
  [Category.AGE_20]: "20 lat",
  [Category.AGE_21]: "21 lat",
  [Category.AGE_22]: "22 lat",
  [Category.CLASS_1_SZKOLA_SREDNIA]: "Klasa 1 szkoła średnia",
  [Category.CLASS_2_SZKOLA_SREDNIA]: "Klasa 2 szkoła średnia",
  [Category.CLASS_3_SZKOLA_SREDNIA]: "Klasa 3 szkoła średnia",
  [Category.CLASS_4_SZKOLA_SREDNIA]: "Klasa 4 szkoła średnia",
  [Category.CLASS_5_SZKOLA_SREDNIA]: "Klasa 5 szkoła średnia",
  [Category.CLASS_6_SZKOLA_SREDNIA]: "Klasa 6 szkoła średnia",
  [Category.CLASS_7]: "Klasa 7",
  [Category.CLASS_8]: "Klasa 8",
  [Category.U8]: "U8",
  [Category.U9]: "U9",
  [Category.U10]: "U10",
  [Category.U11]: "U11",
  [Category.U12]: "U12",
  [Category.U13]: "U13",
  [Category.U14]: "U14",
  [Category.U15]: "U15",
  [Category.U16]: "U16",
  [Category.U18]: "U18",
  [Category.U20]: "U20",
  [Category.U23]: "U23",
  [Category.SENIOR]: "Senior",
  [Category.M35]: "M35",
  [Category.M40]: "M40",
  [Category.M45]: "M45",
  [Category.M50]: "M50",
  [Category.M55]: "M55",
  [Category.M60]: "M60",
  [Category.M65]: "M65",
  [Category.M70]: "M70",
  [Category.M75]: "M75",
  [Category.M80]: "M80",
  [Category.M85]: "M85",
  [Category.M90]: "M90",
  [Category.M95]: "M95",
  [Category.M100]: "M100",
  [Category.M105]: "M105",
  [Category.M110]: "M110",
};

export default function AthleteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  const {
    data: athlete,
    isLoading: athleteLoading,
    error: athleteError,
  } = useAthlete(athleteId);
  const { data: stats, isLoading: statsLoading } = useAthleteStats(athleteId);

  const isLoading = athleteLoading || statsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie profilu zawodnika...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (athleteError || !athlete) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">
              Błąd podczas ładowania profilu zawodnika
            </p>
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

  const age = differenceInYears(new Date(), new Date(athlete.dateOfBirth));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {athlete.firstName} {athlete.lastName}
              </h1>
              {athlete.isParaAthlete && (
                <Badge className="bg-purple-100 text-purple-800">
                  Para-atleta
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {genderLabels[athlete.gender]}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {age} lat
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                {categoryLabels[athlete.category]}
              </div>
              {athlete.nationality && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {athlete.nationality}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <PzlaIntegrationDialog
              athleteId={athleteId}
              athleteName={`${athlete.firstName} ${athlete.lastName}`}
              licenseNumber={athlete.licenseNumber}
            />
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Usuń
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Athlete Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informacje osobowe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Data urodzenia</p>
                    <p className="font-medium">
                      {format(new Date(athlete.dateOfBirth), "dd MMMM yyyy", {
                        locale: pl,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wiek</p>
                    <p className="font-medium">{age} lat</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Płeć</p>
                    <p className="font-medium">
                      {genderLabels[athlete.gender]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kategoria</p>
                    <p className="font-medium">
                      {categoryLabels[athlete.category]}
                    </p>
                  </div>
                  {athlete.nationality && (
                    <div>
                      <p className="text-sm text-gray-600">Narodowość</p>
                      <p className="font-medium">{athlete.nationality}</p>
                    </div>
                  )}
                  {athlete.club && (
                    <div>
                      <p className="text-sm text-gray-600">Klub</p>
                      <p className="font-medium">{athlete.club}</p>
                    </div>
                  )}
                  {athlete.classification && (
                    <div>
                      <p className="text-sm text-gray-600">Klasyfikacja</p>
                      <p className="font-medium">{athlete.classification}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle>Ostatnie wyniki</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentResults && stats.recentResults.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentResults.map((result: Result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{result.event?.name}</h4>
                          <p className="text-sm text-gray-600">
                            {result.event?.competition?.name} •{" "}
                            {format(new Date(result.createdAt), "dd MMM yyyy", {
                              locale: pl,
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{result.result}</p>
                          {result.position && (
                            <p className="text-sm text-gray-600">
                              Miejsce: {result.position}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Brak wyników</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>Rejestracje</CardTitle>
              </CardHeader>
              <CardContent>
                {athlete.registrations && athlete.registrations.length > 0 ? (
                  <div className="space-y-3">
                    {athlete.registrations.slice(0, 5).map((registration) => (
                      <div
                        key={registration.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">
                            {registration.competition?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {registration.competition?.location} •{" "}
                            {format(
                              new Date(registration.createdAt),
                              "dd MMM yyyy",
                              { locale: pl }
                            )}
                          </p>
                        </div>
                        <Badge variant="outline">{registration.status}</Badge>
                      </div>
                    ))}
                    {athlete.registrations.length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        i {athlete.registrations.length - 5} więcej...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Brak rejestracji</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Statystyki</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zawody:</span>
                    <span className="font-medium">
                      {stats.stats.totalCompetitions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wyniki:</span>
                    <span className="font-medium">
                      {stats.stats.totalResults}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rekordy życiowe:</span>
                    <span className="font-medium">
                      {stats.stats.personalBests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rekordy sezonu:</span>
                    <span className="font-medium">
                      {stats.stats.seasonBests}
                    </span>
                  </div>
                  {stats.stats.nationalRecords > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rekordy kraju:</span>
                      <span className="font-medium text-green-600">
                        {stats.stats.nationalRecords}
                      </span>
                    </div>
                  )}
                  {stats.stats.worldRecords > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rekordy świata:</span>
                      <span className="font-medium text-red-600">
                        {stats.stats.worldRecords}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Akcje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">
                  <Medal className="h-4 w-4 mr-2" />
                  Zobacz wszystkie rejestracje
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Zobacz wszystkie wyniki
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj profil
                </Button>
              </CardContent>
            </Card>

            {/* Created Date */}
            <Card>
              <CardHeader>
                <CardTitle>Informacje systemowe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Dodano do systemu</p>
                    <p className="font-medium">
                      {format(
                        new Date(athlete.createdAt),
                        "dd MMMM yyyy, HH:mm",
                        { locale: pl }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Ostatnia aktualizacja
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(athlete.updatedAt),
                        "dd MMMM yyyy, HH:mm",
                        { locale: pl }
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
