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
import { useCreateEvent } from '@/hooks/useEvents';
import { useCompetitions } from '@/hooks/useCompetitions';
import { EventType, Gender, Category, Unit } from '@/types';

const eventSchema = z.object({
  name: z.string().min(1, 'Nazwa konkurencji jest wymagana'),
  competitionId: z.string().min(1, 'Zawody są wymagane'),
  type: z.nativeEnum(EventType),
  gender: z.nativeEnum(Gender),
  category: z.nativeEnum(Category),
  unit: z.nativeEnum(Unit),
  maxParticipants: z.number().optional(),
  seedTimeRequired: z.boolean().optional(),
  description: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const eventTypeLabels = {
  [EventType.TRACK]: 'Bieżnia',
  [EventType.FIELD]: 'Rzuty/Skoki',
  [EventType.ROAD]: 'Ulica',
  [EventType.COMBINED]: 'Wielobój',
  [EventType.RELAY]: 'Sztafeta',
};

const genderLabels = {
  [Gender.MALE]: 'Mężczyźni',
  [Gender.FEMALE]: 'Kobiety',
  [Gender.MIXED]: 'Mieszane',
};

const categoryLabels = {
  [Category.U16]: 'U16 (do 16 lat)',
  [Category.U18]: 'U18 (do 18 lat)',
  [Category.U20]: 'U20 (do 20 lat)',
  [Category.SENIOR]: 'Senior (20-34 lata)',
  [Category.M35]: 'M35 (35-39 lat)',
  [Category.M40]: 'M40 (40-44 lata)',
  [Category.M45]: 'M45 (45-49 lat)',
  [Category.M50]: 'M50 (50-54 lata)',
  [Category.M55]: 'M55 (55-59 lat)',
  [Category.M60]: 'M60 (60-64 lata)',
  [Category.M65]: 'M65 (65-69 lat)',
  [Category.M70]: 'M70 (70-74 lata)',
  [Category.M75]: 'M75 (75-79 lat)',
  [Category.M80]: 'M80 (80+ lat)',
};

const unitLabels = {
  [Unit.TIME]: 'Czas',
  [Unit.DISTANCE]: 'Odległość',
  [Unit.HEIGHT]: 'Wysokość',
  [Unit.POINTS]: 'Punkty',
};

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createEvent = useCreateEvent();
  const { data: competitions } = useCompetitions();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      seedTimeRequired: false,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      await createEvent.mutateAsync({
        ...data,
        maxParticipants: data.maxParticipants || undefined,
      });
      router.push('/events');
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
          title="Utwórz konkurencję" 
          description="Dodaj nową konkurencję do zawodów"
          backButtonFallback="/events"
        />

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Nowa konkurencja</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Podstawowe informacje</h3>
                
                <div>
                  <Label htmlFor="name">Nazwa konkurencji *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="np. Bieg 100m, Skok w dal, Rzut oszczepem"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="competitionId">Zawody *</Label>
                  <Select onValueChange={(value) => setValue('competitionId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz zawody" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions?.map((competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          {competition.name} - {competition.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.competitionId && (
                    <p className="text-sm text-red-600 mt-1">{errors.competitionId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Opis</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Dodatkowe informacje o konkurencji"
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Szczegóły konkurencji</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Typ konkurencji *</Label>
                    <Select onValueChange={(value) => setValue('type', value as EventType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="unit">Jednostka wyniku *</Label>
                    <Select onValueChange={(value) => setValue('unit', value as Unit)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz jednostkę" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(unitLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unit && (
                      <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Płeć *</Label>
                    <Select onValueChange={(value) => setValue('gender', value as Gender)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz płeć" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(genderLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Kategoria wiekowa *</Label>
                    <Select onValueChange={(value) => setValue('category', value as Category)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorię" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dodatkowe ustawienia</h3>
                
                <div>
                  <Label htmlFor="maxParticipants">Maksymalna liczba uczestników</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    {...register('maxParticipants', { valueAsNumber: true })}
                    placeholder="Pozostaw puste dla braku limitu"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="seedTimeRequired"
                    checked={watchedValues.seedTimeRequired}
                    onCheckedChange={(checked) => setValue('seedTimeRequired', !!checked)}
                  />
                  <Label htmlFor="seedTimeRequired">Wymagany czas kwalifikacyjny</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Tworzenie...' : 'Utwórz konkurencję'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}