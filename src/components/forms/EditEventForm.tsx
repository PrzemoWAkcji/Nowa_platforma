'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, CreateEventForm as CreateEventFormType, Event, EventType, Gender, Unit } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// import { DISCIPLINES, DISCIPLINE_CATEGORIES } from '@/lib/disciplines'; // Obecnie nieużywane

const eventTypeLabels: Record<EventType, string> = {
  TRACK: 'Bieżnia',
  FIELD: 'Rzuty/Skoki',
  ROAD: 'Szosa',
  COMBINED: 'Wielobój',
  RELAY: 'Sztafeta',
};

const genderLabels: Record<Gender, string> = {
  MALE: 'Mężczyźni',
  FEMALE: 'Kobiety',
  MIXED: 'Mieszane',
};

const unitLabels: Record<Unit, string> = {
  TIME: 'Czas',
  DISTANCE: 'Odległość',
  HEIGHT: 'Wysokość',
  POINTS: 'Punkty',
};

// Podstawowe kategorie - można rozszerzyć
const basicCategories = [
  Category.SENIOR,
  Category.U23,
  Category.U20,
  Category.U18,
  Category.U16,
  Category.U14,
  Category.U12,
  Category.U10,
  Category.M35,
  Category.M40,
  Category.M45,
  Category.M50,
];

const editEventSchema = z.object({
  name: z.string().min(1, 'Nazwa konkurencji jest wymagana'),
  type: z.nativeEnum(EventType, { required_error: 'Typ konkurencji jest wymagany' }),
  gender: z.nativeEnum(Gender, { required_error: 'Płeć jest wymagana' }),
  category: z.nativeEnum(Category, { required_error: 'Kategoria jest wymagana' }),
  unit: z.nativeEnum(Unit, { required_error: 'Jednostka jest wymagana' }),
  maxParticipants: z.number().min(1).optional(),
  seedTimeRequired: z.boolean().optional(),
  scheduledTime: z.string().optional(),
});

type EventFormData = z.infer<typeof editEventSchema>;

interface EditEventFormProps {
  event: Event;
  onSubmit: (data: CreateEventFormType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EditEventForm({ event, onSubmit, onCancel, isSubmitting = false }: EditEventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      name: event.name,
      type: event.type,
      gender: event.gender,
      category: event.category,
      unit: event.unit,
      maxParticipants: event.maxParticipants || undefined,
      seedTimeRequired: event.seedTimeRequired,
      scheduledTime: event.scheduledTime ? new Date(event.scheduledTime).toISOString().slice(0, 16) : '',
    },
  });

  // const watchedType = watch('type'); // Obecnie nieużywane
  const watchedSeedTimeRequired = watch('seedTimeRequired');

  // Set initial values for selects
  useEffect(() => {
    setValue('type', event.type);
    setValue('gender', event.gender);
    setValue('category', event.category);
    setValue('unit', event.unit);
  }, [event, setValue]);

  const handleFormSubmit = (data: EventFormData) => {
    onSubmit({
      ...data,
      competitionId: event.competitionId,
      scheduledTime: data.scheduledTime || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="name">Nazwa konkurencji *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="np. Bieg 100m mężczyzn"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type">Typ konkurencji *</Label>
          <Select value={watch('type')} onValueChange={(value) => setValue('type', value as EventType)}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz typ konkurencji" />
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
          <Label htmlFor="gender">Płeć *</Label>
          <Select value={watch('gender')} onValueChange={(value) => setValue('gender', value as Gender)}>
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
          <Label htmlFor="category">Kategoria *</Label>
          <Select value={watch('category')} onValueChange={(value) => setValue('category', value as Category)}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz kategorię" />
            </SelectTrigger>
            <SelectContent>
              {basicCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unit">Jednostka *</Label>
          <Select value={watch('unit')} onValueChange={(value) => setValue('unit', value as Unit)}>
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

        <div>
          <Label htmlFor="maxParticipants">Maksymalna liczba uczestników</Label>
          <Input
            id="maxParticipants"
            type="number"
            min="1"
            {...register('maxParticipants', { valueAsNumber: true })}
            placeholder="Opcjonalne"
          />
          {errors.maxParticipants && (
            <p className="text-sm text-red-600 mt-1">{errors.maxParticipants.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="scheduledTime">Planowany czas rozpoczęcia</Label>
          <Input
            id="scheduledTime"
            type="datetime-local"
            {...register('scheduledTime')}
          />
          {errors.scheduledTime && (
            <p className="text-sm text-red-600 mt-1">{errors.scheduledTime.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="seedTimeRequired"
              checked={watchedSeedTimeRequired}
              onCheckedChange={(checked) => setValue('seedTimeRequired', !!checked)}
            />
            <Label htmlFor="seedTimeRequired">
              Wymagany czas kwalifikacyjny
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}