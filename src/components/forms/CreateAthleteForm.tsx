'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAthlete } from '@/hooks/useAthletes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// import { useAuthStore } from '@/store/authStore'; // Obecnie nieużywane
import { Category, Gender } from '@/types';

const athleteSchema = z.object({
  firstName: z.string().min(1, 'Imię jest wymagane'),
  lastName: z.string().min(1, 'Nazwisko jest wymagane'),
  dateOfBirth: z.string().min(1, 'Data urodzenia jest wymagana'),
  gender: z.nativeEnum(Gender),
  club: z.string().optional(),
  category: z.nativeEnum(Category),
  nationality: z.string().optional(),
  classification: z.string().optional(),
  isParaAthlete: z.boolean().optional(),
});

type AthleteFormData = z.infer<typeof athleteSchema>;

const genderLabels = {
  [Gender.MALE]: 'Mężczyzna',
  [Gender.FEMALE]: 'Kobieta',
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

interface CreateAthleteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateAthleteForm({ onSuccess, onCancel }: CreateAthleteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { user } = useAuthStore(); // Obecnie nieużywane
  const createAthlete = useCreateAthlete();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AthleteFormData>({
    resolver: zodResolver(athleteSchema),
    defaultValues: {
      isParaAthlete: false,
    },
  });

  const onSubmit = async (data: AthleteFormData) => {
    setIsSubmitting(true);
    try {
      await createAthlete.mutateAsync({
        ...data,
        isParaAthlete: data.isParaAthlete || false,
        // TODO: Dodaj coachId do typu CreateAthleteForm jeśli potrzebne
      });
      onSuccess?.();
    } catch (error) {
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Dodaj nowego zawodnika</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dane osobowe</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Imię *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Jan"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Nazwisko *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Kowalski"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Data urodzenia *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>
              )}
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

            <div>
              <Label htmlFor="nationality">Narodowość</Label>
              <Input
                id="nationality"
                {...register('nationality')}
                placeholder="np. Polska"
              />
            </div>
          </div>

          {/* Club and Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Klub i klasyfikacja</h3>
            
            <div>
              <Label htmlFor="club">Klub</Label>
              <Input
                id="club"
                {...register('club')}
                placeholder="np. AZS Warszawa"
              />
            </div>

            <div>
              <Label htmlFor="classification">Klasyfikacja</Label>
              <Input
                id="classification"
                {...register('classification')}
                placeholder="np. T54, F20 (dla para-atletów)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isParaAthlete"
                type="checkbox"
                {...register('isParaAthlete')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isParaAthlete">Para-atleta</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Dodawanie...' : 'Dodaj zawodnika'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}