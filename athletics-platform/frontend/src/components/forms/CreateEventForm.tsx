'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Gender, Category, Unit, CreateEventForm as CreateEventFormType } from '@/types';
import { DISCIPLINES, DISCIPLINE_CATEGORIES, getDisciplineById, generateEventName, Discipline } from '@/lib/disciplines';

const genderLabels: Record<Gender, string> = {
  MALE: 'Mężczyźni',
  FEMALE: 'Kobiety',
  MIXED: 'Mieszane',
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

const createEventSchema = z.object({
  disciplineId: z.string().min(1, 'Dyscyplina jest wymagana'),
  gender: z.nativeEnum(Gender, { required_error: 'Płeć jest wymagana' }),
  category: z.nativeEnum(Category, { required_error: 'Kategoria jest wymagana' }),
  maxParticipants: z.number().min(1).optional(),
  seedTimeRequired: z.boolean().optional(),
  scheduledTime: z.string().optional(),
});

type EventFormData = z.infer<typeof createEventSchema>;

interface CreateEventFormProps {
  onSubmit: (data: CreateEventFormType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateEventForm({ onSubmit, onCancel, isSubmitting = false }: CreateEventFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      seedTimeRequired: false,
      maxParticipants: 100,
    },
  });

  // const watchedDisciplineId = watch('disciplineId'); // Obecnie nieużywane
  const watchedGender = watch('gender');
  const watchedCategory = watch('category');
  const watchedSeedTimeRequired = watch('seedTimeRequired');

  const handleDisciplineSelect = (disciplineId: string) => {
    const discipline = getDisciplineById(disciplineId);
    if (discipline) {
      setSelectedDiscipline(discipline);
      setValue('disciplineId', disciplineId);
    }
  };

  // Auto-generate event name when discipline, gender, and category change
  useEffect(() => {
    if (selectedDiscipline && watchedGender && watchedCategory) {
      // const eventName = generateEventName(selectedDiscipline, watchedGender, watchedCategory);
      // Don't set the name in the form, just show it in preview
    }
  }, [selectedDiscipline, watchedGender, watchedCategory]);

  const handleFormSubmit = (data: EventFormData) => {
    const discipline = getDisciplineById(data.disciplineId);
    if (!discipline) return;

    const eventName = generateEventName(discipline, data.gender, data.category);
    
    onSubmit({
      name: eventName,
      type: discipline.type,
      gender: data.gender,
      category: data.category,
      unit: discipline.unit,
      competitionId: '', // Will be set by parent component
      maxParticipants: data.maxParticipants,
      seedTimeRequired: data.seedTimeRequired,
      scheduledTime: data.scheduledTime,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Wybór kategorii dyscyplin */}
      <div>
        <Label>Kategoria dyscyplin *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {DISCIPLINE_CATEGORIES.map((cat) => (
            <Card 
              key={cat.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === cat.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedDiscipline(null);
                setValue('disciplineId', '');
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="font-medium">{cat.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Wybór konkretnej dyscypliny */}
      {selectedCategory && (
        <div>
          <Label>Dyscyplina *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
            {DISCIPLINES[selectedCategory as keyof typeof DISCIPLINES]?.map((discipline) => (
              <Button
                key={discipline.id}
                type="button"
                variant={selectedDiscipline?.id === discipline.id ? "default" : "outline"}
                className="justify-start h-auto p-3"
                onClick={() => handleDisciplineSelect(discipline.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{discipline.name}</div>
                  <div className="text-xs text-gray-500">
                    {discipline.unit === Unit.TIME ? 'Czas' : 
                     discipline.unit === Unit.DISTANCE ? 'Odległość' : 
                     discipline.unit === Unit.HEIGHT ? 'Wysokość' : 'Punkty'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          {errors.disciplineId && (
            <p className="text-sm text-red-600 mt-1">{errors.disciplineId.message}</p>
          )}
        </div>
      )}

      {/* Podgląd wybranej dyscypliny */}
      {selectedDiscipline && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Wybrana dyscyplina:</h4>
                <p className="text-sm text-gray-600">{selectedDiscipline.name}</p>
                <p className="text-xs text-gray-500">
                  Typ: {selectedDiscipline.type} | Jednostka: {
                    selectedDiscipline.unit === Unit.TIME ? 'Czas' : 
                    selectedDiscipline.unit === Unit.DISTANCE ? 'Odległość' : 
                    selectedDiscipline.unit === Unit.HEIGHT ? 'Wysokość' : 'Punkty'
                  }
                </p>
              </div>
            </div>
            {watchedGender && watchedCategory && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm font-medium">Nazwa konkurencji:</p>
                <p className="text-sm text-blue-600">
                  {generateEventName(selectedDiscipline, watchedGender, watchedCategory)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
          <Label htmlFor="category">Kategoria *</Label>
          <Select onValueChange={(value) => setValue('category', value as Category)}>
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
          <Label htmlFor="maxParticipants">Maksymalna liczba uczestników</Label>
          <Input
            id="maxParticipants"
            type="number"
            min="1"
            {...register('maxParticipants', { valueAsNumber: true })}
            placeholder="100"
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
          {isSubmitting ? 'Tworzenie...' : 'Utwórz konkurencję'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}