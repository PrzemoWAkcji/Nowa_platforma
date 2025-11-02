"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddRelayTeamResult,
  useRelayTeamEventRegistrations,
  useRelayTeamEventResults,
} from "@/hooks/useRelayTeams";
import { CreateRelayTeamResultForm, Event } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Medal, Plus, Trophy, Wind } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const resultSchema = z.object({
  teamId: z.string().min(1, "Wybierz zespół"),
  result: z
    .string()
    .min(1, "Wynik jest wymagany")
    .regex(/^\d{1,2}:\d{2}\.\d{2}$/, "Wynik musi być w formacie MM:SS.CC"),
  position: z.number().min(1).optional(),
  points: z.number().min(0).optional(),
  wind: z.string().optional(),
  reaction: z.string().optional(),
  notes: z.string().optional(),
  isValid: z.boolean().optional(),
  isDNF: z.boolean().optional(),
  isDNS: z.boolean().optional(),
  isDQ: z.boolean().optional(),
  isNationalRecord: z.boolean().optional(),
  isWorldRecord: z.boolean().optional(),
});

type ResultFormData = z.infer<typeof resultSchema>;

interface RelayResultsManagerProps {
  event: Event;
}

export function RelayResultsManager({ event }: RelayResultsManagerProps) {
  const [addResultOpen, setAddResultOpen] = useState(false);
  const { data: registrations } = useRelayTeamEventRegistrations(event.id);
  const {
    data: results,
    isLoading,
    error,
  } = useRelayTeamEventResults(event.id);
  const addResult = useAddRelayTeamResult();

  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      teamId: "",
      result: "",
    },
  });

  const onSubmit = async (data: ResultFormData) => {
    try {
      const formData: CreateRelayTeamResultForm = {
        ...data,
        eventId: event.id,
      };

      await addResult.mutateAsync({ eventId: event.id, data: formData });
      toast.success("Wynik został dodany");
      setAddResultOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Błąd podczas dodawania wyniku"
      );
    }
  };

  // Zespoły które nie mają jeszcze wyników
  const teamsWithoutResults =
    registrations?.filter(
      (reg: any) =>
        !results?.some((result: any) => result.teamId === reg.teamId)
    ) || [];

  const sortedResults =
    results?.sort((a: any, b: any) => {
      if (a.position && b.position) return a.position - b.position;
      if (a.position && !b.position) return -1;
      if (!a.position && b.position) return 1;
      return a.result.localeCompare(b.result);
    }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Wyniki - {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Ładowanie wyników...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Wyniki - {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Błąd podczas ładowania wyników</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Wyniki - {event.name}
          </CardTitle>
          <Dialog open={addResultOpen} onOpenChange={setAddResultOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={teamsWithoutResults.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj wynik
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Dodaj wynik zespołu</DialogTitle>
                <DialogDescription>
                  Wprowadź wynik zespołu sztafetowego w konkurencji {event.name}
                  .
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zespół *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz zespół" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamsWithoutResults.map((registration: any) => (
                              <SelectItem
                                key={registration.teamId}
                                value={registration.teamId}
                              >
                                {registration.team?.name || "Nieznany zespół"}
                                {registration.team?.club &&
                                  ` (${registration.team.club})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wynik *</FormLabel>
                          <FormControl>
                            <Input placeholder="np. 3:25.45" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Miejsce</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="1, 2, 3..."
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="wind"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wiatr</FormLabel>
                          <FormControl>
                            <Input placeholder="np. +1.2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Punkty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Uwagi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Dodatkowe informacje..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="isDNF"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              DNF (nie ukończył)
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isDNS"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              DNS (nie wystartował)
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isDQ"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              DQ (dyskwalifikacja)
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="isNationalRecord"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              Rekord kraju
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isWorldRecord"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              Rekord świata
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddResultOpen(false)}
                    >
                      Anuluj
                    </Button>
                    <Button type="submit" disabled={addResult.isPending}>
                      {addResult.isPending ? "Dodawanie..." : "Dodaj wynik"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-gray-600">
          {event.gender} • {event.category}
        </p>
      </CardHeader>
      <CardContent>
        {sortedResults.length > 0 ? (
          <div className="space-y-4">
            {sortedResults.map((result: any) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {result.position && (
                      <div className="flex items-center">
                        {result.position <= 3 ? (
                          <Medal
                            className={`h-6 w-6 ${
                              result.position === 1
                                ? "text-yellow-500"
                                : result.position === 2
                                  ? "text-gray-400"
                                  : "text-amber-600"
                            }`}
                          />
                        ) : (
                          <Badge
                            variant="outline"
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                          >
                            {result.position}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {result.team?.name || "Nieznany zespół"}
                      </h3>
                      {result.team?.club && (
                        <p className="text-sm text-gray-600">
                          {result.team.club}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {result.isDNF || result.isDNS || result.isDQ ? (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span className="font-semibold">
                            {result.isDNF && "DNF"}
                            {result.isDNS && "DNS"}
                            {result.isDQ && "DQ"}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-xl">
                          {result.result}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      {result.wind && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Wind className="h-3 w-3 mr-1" />
                          {result.wind}
                        </div>
                      )}
                      {result.points && (
                        <Badge variant="secondary">{result.points} pkt</Badge>
                      )}
                    </div>

                    {(result.isNationalRecord || result.isWorldRecord) && (
                      <div className="flex space-x-1 mt-2">
                        {result.isWorldRecord && (
                          <Badge className="bg-yellow-500 text-xs">WR</Badge>
                        )}
                        {result.isNationalRecord && (
                          <Badge className="bg-red-500 text-xs">NR</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {result.notes && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{result.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak wyników</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
