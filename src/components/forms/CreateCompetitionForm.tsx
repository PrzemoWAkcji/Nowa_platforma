"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCompetition } from "@/hooks/useCompetitions";
import { useToast } from "@/hooks/useToast";
import { CompetitionType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const competitionSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Data rozpoczęcia jest wymagana"),
  endDate: z.string().min(1, "Data zakończenia jest wymagana"),
  location: z.string().min(1, "Lokalizacja jest wymagana"),
  venue: z.string().optional(),
  type: z.nativeEnum(CompetitionType),
  registrationStartDate: z.string().optional(),
  registrationEndDate: z.string().optional(),
  maxParticipants: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? undefined : num;
    }),
  registrationFee: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? undefined : num;
    }),
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

interface CreateCompetitionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCompetitionForm({
  onSuccess,
  onCancel,
}: CreateCompetitionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createCompetition = useCreateCompetition();
  const { competitionMessages } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      isPublic: true,
      allowLateRegistration: false,
    },
  });

  // Debug: log errors
  console.log("🔍 Form errors:", errors);
  console.log("🔍 Form errors keys:", Object.keys(errors));
  Object.entries(errors).forEach(([key, error]) => {
    console.log(`🔍 Error ${key}:`, error?.message);
  });

  const onSubmit = async (data: CompetitionFormData) => {
    console.log("🚀 Form submitted with data:", data);

    // Sprawdź token przed wysłaniem
    const authStorage = localStorage.getItem("auth-storage");
    console.log("🔑 Auth storage:", authStorage);
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log("🔑 Token available:", !!parsed.state?.token);
      } catch (e) {
        console.error("🔑 Error parsing auth storage:", e);
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        // Konwertuj daty do formatu ISO 8601
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationStartDate:
          data.registrationStartDate && data.registrationStartDate.trim()
            ? new Date(data.registrationStartDate).toISOString()
            : undefined,
        registrationEndDate:
          data.registrationEndDate && data.registrationEndDate.trim()
            ? new Date(data.registrationEndDate).toISOString()
            : undefined,
        // maxParticipants i registrationFee są już przekonwertowane przez schemat Zod
      };

      // Usuń pola z wartością undefined, żeby nie były wysyłane do backendu
      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });
      console.log("📤 Sending payload:", payload);
      console.log(
        "📤 maxParticipants type:",
        typeof payload.maxParticipants,
        payload.maxParticipants
      );
      console.log(
        "📤 registrationFee type:",
        typeof payload.registrationFee,
        payload.registrationFee
      );
      const result = await createCompetition.mutateAsync(payload);
      console.log("✅ Competition created successfully:", result);
      competitionMessages.created();
      onSuccess?.();
    } catch (error: any) {
      console.error("❌ Error creating competition:", error);
      console.error("❌ Error details:", {
        response: error?.response,
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Wystąpił błąd podczas tworzenia zawodów. Spróbuj ponownie.";
      setError(errorMessage);
      competitionMessages.error("tworzenia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Utwórz nowe zawody</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Podstawowe informacje</h3>

            <div>
              <Label htmlFor="name">Nazwa zawodów *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="np. Mistrzostwa Polski w Lekkoatletyce"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Opis</Label>
              <textarea
                id="description"
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Opis zawodów..."
              />
            </div>

            <div>
              <Label htmlFor="type">Typ zawodów *</Label>
              <Select
                onValueChange={(value) => {
                  console.log("🔄 Type changed to:", value);
                  setValue("type", value as CompetitionType);
                }}
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
          </div>

          {/* Date and Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data i miejsce</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <Label htmlFor="location">Miasto *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="np. Warszawa"
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
                placeholder="np. Stadion Narodowy"
              />
            </div>
          </div>

          {/* Registration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ustawienia rejestracji</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">
                  Maksymalna liczba uczestników
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  {...register("maxParticipants")}
                  placeholder="700"
                />
              </div>

              <div>
                <Label htmlFor="registrationFee">Opłata startowa (PLN)</Label>
                <Input
                  id="registrationFee"
                  type="number"
                  step="0.01"
                  {...register("registrationFee")}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  {...register("isPublic")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublic">Zawody publiczne</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="allowLateRegistration"
                  type="checkbox"
                  {...register("allowLateRegistration")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="allowLateRegistration">
                  Pozwól na późne rejestracje
                </Label>
              </div>
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
              {isSubmitting ? "Tworzenie..." : "Utwórz zawody"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
