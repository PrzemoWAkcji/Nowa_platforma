"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCompetition } from "@/hooks/useCompetitions";
import { Competition, CompetitionStatus, CompetitionType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const competitionSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Data rozpoczęcia jest wymagana"),
  endDate: z.string().min(1, "Data zakończenia jest wymagana"),
  location: z.string().min(1, "Lokalizacja jest wymagana"),
  venue: z.string().optional(),
  type: z.nativeEnum(CompetitionType),
  status: z.nativeEnum(CompetitionStatus).optional(),
  registrationStartDate: z.string().optional(),
  registrationEndDate: z.string().optional(),
  maxParticipants: z.number().optional(),
  registrationFee: z.number().optional(),
  isPublic: z.boolean().optional(),
  allowLateRegistration: z.boolean().optional(),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

const competitionTypeLabels = {
  [CompetitionType.OUTDOOR]: "Stadion (outdoor)",
  [CompetitionType.INDOOR]: "Hala (indoor)",
  [CompetitionType.ROAD]: "Bieg uliczny",
  [CompetitionType.CROSS_COUNTRY]: "Przełaj",
  [CompetitionType.TRAIL]: "Bieg górski",
  [CompetitionType.DUATHLON]: "Duathlon",
  [CompetitionType.TRIATHLON]: "Triathlon",
  [CompetitionType.MULTI_EVENT]: "Wielobój",
};

const competitionStatusLabels = {
  [CompetitionStatus.DRAFT]: "Szkic",
  [CompetitionStatus.PUBLISHED]: "Opublikowane",
  [CompetitionStatus.REGISTRATION_OPEN]: "Rejestracja otwarta",
  [CompetitionStatus.REGISTRATION_CLOSED]: "Rejestracja zamknięta",
  [CompetitionStatus.ONGOING]: "W trakcie",
  [CompetitionStatus.COMPLETED]: "Zakończone",
  [CompetitionStatus.CANCELLED]: "Anulowane",
};

interface EditCompetitionFormProps {
  competition: Competition;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditCompetitionForm({
  competition,
  onSuccess,
  onCancel,
}: EditCompetitionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateCompetition = useUpdateCompetition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      name: competition.name,
      description: competition.description || "",
      startDate: new Date(competition.startDate).toISOString().slice(0, 16),
      endDate: new Date(competition.endDate).toISOString().slice(0, 16),
      location: competition.location,
      venue: competition.venue || "",
      type: competition.type,
      status: competition.status,
      registrationStartDate: competition.registrationStartDate
        ? new Date(competition.registrationStartDate).toISOString().slice(0, 16)
        : "",
      registrationEndDate: competition.registrationEndDate
        ? new Date(competition.registrationEndDate).toISOString().slice(0, 16)
        : "",
      maxParticipants: competition.maxParticipants || undefined,
      registrationFee: competition.registrationFee
        ? Number(competition.registrationFee)
        : undefined,
      isPublic: competition.isPublic,
      allowLateRegistration: competition.allowLateRegistration,
    },
  });

  const watchedType = watch("type");
  const watchedStatus = watch("status");
  const watchedIsPublic = watch("isPublic");
  const watchedAllowLateRegistration = watch("allowLateRegistration");

  // Set initial values for selects
  useEffect(() => {
    setValue("type", competition.type);
    setValue("status", competition.status);
  }, [competition, setValue]);

  const onSubmit = async (data: CompetitionFormData) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationStartDate: data.registrationStartDate
          ? new Date(data.registrationStartDate).toISOString()
          : undefined,
        registrationEndDate: data.registrationEndDate
          ? new Date(data.registrationEndDate).toISOString()
          : undefined,
        maxParticipants: data.maxParticipants || undefined,
        registrationFee: data.registrationFee || undefined,
      };

      await updateCompetition.mutateAsync({
        id: competition.id,
        data: formattedData,
      });

      toast.success("Zawody zostały zaktualizowane");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Błąd podczas aktualizacji zawodów"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edytuj zawody</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nazwa zawodów *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="np. Mistrzostwa Polski Seniorów"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Opcjonalny opis zawodów"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Data rozpoczęcia *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">Data zakończenia *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Lokalizacja *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="np. Stadion Śląski, Chorzów"
              />
              {errors.location && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="venue">Obiekt</Label>
              <Input
                id="venue"
                {...register("venue")}
                placeholder="np. Stadion Śląski"
              />
            </div>

            <div>
              <Label htmlFor="type">Typ zawodów *</Label>
              <Select
                value={watchedType}
                onValueChange={(value) =>
                  setValue("type", value as CompetitionType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ zawodów" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(competitionTypeLabels).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status zawodów</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) =>
                  setValue("status", value as CompetitionStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz status zawodów" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(competitionStatusLabels).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="maxParticipants">
                Maksymalna liczba uczestników
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                {...register("maxParticipants", { valueAsNumber: true })}
                placeholder="Opcjonalne"
              />
            </div>

            <div>
              <Label htmlFor="registrationStartDate">
                Początek rejestracji
              </Label>
              <Input
                id="registrationStartDate"
                type="datetime-local"
                {...register("registrationStartDate")}
              />
            </div>

            <div>
              <Label htmlFor="registrationEndDate">Koniec rejestracji</Label>
              <Input
                id="registrationEndDate"
                type="datetime-local"
                {...register("registrationEndDate")}
              />
            </div>

            <div>
              <Label htmlFor="registrationFee">Opłata startowa (PLN)</Label>
              <Input
                id="registrationFee"
                type="number"
                min="0"
                step="0.01"
                {...register("registrationFee", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={watchedIsPublic}
                  onCheckedChange={(checked) => setValue("isPublic", !!checked)}
                />
                <Label htmlFor="isPublic">
                  Zawody publiczne (widoczne dla wszystkich)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowLateRegistration"
                  checked={watchedAllowLateRegistration}
                  onCheckedChange={(checked) =>
                    setValue("allowLateRegistration", !!checked)
                  }
                />
                <Label htmlFor="allowLateRegistration">
                  Zezwalaj na późne rejestracje
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
