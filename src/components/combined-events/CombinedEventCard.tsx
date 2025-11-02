'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CombinedEvent } from '@/hooks/useCombinedEvents';
import { SplitCombinedEventDialog } from './SplitCombinedEventDialog';
import { Trophy, User, Calendar, Target } from 'lucide-react';
import Link from 'next/link';

interface CombinedEventCardProps {
  combinedEvent: CombinedEvent;
  showAthlete?: boolean;
  showActions?: boolean;
  onUpdate?: () => void;
}

const EVENT_TYPE_LABELS = {
  DECATHLON: '10-bój',
  HEPTATHLON: '7-bój',
  PENTATHLON: '5-bój',
  PENTATHLON_U16_MALE: '5-bój U16 M',
  PENTATHLON_U16_FEMALE: '5-bój U16 K'
};

const EVENT_TYPE_COLORS = {
  DECATHLON: 'bg-blue-500',
  HEPTATHLON: 'bg-pink-500',
  PENTATHLON: 'bg-green-500',
  PENTATHLON_U16_MALE: 'bg-orange-500',
  PENTATHLON_U16_FEMALE: 'bg-purple-500'
};

export const CombinedEventCard = React.memo(function CombinedEventCard({ 
  combinedEvent, 
  showAthlete = true, 
  showActions = true,
  onUpdate
}: CombinedEventCardProps) {
  const completedDisciplines = combinedEvent.results.filter(r => r.isValid).length;
  const totalDisciplines = combinedEvent.results.length;
  const progressPercentage = (completedDisciplines / totalDisciplines) * 100;

  const getPointsColor = (points: number, eventType: string) => {
    const thresholds = {
      DECATHLON: { excellent: 8500, good: 7500, average: 6500 },
      HEPTATHLON: { excellent: 6500, good: 5800, average: 5000 },
      PENTATHLON: { excellent: 4500, good: 4000, average: 3500 },
      PENTATHLON_U16_MALE: { excellent: 4000, good: 3600, average: 3200 },
      PENTATHLON_U16_FEMALE: { excellent: 3800, good: 3400, average: 3000 }
    };

    const threshold = thresholds[eventType as keyof typeof thresholds];
    if (points >= threshold.excellent) return 'text-green-600 font-bold';
    if (points >= threshold.good) return 'text-blue-600 font-semibold';
    if (points >= threshold.average) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {EVENT_TYPE_LABELS[combinedEvent.eventType]}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${EVENT_TYPE_COLORS[combinedEvent.eventType]} text-white`}
          >
            {combinedEvent.gender === 'MALE' ? 'Mężczyźni' : 'Kobiety'}
          </Badge>
        </div>
        
        {showAthlete && combinedEvent.athlete && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>
              {combinedEvent.athlete.firstName} {combinedEvent.athlete.lastName}
              {combinedEvent.athlete.club && (
                <span className="text-gray-500"> • {combinedEvent.athlete.club}</span>
              )}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Punkty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Punkty:</span>
          </div>
          <span className={`text-xl font-bold ${getPointsColor(combinedEvent.totalPoints, combinedEvent.eventType)}`}>
            {combinedEvent.totalPoints.toLocaleString()}
          </span>
        </div>

        {/* Postęp */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Postęp:</span>
            <span className="font-medium">
              {completedDisciplines}/{totalDisciplines} dyscyplin
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Status:</span>
          </div>
          <Badge variant={combinedEvent.isComplete ? "default" : "secondary"}>
            {combinedEvent.isComplete ? 'Ukończony' : 'W trakcie'}
          </Badge>
        </div>

        {/* Najlepsze wyniki */}
        {combinedEvent.results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Najlepsze dyscypliny:</h4>
            <div className="grid grid-cols-2 gap-2">
              {combinedEvent.results
                .filter(r => r.isValid)
                .sort((a, b) => b.points - a.points)
                .slice(0, 4)
                .map((result) => (
                  <div key={result.id} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="font-medium">{result.discipline}</div>
                    <div className="text-gray-600">{result.points} pkt</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Akcje */}
        {showActions && (
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/combined-events/${combinedEvent.id}`}>
                  Szczegóły
                </Link>
              </Button>
              {!combinedEvent.isComplete && (
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/combined-events/${combinedEvent.id}/edit`}>
                    Edytuj wyniki
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex justify-center">
              <SplitCombinedEventDialog 
                combinedEvent={combinedEvent}
                onSuccess={onUpdate}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});