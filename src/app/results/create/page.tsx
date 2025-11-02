'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCreateResult } from '@/hooks/useResults';
import { useEvents } from '@/hooks/useEvents';
import { useAthletes } from '@/hooks/useAthletes';

const resultSchema = z.object({
  athleteId: z.string().min(1, 'Zawodnik jest wymagany'),
  eventId: z.string().min(1, 'Konkurencja jest wymagana'),
  registrationId: z.string().min(1, 'Rejestracja jest wymagana'),
  result: z.string().min(1, 'Wynik jest wymagany'),
  position: z.number().optional(),
  points: z.number().optional(),
  wind: z.number().optional(),
  reaction: z.number().optional(),
  isPersonalBest: z.boolean().optional(),
  isSeasonBest: z.boolean().optional(),
  isNationalRecord: z.boolean().optional(),
  isWorldRecord: z.boolean().optional(),
  isDNF: z.boolean().optional(),
  isDNS: z.boolean().optional(),
  isDQ: z.boolean().optional(),
  isValid: z.boolean().optional(),
  notes: z.string().optional(),
});

type ResultFormData = z.infer<typeof resultSchema>;

export default function CreateResultPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createResult = useCreateResult();
  const { data: events } = useEvents();
  const { data: athletes } = useAthletes();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      isValid: true,
      isPersonalBest: false,
      isSeasonBest: false,
      isNationalRecord: false,
      isWorldRecord: false,
      isDNF: false,
      isDNS: false,
      isDQ: false,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: ResultFormData) => {
    setIsSubmitting(true);
    try {
      await createResult.mutateAsync({
        ...data,
        position: data.position || undefined,
        points: data.points || undefined,
        wind: data.wind?.toString() || undefined,
        reaction: data.reaction?.toString() || undefined,
      });
      router.push('/results');
    } catch (error) {
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Dodaj wynik" 
          description="Wprowadź nowy wynik zawodnika"
          backButtonFallback="/results"
        />

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Nowy wynik</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Podstawowe informacje</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="athleteId">Zawodnik *</Label>
                    <Select onValueChange={(value) => setValue('athleteId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz zawodnika" />
                      </SelectTrigger>
                      <SelectContent>
                        {athletes?.map((athlete) => (
                          <SelectItem key={athlete.id} value={athlete.id}>
                            {athlete.firstName} {athlete.lastName} {athlete.club && `(${athlete.club})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.athleteId && (
                      <p className="text-sm text-red-600 mt-1">{errors.athleteId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="eventId">Konkurencja *</Label>
                    <Select onValueChange={(value) => setValue('eventId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz konkurencję" />
                      </SelectTrigger>
                      <SelectContent>
                        {events?.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name} - {event.competition?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.eventId && (
                      <p className="text-sm text-red-600 mt-1">{errors.eventId.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="registrationId">Rejestracja *</Label>
                  <Select onValueChange={(value) => setValue('registrationId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz rejestrację" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temp-registration-1">
                        Rejestracja #1 (tymczasowa)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.registrationId && (
                    <p className="text-sm text-red-600 mt-1">{errors.registrationId.message}</p>
                  )}
                </div>
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Wyniki</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="result">Wynik *</Label>
                    <Input
                      id="result"
                      {...register('result')}
                      placeholder="np. 10.50, 7.20m, 2:15.30"
                    />
                    {errors.result && (
                      <p className="text-sm text-red-600 mt-1">{errors.result.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="position">Miejsce</Label>
                    <Input
                      id="position"
                      type="number"
                      {...register('position', { valueAsNumber: true })}
                      placeholder="1, 2, 3..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="points">Punkty</Label>
                    <Input
                      id="points"
                      type="number"
                      {...register('points', { valueAsNumber: true })}
                      placeholder="Punkty (wielobój)"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Szczegóły techniczne</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wind">Wiatr (m/s)</Label>
                    <Input
                      id="wind"
                      type="number"
                      step="0.1"
                      {...register('wind', { valueAsNumber: true })}
                      placeholder="np. +1.5, -0.8"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reaction">Czas reakcji (s)</Label>
                    <Input
                      id="reaction"
                      type="number"
                      step="0.001"
                      {...register('reaction', { valueAsNumber: true })}
                      placeholder="np. 0.145"
                    />
                  </div>
                </div>
              </div>

              {/* Records and Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Rekordy i status</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPersonalBest"
                      checked={watchedValues.isPersonalBest}
                      onCheckedChange={(checked) => setValue('isPersonalBest', !!checked)}
                    />
                    <Label htmlFor="isPersonalBest">Rekord życiowy (PB)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSeasonBest"
                      checked={watchedValues.isSeasonBest}
                      onCheckedChange={(checked) => setValue('isSeasonBest', !!checked)}
                    />
                    <Label htmlFor="isSeasonBest">Rekord sezonu (SB)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNationalRecord"
                      checked={watchedValues.isNationalRecord}
                      onCheckedChange={(checked) => setValue('isNationalRecord', !!checked)}
                    />
                    <Label htmlFor="isNationalRecord">Rekord kraju (NR)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isWorldRecord"
                      checked={watchedValues.isWorldRecord}
                      onCheckedChange={(checked) => setValue('isWorldRecord', !!checked)}
                    />
                    <Label htmlFor="isWorldRecord">Rekord świata (WR)</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDNF"
                      checked={watchedValues.isDNF}
                      onCheckedChange={(checked) => setValue('isDNF', !!checked)}
                    />
                    <Label htmlFor="isDNF">Nie ukończył (DNF)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDNS"
                      checked={watchedValues.isDNS}
                      onCheckedChange={(checked) => setValue('isDNS', !!checked)}
                    />
                    <Label htmlFor="isDNS">Nie wystartował (DNS)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDQ"
                      checked={watchedValues.isDQ}
                      onCheckedChange={(checked) => setValue('isDQ', !!checked)}
                    />
                    <Label htmlFor="isDQ">Dyskwalifikacja (DQ)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isValid"
                      checked={watchedValues.isValid}
                      onCheckedChange={(checked) => setValue('isValid', !!checked)}
                    />
                    <Label htmlFor="isValid">Wynik ważny</Label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Uwagi</Label>
                <Input
                  id="notes"
                  {...register('notes')}
                  placeholder="Dodatkowe informacje o wyniku"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Dodawanie...' : 'Dodaj wynik'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}