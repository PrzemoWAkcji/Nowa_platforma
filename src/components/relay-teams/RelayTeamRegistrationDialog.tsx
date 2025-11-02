"use client";

import { Button } from "@/components/ui/button";
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
import { useEvents } from "@/hooks/useEvents";
import { useRegisterRelayTeamForEvent } from "@/hooks/useRelayTeams";
import { CreateRelayTeamRegistrationForm, EventType, RelayTeam } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Trophy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const registrationSchema = z.object({
  eventId: z.string().min(1, "Wybierz konkurencję"),
  seedTime: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return /^\d{1,2}:\d{2}\.\d{2}$/.test(val);
    }, "Czas musi być w formacie MM:SS.CC (np. 3:25.45)"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RelayTeamRegistrationDialogProps {
  team: RelayTeam;
  trigger?: React.ReactNode;
}

export function RelayTeamRegistrationDialog({
  team,
  trigger,
}: RelayTeamRegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: events } = useEvents();
  const registerTeam = useRegisterRelayTeamForEvent();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      eventId: "",
      seedTime: "",
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      const formData: CreateRelayTeamRegistrationForm = {
        teamId: team.id,
        eventId: data.eventId,
        seedTime: data.seedTime || undefined,
      };

      await registerTeam.mutateAsync(formData);
      toast.success("Zespół został zarejestrowany do konkurencji");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Błąd podczas rejestracji zespołu"
      );
    }
  };

  // Filtruj tylko konkurencje sztafetowe z tych samych zawodów
  const relayEvents =
    events?.filter(
      (event) =>
        event.type === EventType.RELAY &&
        event.competitionId === team.competitionId
    ) || [];

  // Sprawdź które konkurencje są już zarejestrowane
  const registeredEventIds =
    team.registrations?.map((reg) => reg.eventId) || [];
  const availableEvents = relayEvents.filter(
    (event) => !registeredEventIds.includes(event.id)
  );

  // Sprawdź czy zespół ma wystarczającą liczbę członków
  const mainMembersCount =
    team.members?.filter((m) => !m.isReserve).length || 0;
  const canRegister = mainMembersCount >= 4;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button disabled={!canRegister || availableEvents.length === 0}>
            <Trophy className="h-4 w-4 mr-2" />
            Zarejestruj do konkurencji
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rejestracja zespołu do konkurencji</DialogTitle>
          <DialogDescription>
            Zarejestruj zespół &quot;{team.name}&quot; do konkurencji
            sztafetowej.
          </DialogDescription>
        </DialogHeader>

        {!canRegister ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Uwaga:</strong> Zespół musi mieć co najmniej 4
              podstawowych członków, aby móc być zarejestrowany do konkurencji.
            </p>
          </div>
        ) : availableEvents.length === 0 ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Brak dostępnych konkurencji sztafetowych do rejestracji lub zespół
              jest już zarejestrowany do wszystkich dostępnych konkurencji.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konkurencja *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz konkurencję sztafetową" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name} ({event.gender} • {event.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Czas zgłoszeniowy (opcjonalnie)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="np. 3:25.45" {...field} />
                    </FormControl>
                    <p className="text-xs text-gray-600">
                      Format: MM:SS.CC (minuty:sekundy.setne)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={registerTeam.isPending}>
                  {registerTeam.isPending
                    ? "Rejestrowanie..."
                    : "Zarejestruj zespół"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
