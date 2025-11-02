'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { Settings, AlertCircle, Trophy, Target, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SplitCombinedEventDialogProps {
  combinedEvent: {
    id: string;
    eventType: string;
    athlete: {
      firstName: string;
      lastName: string;
      club?: string;
    };
    results: any[];
  };
  onSuccess?: () => void;
}

const EVENT_DISCIPLINES = {
  'PENTATHLON_U16_MALE': [
    { name: '110m ppł', description: '110m przez płotki' },
    { name: 'Skok w dal', description: 'Skok w dal' },
    { name: 'Kula 5kg', description: 'Pchnięcie kulą 5kg' },
    { name: 'Skok wzwyż', description: 'Skok wzwyż' },
    { name: '1000m', description: 'Bieg na 1000m' }
  ],
  'PENTATHLON_U16_FEMALE': [
    { name: '80m ppł', description: '80m przez płotki' },
    { name: 'Skok wzwyż', description: 'Skok wzwyż' },
    { name: 'Kula 3kg', description: 'Pchnięcie kulą 3kg' },
    { name: 'Skok w dal', description: 'Skok w dal' },
    { name: '600m', description: 'Bieg na 600m' }
  ],
  'PENTATHLON': [
    { name: '60m ppł', description: '60m przez płotki (hala)' },
    { name: 'Skok wzwyż', description: 'Skok wzwyż' },
    { name: 'Kula', description: 'Pchnięcie kulą' },
    { name: 'Skok w dal', description: 'Skok w dal' },
    { name: '800m', description: 'Bieg na 800m' }
  ],
  'DECATHLON': [
    { name: '100m', description: 'Bieg na 100m' },
    { name: 'Skok w dal', description: 'Skok w dal' },
    { name: 'Kula', description: 'Pchnięcie kulą' },
    { name: 'Skok wzwyż', description: 'Skok wzwyż' },
    { name: '400m', description: 'Bieg na 400m' },
    { name: '110m ppł', description: '110m przez płotki' },
    { name: 'Dysk', description: 'Rzut dyskiem' },
    { name: 'Tyczka', description: 'Skok o tyczce' },
    { name: 'Oszczep', description: 'Rzut oszczepem' },
    { name: '1500m', description: 'Bieg na 1500m' }
  ],
  'HEPTATHLON': [
    { name: '100m ppł', description: '100m przez płotki' },
    { name: 'Skok wzwyż', description: 'Skok wzwyż' },
    { name: 'Kula', description: 'Pchnięcie kulą' },
    { name: '200m', description: 'Bieg na 200m' },
    { name: 'Skok w dal', description: 'Skok w dal' },
    { name: 'Oszczep', description: 'Rzut oszczepem' },
    { name: '800m', description: 'Bieg na 800m' }
  ]
};

export function SplitCombinedEventDialog({ combinedEvent, onSuccess }: SplitCombinedEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createRegistrations, setCreateRegistrations] = useState(true);
  const [open, setOpen] = useState(false);

  const disciplines = EVENT_DISCIPLINES[combinedEvent.eventType as keyof typeof EVENT_DISCIPLINES] || [];

  const handleSplit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/combined-events-registration/split/${combinedEvent.id}`, {
        createRegistrations
      });

      const result = response.data;
      
      toast.success(`Pomyślnie utworzono ${result.createdEvents.length} konkurencji z wieloboju!`);
      
      if (result.createdRegistrations.length > 0) {
        toast.info(`Utworzono również ${result.createdRegistrations.length} rejestracji.`);
      }

      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Błąd podczas rozdzielania wieloboju';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Rozdziel na konkurencje
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Rozdziel wielobój na osobne konkurencje
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informacje o wieloboju */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {combinedEvent.eventType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" />
                <span className="font-medium">
                  {combinedEvent.athlete.firstName} {combinedEvent.athlete.lastName}
                </span>
                {combinedEvent.athlete.club && (
                  <Badge variant="secondary">{combinedEvent.athlete.club}</Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Wyniki: {combinedEvent.results.filter(r => r.isValid).length} z {combinedEvent.results.length} dyscyplin</p>
              </div>
            </CardContent>
          </Card>

          {/* Lista dyscyplin */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Dyscypliny do utworzenia ({disciplines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {disciplines.map((discipline, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{discipline.name}</span>
                      <p className="text-sm text-gray-600">{discipline.description}</p>
                    </div>
                    <Badge variant="outline">Konkurencja {index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opcje */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Opcje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="createRegistrations"
                  checked={createRegistrations}
                  onCheckedChange={(checked) => setCreateRegistrations(checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <label 
                    htmlFor="createRegistrations"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Utwórz automatycznie rejestracje
                  </label>
                  <p className="text-sm text-gray-600">
                    Zawodnik zostanie automatycznie zarejestrowany na wszystkie utworzone konkurencje
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ostrzeżenie */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Uwaga:</strong> Ta operacja utworzy {disciplines.length} nowych konkurencji w zawodach. 
              Wielobój pozostanie niezmieniony - będą to dodatkowe konkurencje.
            </AlertDescription>
          </Alert>

          {/* Przyciski */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSplit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Tworzenie...' : `Utwórz ${disciplines.length} konkurencji`}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}