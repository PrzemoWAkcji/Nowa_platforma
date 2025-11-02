'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCombinedEvents, CombinedEventResult } from '@/hooks/useCombinedEvents';
import { Calculator, Wind, AlertCircle, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  performance: z.string().min(1, 'Wprowadź wynik'),
  wind: z.string().optional()
});

interface EditResultDialogProps {
  discipline: string;
  disciplineLabel: string;
  currentResult?: CombinedEventResult;
  gender: 'MALE' | 'FEMALE';
  open: boolean;
  onClose: () => void;
  onSave: (discipline: string, result: { performance: string; wind?: string }) => void;
}

const PERFORMANCE_EXAMPLES: Record<string, string[]> = {
  '100M': ['10.50', '11.25', '12.00'],
  '110MH': ['13.80', '14.50', '15.20'],
  '100MH': ['13.00', '13.80', '14.50'],
  '80MH': ['11.50', '12.20', '13.00'],
  '200M': ['23.50', '24.80', '26.00'],
  '400M': ['47.50', '50.00', '52.50'],
  '600M': ['1:30.00', '1:40.00', '1:50.00'],
  '800M': ['2:10.00', '2:20.00', '2:30.00'],
  '1000M': ['2:45.00', '3:00.00', '3:15.00'],
  '1500M': ['4:15.30', '4:30.00', '4:45.00'],
  '60M': ['7.20', '7.50', '7.80'],
  '60MH': ['8.00', '8.50', '9.00'],
  'HJ': ['2.15', '1.95', '1.75'],
  'LJ': ['7.45', '6.80', '6.20'],
  'PV': ['5.20', '4.80', '4.40'],
  'SP': ['15.50', '14.00', '12.50'],
  'SP3': ['12.00', '10.50', '9.00'],
  'SP5': ['14.00', '12.50', '11.00'],
  'DT': ['48.00', '42.00', '38.00'],
  'JT': ['65.00', '58.00', '52.00']
};

const WIND_DISCIPLINES = ['100M', '110MH', '100MH', '80MH', '200M', 'LJ'];

export function EditResultDialog({
  discipline,
  disciplineLabel,
  currentResult,
  gender,
  open,
  onClose,
  onSave
}: EditResultDialogProps) {
  const { calculatePoints, validatePerformance, loading } = useCombinedEvents();
  const [calculatedPoints, setCalculatedPoints] = useState<number | null>(null);
  const [isValidPerformance, setIsValidPerformance] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performance: currentResult?.performance || '',
      wind: currentResult?.wind || ''
    }
  });

  const watchedPerformance = form.watch('performance');

  // Oblicz punkty w czasie rzeczywistym
  useEffect(() => {
    if (watchedPerformance && watchedPerformance.length > 0) {
      const debounceTimer = setTimeout(async () => {
        try {
          setError(null);
          
          // Waliduj wynik
          const isValid = await validatePerformance(discipline, watchedPerformance);
          setIsValidPerformance(isValid);
          
          if (isValid) {
            // Oblicz punkty
            const points = await calculatePoints(discipline, watchedPerformance, gender);
            setCalculatedPoints(points);
          } else {
            setCalculatedPoints(null);
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Błąd walidacji');
          setCalculatedPoints(null);
          setIsValidPerformance(false);
        }
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setCalculatedPoints(null);
      setIsValidPerformance(null);
    }
  }, [watchedPerformance, discipline, gender, calculatePoints, validatePerformance]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isValidPerformance) {
      setError('Wprowadź prawidłowy wynik');
      return;
    }

    try {
      const resultData = {
        performance: values.performance,
        wind: values.wind || undefined
      };

      onSave(discipline, resultData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania');
    }
  };

  const handleExampleClick = (example: string) => {
    form.setValue('performance', example);
  };

  const getPerformanceFormat = (discipline: string) => {
    if (discipline.includes('M') && !['HJ', 'LJ', 'PV', 'SP', 'DT', 'JT'].includes(discipline)) {
      return 'Czas (np. 10.50 lub 4:15.30)';
    } else if (['HJ', 'PV'].includes(discipline)) {
      return 'Wysokość w metrach (np. 2.15)';
    } else {
      return 'Odległość w metrach (np. 7.45)';
    }
  };

  const showWindField = WIND_DISCIPLINES.includes(discipline);
  const examples = PERFORMANCE_EXAMPLES[discipline] || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Edytuj wynik - {disciplineLabel}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Wynik */}
          <div className="space-y-2">
            <Label htmlFor="performance">
              Wynik *
              <span className="text-sm text-gray-500 ml-2">
                ({getPerformanceFormat(discipline)})
              </span>
            </Label>
            <Input
              id="performance"
              placeholder="Wprowadź wynik..."
              {...form.register('performance')}
              className={
                isValidPerformance === false ? 'border-red-500' : 
                isValidPerformance === true ? 'border-green-500' : ''
              }
            />
            {form.formState.errors.performance && (
              <p className="text-sm text-red-500">
                {form.formState.errors.performance.message}
              </p>
            )}
          </div>

          {/* Przykłady */}
          {examples.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Przykłady:</Label>
              <div className="flex flex-wrap gap-2">
                {examples.map((example) => (
                  <Button
                    key={example}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Wiatr */}
          {showWindField && (
            <div className="space-y-2">
              <Label htmlFor="wind" className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Wiatr (opcjonalnie)
              </Label>
              <Input
                id="wind"
                placeholder="np. +1.5, -0.8"
                {...form.register('wind')}
              />
              <p className="text-xs text-gray-500">
                Wprowadź prędkość wiatru z + lub - (np. +1.5, -0.8)
              </p>
            </div>
          )}

          {/* Podgląd punktów */}
          {watchedPerformance && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                {isValidPerformance === true ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Prawidłowy
                  </Badge>
                ) : isValidPerformance === false ? (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Nieprawidłowy
                  </Badge>
                ) : (
                  <Badge variant="secondary">Sprawdzanie...</Badge>
                )}
              </div>
              
              {calculatedPoints !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Punkty:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {calculatedPoints}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !isValidPerformance}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz wynik'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}