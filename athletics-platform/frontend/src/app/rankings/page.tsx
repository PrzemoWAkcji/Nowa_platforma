"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAthletes } from "@/hooks/useAthletes";
import { useResults } from "@/hooks/useResults";
import { Category, Gender } from "@/types";
import { Award, Medal, Target, TrendingUp, Trophy } from "lucide-react";
import { useState } from "react";

const genderLabels = {
  [Gender.MALE]: "Mężczyźni",
  [Gender.FEMALE]: "Kobiety",
  [Gender.MIXED]: "Mieszane",
};

const categoryLabels = {
  [Category.U16]: "U16",
  [Category.U18]: "U18",
  [Category.U20]: "U20",
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
};

export default function RankingsPage() {
  const [selectedGender, setSelectedGender] = useState<Gender | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">(
    "ALL"
  );
  const [rankingType, setRankingType] = useState<
    "points" | "medals" | "records"
  >("points");

  const { data: athletes } = useAthletes();
  const { data: results } = useResults();

  // Mock ranking data - in real app this would come from API
  const topAthletes =
    athletes?.slice(0, 10).map((athlete, index) => ({
      ...athlete,
      rank: index + 1,
      points: Math.floor(Math.random() * 1000) + 500,
      medals: {
        gold: Math.floor(Math.random() * 5),
        silver: Math.floor(Math.random() * 5),
        bronze: Math.floor(Math.random() * 5),
      },
      records: Math.floor(Math.random() * 3),
      competitions: Math.floor(Math.random() * 10) + 5,
    })) || [];

  const topEvents = [
    {
      name: "Bieg 100m",
      participants: 45,
      avgResult: "11.23",
      bestResult: "10.15",
    },
    {
      name: "Skok w dal",
      participants: 32,
      avgResult: "6.45m",
      bestResult: "7.89m",
    },
    {
      name: "Rzut oszczepem",
      participants: 28,
      avgResult: "45.67m",
      bestResult: "68.45m",
    },
    {
      name: "Bieg 1500m",
      participants: 38,
      avgResult: "4:15.23",
      bestResult: "3:45.67",
    },
    {
      name: "Skok wzwyż",
      participants: 25,
      avgResult: "1.65m",
      bestResult: "2.15m",
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-600 font-medium">{rank}</span>;
    }
  };

  const getRankValue = (athlete: {
    points?: number;
    bestTime?: string;
    bestDistance?: string;
    bestHeight?: string;
    medals?: { gold: number; silver: number; bronze: number };
    records?: number;
  }) => {
    switch (rankingType) {
      case "points":
        return `${athlete.points || 0} pkt`;
      case "medals":
        return `${(athlete.medals?.gold || 0) + (athlete.medals?.silver || 0) + (athlete.medals?.bronze || 0)} medali`;
      case "records":
        return `${athlete.records || 0} rekordów`;
      default:
        return "";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Rankingi"
          description="Najlepsi zawodnicy i statystyki"
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={rankingType}
            onValueChange={(value: string) => setRankingType(value as "points" | "medals" | "records")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Ranking punktowy</SelectItem>
              <SelectItem value="medals">Ranking medalowy</SelectItem>
              <SelectItem value="records">Ranking rekordów</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedGender}
            onValueChange={(value: string) => setSelectedGender(value as Gender | "ALL")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Wszystkie płcie</SelectItem>
              {Object.entries(genderLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCategory}
            onValueChange={(value: string) => setSelectedCategory(value as Category | "ALL")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Wszystkie kategorie</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Rankings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Athletes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Top 10 zawodników
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAthletes.map((athlete) => (
                    <div
                      key={athlete.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(athlete.rank)}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {athlete.firstName} {athlete.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {athlete.club || "Brak klubu"} •{" "}
                            {categoryLabels[athlete.category as keyof typeof categoryLabels] || athlete.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-blue-600">
                          {getRankValue(athlete)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {athlete.competitions} zawodów
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Najpopularniejsze konkurencje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topEvents.map((event) => (
                    <div
                      key={event.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-gray-600">
                          {event.participants} uczestników
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {event.bestResult}
                        </div>
                        <div className="text-sm text-gray-600">
                          Średnia: {event.avgResult}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statystyki ogólne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktywni zawodnicy:</span>
                  <span className="font-medium">{athletes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wszystkie wyniki:</span>
                  <span className="font-medium">{results?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rekordy życiowe:</span>
                  <span className="font-medium text-blue-600">
                    {results?.filter((r) => r.isPersonalBest).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rekordy kraju:</span>
                  <span className="font-medium text-yellow-600">
                    {results?.filter((r) => r.isNationalRecord).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rekordy świata:</span>
                  <span className="font-medium text-red-600">
                    {results?.filter((r) => r.isWorldRecord).length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Medal Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rozkład medali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                      <span>Złote</span>
                    </div>
                    <span className="font-medium">
                      {topAthletes.reduce((sum, a) => sum + a.medals.gold, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Medal className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Srebrne</span>
                    </div>
                    <span className="font-medium">
                      {topAthletes.reduce((sum, a) => sum + a.medals.silver, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-amber-600 mr-2" />
                      <span>Brązowe</span>
                    </div>
                    <span className="font-medium">
                      {topAthletes.reduce((sum, a) => sum + a.medals.bronze, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card>
              <CardHeader>
                <CardTitle>Ostatnie rekordy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results
                    ?.filter(
                      (r) =>
                        r.isPersonalBest ||
                        r.isNationalRecord ||
                        r.isWorldRecord
                    )
                    .slice(0, 5)
                    .map((result) => (
                      <div
                        key={result.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">
                              {result.athlete?.firstName}{" "}
                              {result.athlete?.lastName}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {result.event?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-blue-600 text-sm">
                              {result.result}
                            </div>
                            <div className="flex space-x-1">
                              {result.isPersonalBest && (
                                <Badge variant="outline" className="text-xs">
                                  PB
                                </Badge>
                              )}
                              {result.isNationalRecord && (
                                <Badge variant="outline" className="text-xs">
                                  NR
                                </Badge>
                              )}
                              {result.isWorldRecord && (
                                <Badge variant="outline" className="text-xs">
                                  WR
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                    <p className="text-gray-600 text-sm">
                      Brak ostatnich rekordów
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
