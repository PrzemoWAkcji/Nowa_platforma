'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCombinedEvents, CreateCombinedEventData } from '@/hooks/useCombinedEvents';
import { useAthletes } from '@/hooks/useAthletes';
import { Trophy, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  eventType: z.enum(['DECATHLON', 'HEPTATHLON', 'PENTATHLON', 'PENTATHLON_U16_MALE', 'PENTATHLON_U16_FEMALE'], {
    required_error: 'Wybierz typ wieloboju'
  }),
  athleteId: z.string().min(1, 'Wybierz zawodnika'),
  gender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Wybierz płeć'
  })
});

interface CreateCombinedEventFormProps {
  competitionId: string;
  onSuccess?: (combinedEvent: CreateCombinedEventData) => void;
  onCancel?: () => void;
}

const EVENT_TYPE_OPTIONS = [
  { value: 'DECATHLON', label: '10-bój (Dziesięciobój)', gender: 'MALE' },
  { value: 'HEPTATHLON', label: '7-bój (Siedmiobój)', gender: 'FEMALE' },
  { value: 'PENTATHLON', label: '5-bój (Pięciobój - indoor)', gender: 'BOTH' },
  { value: 'PENTATHLON_U16_MALE', label: '5-bój U16 chłopcy (110m ppł, skok w dal, kula 5kg, skok wzwyż, 1000m)', gender: 'MALE' },
  { value: 'PENTATHLON_U16_FEMALE', label: '5-bój U16 dziewczęta (80m ppł, skok wzwyż, kula 3kg, skok w dal, 600m)', gender: 'FEMALE' }
];

export function CreateCombinedEventForm({ 
  competitionId, 
  onSuccess, 
  onCancel 
}: CreateCombinedEventFormProps) {
  const router = useRouter();
  const { createCombinedEvent, loading, error } = useCombinedEvents();
  const { data: athletes, refetch: getAthletes } = useAthletes();
  const [selectedEventType, setSelectedEventType] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: undefined,
      athleteId: '',
      gender: undefined
    }
  });

  // Pobierz zawodników przy pierwszym renderowaniu
  useState(() => {
    getAthletes();
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data: CreateCombinedEventData = {
        ...values,
        competitionId
      };

      const combinedEvent = await createCombinedEvent(data);
      
      if (onSuccess) {
        onSuccess(combinedEvent);
      } else {
        router.push(`/combined-events/${combinedEvent.id}`);
      }
    } catch {
      // Błąd jest już obsłużony w hook'u
    }
  };

  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType);
    form.setValue('eventType', eventType as 'DECATHLON' | 'HEPTATHLON' | 'PENTATHLON');
    
    // Automatycznie ustaw płeć dla niektórych wielobojów
    const eventOption = EVENT_TYPE_OPTIONS.find(opt => opt.value === eventType);
    if (eventOption && eventOption.gender !== 'BOTH') {
      form.setValue('gender', eventOption.gender as 'MALE' | 'FEMALE');
    }
  };

  const filteredAthletes = athletes?.filter(athlete => {
    if (!selectedEventType) return true;
    
    const eventOption = EVENT_TYPE_OPTIONS.find(opt => opt.value === selectedEventType);
    if (!eventOption || eventOption.gender === 'BOTH') return true;
    
    return athlete.gender === eventOption.gender;
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Utwórz nowy wielobój
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Typ wieloboju */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ wieloboju</FormLabel>
                  <Select 
                    onValueChange={handleEventTypeChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ wieloboju" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Płeć */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Płeć</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={selectedEventType === 'DECATHLON' || selectedEventType === 'HEPTATHLON'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz płeć" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Mężczyźni</SelectItem>
                      <SelectItem value="FEMALE">Kobiety</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zawodnik */}
            <FormField
              control={form.control}
              name="athleteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zawodnik</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz zawodnika" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredAthletes?.map((athlete) => (
                        <SelectItem key={athlete.id} value={athlete.id}>
                          {athlete.firstName} {athlete.lastName}
                          {athlete.club && ` (${athlete.club})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informacje o wieloboju */}
            {selectedEventType && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Informacje o {EVENT_TYPE_OPTIONS.find(opt => opt.value === selectedEventType)?.label}
                </h4>
                <div className="text-sm text-blue-800">
                  {selectedEventType === 'DECATHLON' && (
                    <div>
                      <p className="mb-2">Dyscypliny (10):</p>
                      <p>Dzień 1: 100m, Skok w dal, Pchnięcie kulą, Skok wzwyż, 400m</p>
                      <p>Dzień 2: 110m ppł, Rzut dyskiem, Skok o tyczce, Rzut oszczepem, 1500m</p>
                    </div>
                  )}
                  {selectedEventType === 'HEPTATHLON' && (
                    <div>
                      <p className="mb-2">Dyscypliny (7):</p>
                      <p>Dzień 1: 100m ppł, Skok wzwyż, Pchnięcie kulą, 200m</p>
                      <p>Dzień 2: Skok w dal, Rzut oszczepem, 800m</p>
                    </div>
                  )}
                  {selectedEventType === 'PENTATHLON' && (
                    <div>
                      <p className="mb-2">Dyscypliny (5) - hala:</p>
                      <p>60m ppł, Skok wzwyż, Pchnięcie kulą, Skok w dal, 800m</p>
                    </div>
                  )}
                  {selectedEventType === 'PENTATHLON_U16_MALE' && (
                    <div>
                      <p className="mb-2">Dyscypliny (5) - stadion U16 chłopcy:</p>
                      <p>110m ppł, Skok w dal, Kula 5kg, Skok wzwyż, 1000m</p>
                      <p className="mt-2 text-xs">Według programu minutowego zawodów U16</p>
                    </div>
                  )}
                  {selectedEventType === 'PENTATHLON_U16_FEMALE' && (
                    <div>
                      <p className="mb-2">Dyscypliny (5) - stadion U16 dziewczęta:</p>
                      <p>80m ppł, Skok wzwyż, Kula 3kg, Skok w dal, 600m</p>
                      <p className="mt-2 text-xs">Według programu minutowego zawodów U16</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Przyciski */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Tworzenie...' : 'Utwórz wielobój'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Anuluj
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}