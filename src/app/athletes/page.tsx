"use client";

import { AthleteImport } from "@/components/athletes/AthleteImport";
import { PzlaBulkUpdateDialog } from "@/components/athletes/PzlaBulkUpdateDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAthletes } from "@/hooks/useAthletes";
import { Athlete, Category, Gender } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Medal, Plus, Search, Target, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

function AthleteCard({ athlete }: { athlete: Athlete }) {
  const age =
    new Date().getFullYear() - new Date(athlete.dateOfBirth).getFullYear();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {athlete.firstName} {athlete.lastName}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{genderLabels[athlete.gender]}</Badge>
              <Badge variant="outline">
                {categoryLabels[athlete.category]}
              </Badge>
              {athlete.isParaAthlete && (
                <Badge className="bg-purple-100 text-purple-800">Para</Badge>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>{age} lat</div>
            {athlete.nationality && (
              <div className="mt-1">{athlete.nationality}</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {athlete.club && (
            <div className="text-sm text-gray-600">
              <strong>Klub:</strong> {athlete.club}
            </div>
          )}
          {athlete.classification && (
            <div className="text-sm text-gray-600">
              <strong>Klasyfikacja:</strong> {athlete.classification}
            </div>
          )}
          {athlete._count && (
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
              <div className="flex items-center">
                <Medal className="h-4 w-4 mr-1" />
                {athlete._count.registrations} rejestracji
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {athlete._count.results} wyników
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-500">
            Dodano{" "}
            {athlete.createdAt && !isNaN(new Date(athlete.createdAt).getTime())
              ? format(new Date(athlete.createdAt), "dd MMM yyyy", {
                  locale: pl,
                })
              : "Nieznana data"}
          </div>
          <Link href={`/athletes/${athlete.id}`}>
            <Button variant="outline" size="sm">
              Zobacz profil
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AthletesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<Gender | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<Category | "ALL">("ALL");

  const { data: athletes, isLoading, error } = useAthletes();

  const filteredAthletes =
    athletes?.filter((athlete) => {
      const matchesSearch =
        searchTerm === "" ||
        `${athlete.firstName} ${athlete.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        athlete.club?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender =
        genderFilter === "ALL" || athlete.gender === genderFilter;
      const matchesCategory =
        categoryFilter === "ALL" || athlete.category === categoryFilter;

      return matchesSearch && matchesGender && matchesCategory;
    }) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie zawodników...</p>
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
            <p className="text-red-600">Błąd podczas ładowania zawodników</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Zawodnicy</h1>
            <p className="text-gray-600">Zarządzaj bazą zawodników</p>
          </div>
          <div className="flex space-x-2">
            <PzlaBulkUpdateDialog />
            <Link href="/athletes/create">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj zawodnika
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Lista zawodników</TabsTrigger>
            <TabsTrigger value="import">Import CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Szukaj zawodników..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={genderFilter}
                  onChange={(e) =>
                    setGenderFilter(e.target.value as Gender | "ALL")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  aria-label="Filtruj według płci"
                >
                  <option value="ALL">Wszystkie płcie</option>
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as Category | "ALL")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  aria-label="Filtruj według kategorii"
                >
                  <option value="ALL">Wszystkie kategorie</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {athletes?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Wszystkich zawodników</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {athletes?.filter((a) => a.gender === Gender.MALE).length ||
                      0}
                  </div>
                  <p className="text-sm text-gray-600">Mężczyzn</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-pink-600">
                    {athletes?.filter((a) => a.gender === Gender.FEMALE)
                      .length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Kobiet</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {athletes?.filter((a) => a.isParaAthlete).length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Para-atletów</p>
                </CardContent>
              </Card>
            </div>

            {/* Athletes Grid */}
            {filteredAthletes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ||
                    genderFilter !== "ALL" ||
                    categoryFilter !== "ALL"
                      ? "Brak wyników"
                      : "Brak zawodników"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ||
                    genderFilter !== "ALL" ||
                    categoryFilter !== "ALL"
                      ? "Spróbuj zmienić kryteria wyszukiwania."
                      : "Nie ma jeszcze żadnych zawodników. Dodaj pierwszego zawodnika."}
                  </p>
                  {!searchTerm &&
                    genderFilter === "ALL" &&
                    categoryFilter === "ALL" && (
                      <Link href="/athletes/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj zawodnika
                        </Button>
                      </Link>
                    )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAthletes.map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="import">
            <AthleteImport />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
