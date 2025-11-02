"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Loader2,
  Settings,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  combinedEventIds: z
    .array(z.string())
    .min(1, "Wybierz przynajmniej jedną konkurencję wielobojową"),
  createRegistrations: z.boolean().default(true),
  overwriteExisting: z.boolean().default(false),
});

interface CombinedEventForGeneration {
  id: string;
  name: string;
  gender: string;
  category: string;
  athletesCount: number;
  athletes: Array<{
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    category: string;
    club?: string;
  }>;
  canGenerate: boolean;
  estimatedEventType: string | null;
}

interface GenerateIndividualEventsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
  onSuccess?: () => void;
}

export function GenerateIndividualEventsDialog({
  isOpen,
  onClose,
  competitionId,
  onSuccess,
}: GenerateIndividualEventsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combinedEvents, setCombinedEvents] = useState<
    CombinedEventForGeneration[]
  >([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [generationResult, setGenerationResult] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      combinedEventIds: [],
      createRegistrations: true,
      overwriteExisting: false,
    },
  });

  // Pobierz konkurencje wielobojowe przy otwarciu dialogu
  useEffect(() => {
    if (isOpen && competitionId) {
      fetchCombinedEvents();
    }
  }, [isOpen, competitionId]);

  const fetchCombinedEvents = async () => {
    setLoadingEvents(true);
    setError(null);

    try {
      const response = await api.get(
        `/combined-events-registration/competition/${competitionId}/combined-events-for-generation`
      );
      setCombinedEvents(response.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Błąd podczas pobierania konkurencji wielobojowych";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingEvents(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    setGenerationResult(null);

    try {
      const response = await api.post(
        "/combined-events-registration/generate-individual-events",
        {
          ...values,
          competitionId,
        }
      );

      const result = response.data;
      setGenerationResult(result);

      if (result.errors && result.errors.length > 0) {
        toast.warning(
          `Wygenerowano konkurencje z ${result.errors.length} błędami. Sprawdź szczegóły.`
        );
      } else {
        toast.success(result.message);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Błąd podczas generowania konkurencji";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEventToggle = (eventId: string) => {
    const newSelection = selectedEvents.includes(eventId)
      ? selectedEvents.filter((id) => id !== eventId)
      : [...selectedEvents, eventId];

    setSelectedEvents(newSelection);
    form.setValue("combinedEventIds", newSelection);
  };

  const selectAllEvents = () => {
    const availableEvents = combinedEvents
      .filter((e) => e.canGenerate)
      .map((e) => e.id);
    setSelectedEvents(availableEvents);
    form.setValue("combinedEventIds", availableEvents);
  };

  const clearSelection = () => {
    setSelectedEvents([]);
    form.setValue("combinedEventIds", []);
  };

  const handleClose = () => {
    setGenerationResult(null);
    setSelectedEvents([]);
    setError(null);
    form.reset();
    onClose();
  };

  const availableEvents = combinedEvents.filter((e) => e.canGenerate);
  const unavailableEvents = combinedEvents.filter((e) => !e.canGenerate);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generuj konkurencje składowe wieloboju
          </DialogTitle>
          <DialogDescription>
            Automatycznie utwórz konkurencje składowe na podstawie list
            startowych wielobojów
          </DialogDescription>
        </DialogHeader>

        {loadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Ładowanie konkurencji wielobojowych...</span>
          </div>
        ) : error && !generationResult ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : generationResult ? (
          // Wyniki generowania
          <div className="space-y-4">
            <Alert
              variant={
                generationResult.errors.length > 0 ? "destructive" : "default"
              }
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{generationResult.message}</AlertDescription>
            </Alert>

            {/* Podsumowanie */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {generationResult.summary.totalCombinedEvents}
                  </div>
                  <div className="text-sm text-gray-600">
                    Przetworzonych wielobojów
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {generationResult.summary.totalCreatedEvents}
                  </div>
                  <div className="text-sm text-gray-600">
                    Utworzonych konkurencji
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {generationResult.summary.totalCreatedRegistrations}
                  </div>
                  <div className="text-sm text-gray-600">
                    Utworzonych rejestracji
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {generationResult.summary.totalAthletes}
                  </div>
                  <div className="text-sm text-gray-600">Zawodników</div>
                </CardContent>
              </Card>
            </div>

            {/* Szczegóły przetworzonych wydarzeń */}
            {generationResult.processedEvents.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Przetworzone wieloboje:</h4>
                <div className="space-y-2">
                  {generationResult.processedEvents.map(
                    (event: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                {event.combinedEventName}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {event.athletesCount} zawodników →{" "}
                                {event.createdEvents.length} konkurencji
                              </p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Błędy */}
            {generationResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-red-600">Błędy:</h4>
                <div className="space-y-2">
                  {generationResult.errors.map((error: any, index: number) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{error.eventName || error.athleteName}:</strong>{" "}
                        {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>Zamknij</Button>
            </div>
          </div>
        ) : (
          // Formularz
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dostępne konkurencje wielobojowe */}
              {availableEvents.length > 0 && (
                <FormField
                  control={form.control}
                  name="combinedEventIds"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Konkurencje wielobojowe ({availableEvents.length}{" "}
                          dostępnych)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={selectAllEvents}
                            disabled={availableEvents.length === 0}
                          >
                            Zaznacz wszystkie
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearSelection}
                            disabled={selectedEvents.length === 0}
                          >
                            Wyczyść
                          </Button>
                        </div>
                      </FormLabel>

                      {selectedEvents.length > 0 && (
                        <div className="mb-3">
                          <Badge variant="default">
                            Wybrano: {selectedEvents.length}
                          </Badge>
                        </div>
                      )}

                      <div className="space-y-3">
                        {availableEvents.map((event) => (
                          <Card
                            key={event.id}
                            className={`cursor-pointer transition-colors ${
                              selectedEvents.includes(event.id)
                                ? "ring-2 ring-blue-500 bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleEventToggle(event.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={selectedEvents.includes(event.id)}
                                  onChange={() => handleEventToggle(event.id)}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">
                                      {event.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {event.gender === "MALE"
                                          ? "Mężczyźni"
                                          : "Kobiety"}
                                      </Badge>
                                      <Badge variant="secondary">
                                        {event.category}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {event.athletesCount} zawodników
                                    </span>
                                    {event.estimatedEventType && (
                                      <span className="flex items-center gap-1">
                                        <ArrowRight className="h-3 w-3" />
                                        {event.estimatedEventType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Konkurencje bez zawodników */}
              {unavailableEvents.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-600 mb-3">
                    Konkurencje bez zawodników ({unavailableEvents.length})
                  </h4>
                  <div className="space-y-2">
                    {unavailableEvents.map((event) => (
                      <Card key={event.id} className="opacity-50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{event.name}</span>
                            <Badge variant="outline" className="text-gray-500">
                              Brak zawodników
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Opcje */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="createRegistrations"
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
                          <Users className="h-4 w-4" />
                          Utwórz rejestracje na konkurencje składowe
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          Automatycznie zarejestruje wszystkich zawodników z
                          wieloboju na poszczególne konkurencje
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overwriteExisting"
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
                          Nadpisz istniejące konkurencje
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          Jeśli konkurencja o tej samej nazwie już istnieje,
                          zostanie zaktualizowana
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Przyciski */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  disabled={loading || selectedEvents.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generowanie...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generuj konkurencje
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
