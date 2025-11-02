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
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCreateRegistration } from '@/hooks/useRegistrations';
import { useCompetitions } from '@/hooks/useCompetitions';
import { useAthletes } from '@/hooks/useAthletes';
import { useEvents } from '@/hooks/useEvents';
import { RegistrationStatus, PaymentStatus } from '@/types';

const registrationSchema = z.object({
  athleteId: z.string().min(1, 'Zawodnik jest wymagany'),
  competitionId: z.string().min(1, 'Zawody są wymagane'),
  eventIds: z.array(z.string()).min(1, 'Wybierz przynajmniej jedną konkurencję'),
  seedTime: z.string().optional(),
  paymentAmount: z.number().optional(),
  bibNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(RegistrationStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const statusLabels = {
  [RegistrationStatus.PENDING]: 'Oczekująca',
  [RegistrationStatus.CONFIRMED]: 'Potwierdzona',
  [RegistrationStatus.CANCELLED]: 'Anulowana',
  [RegistrationStatus.REJECTED]: 'Odrzucona',
  [RegistrationStatus.WAITLIST]: 'Lista oczekujących',
};

const paymentStatusLabels = {
  [PaymentStatus.PENDING]: 'Oczekująca',
  [PaymentStatus.PROCESSING]: 'Przetwarzana',
  [PaymentStatus.COMPLETED]: 'Opłacona',
  [PaymentStatus.FAILED]: 'Nieudana',
  [PaymentStatus.REFUNDED]: 'Zwrócona',
};

export default function CreateRegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  
  const createRegistration = useCreateRegistration();
  const { data: competitions } = useCompetitions();
  const { data: athletes } = useAthletes();
  const { data: allEvents } = useEvents();

  // Filter events by selected competition
  const availableEvents = allEvents?.filter(event => 
    event.competitionId === selectedCompetitionId
  ) || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      status: RegistrationStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      eventIds: [],
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      await createRegistration.mutateAsync({
        ...data,
        eventIds: selectedEventIds,
        paymentAmount: data.paymentAmount || undefined,
      });
      router.push('/registrations');
    } catch (error) {
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleCompetitionChange = (competitionId: string) => {
    setSelectedCompetitionId(competitionId);
    setSelectedEventIds([]);
    setValue('competitionId', competitionId);
    setValue('eventIds', []);
  };

  const handleEventToggle = (eventId: string, checked: boolean) => {
    const newEventIds = checked 
      ? [...selectedEventIds, eventId]
      : selectedEventIds.filter(id => id !== eventId);
    
    setSelectedEventIds(newEventIds);
    setValue('eventIds', newEventIds);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nowa rejestracja</h1>
          <p className="text-gray-600">Zarejestruj zawodnika na zawody</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Rejestracja na zawody</CardTitle>
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
                            {athlete.firstName} {athlete.lastName}
                            {athlete.club && ` (${athlete.club})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.athleteId && (
                      <p className="text-sm text-red-600 mt-1">{errors.athleteId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="competitionId">Zawody *</Label>
                    <Select onValueChange={handleCompetitionChange}>
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
                </div>
              </div>

              {/* Event Selection */}
              {selectedCompetitionId && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Konkurencje *</h3>
                  <p className="text-sm text-gray-600">Wybierz konkurencje, w których ma wystartować zawodnik</p>
                  
                  {availableEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableEvents.map((event) => (
                        <div key={event.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Checkbox
                            id={`event-${event.id}`}
                            checked={selectedEventIds.includes(event.id)}
                            onCheckedChange={(checked) => handleEventToggle(event.id, !!checked)}
                          />
                          <Label htmlFor={`event-${event.id}`} className="flex-1">
                            <div className="font-medium">{event.name}</div>
                            <div className="text-sm text-gray-600">
                              {event.gender} • {event.category}
                              {event.maxParticipants && ` • Max: ${event.maxParticipants}`}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Brak dostępnych konkurencji dla wybranych zawodów</p>
                  )}
                  
                  {errors.eventIds && (
                    <p className="text-sm text-red-600">{errors.eventIds.message}</p>
                  )}
                </div>
              )}

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dodatkowe informacje</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="seedTime">Czas kwalifikacyjny</Label>
                    <Input
                      id="seedTime"
                      {...register('seedTime')}
                      placeholder="np. 10.50, 2:15.30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentAmount">Opłata startowa (PLN)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      {...register('paymentAmount', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bibNumber">Numer startowy</Label>
                    <Input
                      id="bibNumber"
                      {...register('bibNumber')}
                      placeholder="np. 123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status rejestracji</Label>
                    <Select onValueChange={(value) => setValue('status', value as RegistrationStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="paymentStatus">Status płatności</Label>
                    <Select onValueChange={(value) => setValue('paymentStatus', value as PaymentStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz status płatności" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paymentStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Uwagi</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Dodatkowe informacje o rejestracji"
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Rejestrowanie...' : 'Zarejestruj'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}