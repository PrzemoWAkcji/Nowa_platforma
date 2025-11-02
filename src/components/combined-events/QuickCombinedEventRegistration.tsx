'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAthletes } from '@/hooks/useAthletes';
import { api } from '@/lib/api';
import { Trophy, AlertCircle, Users, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  eventType: z.enum(['PENTATHLON_U16_MALE', 'PENTATHLON_U16_FEMALE', 'PENTATHLON', 'DECATHLON', 'HEPTATHLON'], {
    required_error: 'Wybierz typ wieloboju'
  }),
  athleteIds: z.array(z.string()).min(1, 'Wybierz przynajmniej jednego zawodnika'),
  gender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Wybierz płeć'
  }),
  createSeparateEvents: z.boolean().default(false)
});

interface QuickCombinedEventRegistrationProps {
  competitionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EVENT_TYPE_OPTIONS = [
  { 
    value: 'PENTATHLON_U16_MALE', 
    label: 'Pięciobój U16 chłopcy', 
    gender: 'MALE',
    description: '110m ppł, Skok w dal, Kula 5kg, Skok wzwyż, 1000m',
    disciplines: ['110m ppł', 'Skok w dal', 'Kula 5kg', 'Skok wzwyż', '1000m']
  },
  { 
    value: 'PENTATHLON_U16_FEMALE', 
    label: 'Pięciobój U16 dziewczęta', 
    gender: 'FEMALE',
    description: '80m ppł, Skok wzwyż, Kula 3kg, Skok w dal, 600m',
    disciplines: ['80m ppł', 'Skok wzwyż', 'Kula 3kg', 'Skok w dal', '600m']
  },
  { 
    value: 'PENTATHLON', 
    label: 'Pięciobój (indoor)', 
    gender: 'BOTH',
    description: '60m ppł, Skok wzwyż, Kula, Skok w dal, 800m',
    disciplines: ['60m ppł', 'Skok wzwyż', 'Kula', 'Skok w dal', '800m']
  },
  { 
    value: 'DECATHLON', 
    label: 'Dziesięciobój', 
    gender: 'MALE',
    description: 'Oficjalny 10-bój męski',
    disciplines: ['100m', 'Skok w dal', 'Kula', 'Skok wzwyż', '400m', '110m ppł', 'Dysk', 'Tyczka', 'Oszczep', '1500m']
  },
  { 
    value: 'HEPTATHLON', 
    label: 'Siedmiobój', 
    gender: 'FEMALE',
    description: 'Oficjalny 7-bój żeński',
    disciplines: ['100m ppł', 'Skok wzwyż', 'Kula', '200m', 'Skok w dal', 'Oszczep', '800m']
  }
];

export function QuickCombinedEventRegistration({ 
  competitionId, 
  onSuccess, 
  onCancel 
}: QuickCombinedEventRegistrationProps) {
  const { data: athletes, refetch: getAthletes } = useAthletes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: undefined,
      athleteIds: [],
      gender: undefined,
      createSeparateEvents: false
    }
  });

  useEffect(() => {
    getAthletes();
  }, [getAthletes]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/combined-events-registration/bulk-register', {
        ...values,
        competitionId
      });

      const result = response.data;
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`Zarejestrowano ${result.successful.length} z ${result.summary.total} zawodników. ${result.errors.length} błędów.`);
        console.warn('Błędy rejestracji:', result.errors);
      } else {
        toast.success(`Pomyślnie zarejestrowano ${result.successful.length} zawodników na wielobój!`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Błąd podczas rejestracji zawodników';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType);
    form.setValue('eventType', eventType as any);
    
    // Automatycznie ustaw płeć dla niektórych wielobojów
    const eventOption = EVENT_TYPE_OPTIONS.find(opt => opt.value === eventType);
    if (eventOption && eventOption.gender !== 'BOTH') {
      form.setValue('gender', eventOption.gender as 'MALE' | 'FEMALE');
    }
    
    // Wyczyść wybór zawodników przy zmianie typu
    setSelectedAthletes([]);
    form.setValue('athleteIds', []);
  };

  const handleAthleteToggle = (athleteId: string) => {
    const newSelection = selectedAthletes.includes(athleteId)
      ? selectedAthletes.filter(id => id !== athleteId)
      : [...selectedAthletes, athleteId];
    
    setSelectedAthletes(newSelection);
    form.setValue('athleteIds', newSelection);
  };

  const selectAllAthletes = () => {
    const filteredAthletes = getFilteredAthletes();
    const allIds = filteredAthletes.map(a => a.id);
    setSelectedAthletes(allIds);
    form.setValue('athleteIds', allIds);
  };

  const clearSelection = () => {
    setSelectedAthletes([]);
    form.setValue('athleteIds', []);
  };

  const getFilteredAthletes = () => {
    if (!athletes || !selectedEventType) return [];
    
    const eventOption = EVENT_TYPE_OPTIONS.find(opt => opt.value === selectedEventType);
    if (!eventOption || eventOption.gender === 'BOTH') return athletes;
    
    return athletes.filter(athlete => athlete.gender === eventOption.gender);
  };

  const filteredAthletes = getFilteredAthletes();
  const selectedEventOption = EVENT_TYPE_OPTIONS.find(opt => opt.value === selectedEventType);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Szybka rejestracja na wielobój
        </CardTitle>
        <p className="text-sm text-gray-600">
          Łatwo dodaj zawodników do pięcioboju lub innych wielobojów
        </p>
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
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
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
                    disabled={selectedEventType === 'DECATHLON' || selectedEventType === 'HEPTATHLON' || selectedEventType === 'PENTATHLON_U16_MALE' || selectedEventType === 'PENTATHLON_U16_FEMALE'}
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

            {/* Opcje dodatkowe */}
            <FormField
              control={form.control}
              name="createSeparateEvents"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Utwórz również osobne konkurencje
                    </FormLabel>
                    <p className="text-sm text-gray-600">
                      Oprócz wieloboju, utworzy osobne konkurencje dla każdej dyscypliny
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Informacje o wieloboju */}
            {selectedEventOption && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  {selectedEventOption.label}
                </h4>
                <div className="text-sm text-blue-800">
                  <p className="mb-2">Dyscypliny ({selectedEventOption.disciplines.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEventOption.disciplines.map((discipline, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {discipline}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Wybór zawodników */}
            {selectedEventType && (
              <FormField
                control={form.control}
                name="athleteIds"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Zawodnicy ({filteredAthletes.length} dostępnych)
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAllAthletes}
                          disabled={filteredAthletes.length === 0}
                        >
                          Zaznacz wszystkich
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                          disabled={selectedAthletes.length === 0}
                        >
                          Wyczyść
                        </Button>
                      </div>
                    </FormLabel>
                    
                    {selectedAthletes.length > 0 && (
                      <div className="mb-3">
                        <Badge variant="default">
                          Wybrano: {selectedAthletes.length}
                        </Badge>
                      </div>
                    )}

                    <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                      {filteredAthletes.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Brak dostępnych zawodników dla wybranego wieloboju
                        </p>
                      ) : (
                        filteredAthletes.map((athlete) => (
                          <div
                            key={athlete.id}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => handleAthleteToggle(athlete.id)}
                          >
                            <Checkbox
                              checked={selectedAthletes.includes(athlete.id)}
                              onChange={() => handleAthleteToggle(athlete.id)}
                            />
                            <div className="flex-1">
                              <span className="font-medium">
                                {athlete.firstName} {athlete.lastName}
                              </span>
                              {athlete.club && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({athlete.club})
                                </span>
                              )}
                              <div className="text-xs text-gray-400">
                                {athlete.category} • {athlete.gender === 'MALE' ? 'M' : 'K'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Przyciski */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={loading || selectedAthletes.length === 0} 
                className="flex-1"
              >
                {loading ? 'Rejestrowanie...' : `Zarejestruj ${selectedAthletes.length} zawodników`}
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