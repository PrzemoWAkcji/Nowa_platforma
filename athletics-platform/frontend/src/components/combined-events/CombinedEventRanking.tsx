'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCombinedEvents, CombinedEvent } from '@/hooks/useCombinedEvents';
import { Trophy, Medal, Award, User, Target, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface CombinedEventRankingProps {
  competitionId: string;
  initialEventType?: 'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON';
}

const EVENT_TYPE_OPTIONS = [
  { value: 'DECATHLON', label: '10-bój (Dziesięciobój)' },
  { value: 'HEPTATHLON', label: '7-bój (Siedmiobój)' },
  { value: 'PENTATHLON', label: '5-bój (Pięciobój)' }
];

type RankedCombinedEvent = CombinedEvent & { position: number };

export function CombinedEventRanking({ 
  competitionId, 
  initialEventType = 'DECATHLON' 
}: CombinedEventRankingProps) {
  const { getRanking, loading } = useCombinedEvents();
  const [eventType, setEventType] = useState<'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON'>(initialEventType);
  const [ranking, setRanking] = useState<RankedCombinedEvent[]>([]);

  const loadRanking = useCallback(async () => {
    try {
      const data = await getRanking(competitionId, eventType);
      setRanking(data);
    } catch (err) {
      
    }
  }, [getRanking, competitionId, eventType]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{position}</span>;
    }
  };

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">1. miejsce</Badge>;
      case 2:
        return <Badge className="bg-gray-400 text-white">2. miejsce</Badge>;
      case 3:
        return <Badge className="bg-amber-600 text-white">3. miejsce</Badge>;
      default:
        return <Badge variant="outline">{position}. miejsce</Badge>;
    }
  };

  const getPointsColor = (points: number, eventType: string) => {
    const thresholds = {
      DECATHLON: { excellent: 8500, good: 7500, average: 6500 },
      HEPTATHLON: { excellent: 6500, good: 5800, average: 5000 },
      PENTATHLON: { excellent: 4500, good: 4000, average: 3500 }
    };

    const threshold = thresholds[eventType as keyof typeof thresholds];
    if (points >= threshold.excellent) return 'text-green-600 font-bold';
    if (points >= threshold.good) return 'text-blue-600 font-semibold';
    if (points >= threshold.average) return 'text-orange-600';
    return 'text-gray-600';
  };

  const completedEvents = ranking.filter(event => event.isComplete);
  const inProgressEvents = ranking.filter(event => !event.isComplete);

  return (
    <div className="space-y-6">
      {/* Nagłówek z filtrem */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Ranking wielobojów
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={eventType} onValueChange={(value: 'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON') => setEventType(value)}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadRanking} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{ranking.length}</div>
              <div className="text-sm text-gray-600">Łącznie zawodników</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedEvents.length}</div>
              <div className="text-sm text-gray-600">Ukończone wieloboje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{inProgressEvents.length}</div>
              <div className="text-sm text-gray-600">W trakcie</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Podium (top 3) */}
      {completedEvents.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Podium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-3">
                    {getPositionIcon(event.position)}
                  </div>
                  <div className="font-bold text-lg">
                    {event.athlete?.firstName} {event.athlete?.lastName}
                  </div>
                  {event.athlete?.club && (
                    <div className="text-sm text-gray-600 mb-2">{event.athlete.club}</div>
                  )}
                  <div className={`text-xl font-bold ${getPointsColor(event.totalPoints, eventType)}`}>
                    {event.totalPoints.toLocaleString()} pkt
                  </div>
                  {getPositionBadge(event.position)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pełny ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Pełny ranking</CardTitle>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak wielobojów dla wybranego typu</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Poz.</TableHead>
                  <TableHead>Zawodnik</TableHead>
                  <TableHead>Klub</TableHead>
                  <TableHead className="text-right">Punkty</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Postęp</TableHead>
                  <TableHead className="w-32">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((event) => {
                  const completedDisciplines = event.results.filter(r => r.isValid).length;
                  const totalDisciplines = event.results.length;
                  const progressPercentage = (completedDisciplines / totalDisciplines) * 100;

                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPositionIcon(event.position)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {event.athlete?.firstName} {event.athlete?.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">
                          {event.athlete?.club || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className={getPointsColor(event.totalPoints, eventType)}>
                            {event.totalPoints.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={event.isComplete ? "default" : "secondary"}>
                          {event.isComplete ? 'Ukończony' : 'W trakcie'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12">
                            {completedDisciplines}/{totalDisciplines}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/combined-events/${event.id}`}>
                            Szczegóły
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}