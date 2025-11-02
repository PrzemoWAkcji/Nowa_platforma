"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Save, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCheckPotentialRecord, useCreateRecord } from "@/hooks/useRecords";
import { Category, Gender, RecordLevel, RecordType, Unit } from "@/types";
import Link from "next/link";
import { toast } from "sonner";

const createRecordSchema = z.object({
  type: z.nativeEnum(RecordType),
  level: z.nativeEnum(RecordLevel),
  eventName: z.string().min(1, "Nazwa konkurencji jest wymagana"),
  discipline: z.string().min(1, "Dyscyplina jest wymagana"),
  gender: z.nativeEnum(Gender),
  category: z.nativeEnum(Category),
  result: z.string().min(1, "Wynik jest wymagany"),
  unit: z.nativeEnum(Unit),
  wind: z.string().optional(),
  altitude: z.number().optional(),
  isIndoor: z.boolean().optional(),
  athleteName: z.string().min(1, "Imię i nazwisko zawodnika jest wymagane"),
  nationality: z
    .string()
    .min(2, "Narodowość jest wymagana")
    .max(3, "Narodowość powinna mieć 2-3 znaki"),
  dateOfBirth: z.string().optional(),
  competitionName: z.string().min(1, "Nazwa zawodów jest wymagana"),
  location: z.string().min(1, "Miejsce zawodów jest wymagane"),
  venue: z.string().optional(),
  date: z.string().min(1, "Data ustanowienia rekordu jest wymagana"),
  isRatified: z.boolean().optional(),
  ratifiedBy: z.string().optional(),
  ratifiedDate: z.string().optional(),
});

type CreateRecordForm = z.infer<typeof createRecordSchema>;

export default function CreateRecordPage() {
  const router = useRouter();
  const [isCheckingRecord, setIsCheckingRecord] = useState(false);
  const [recordCheck, setRecordCheck] = useState<{
    world: boolean;
    national: boolean;
    regional: boolean;
  } | null>(null);

  const createRecord = useCreateRecord();
  const checkPotentialRecord = useCheckPotentialRecord();

  const form = useForm<CreateRecordForm>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {
      type: RecordType.NATIONAL,
      level: RecordLevel.SENIOR,
      gender: Gender.MALE,
      category: Category.SENIOR,
      unit: Unit.TIME,
      isIndoor: false,
      isRatified: false,
    },
  });

  const watchedValues = form.watch();

  const onSubmit = async (data: CreateRecordForm) => {
    try {
      await createRecord.mutateAsync(data);
      toast.success("Rekord został dodany pomyślnie!");
      router.push("/records");
    } catch (error) {
      toast.error("Błąd podczas dodawania rekordu");
      
    }
  };

  const handleCheckRecord = async () => {
    const { eventName, result, unit, gender, category, nationality, isIndoor } =
      watchedValues;

    if (!eventName || !result || !gender || !category || !nationality) {
      toast.error(
        "Wypełnij wszystkie wymagane pola przed sprawdzeniem rekordu"
      );
      return;
    }

    setIsCheckingRecord(true);
    try {
      const check = await checkPotentialRecord.mutateAsync({
        eventName,
        result,
        unit,
        gender,
        category,
        nationality,
        isIndoor: isIndoor || false,
      });
      setRecordCheck(check);

      if (check.world) {
        toast.success("🏆 To może być rekord świata!");
      } else if (check.national) {
        toast.success("🥇 To może być rekord kraju!");
      } else {
        toast.info("Wynik nie pobija aktualnych rekordów");
      }
    } catch {
      toast.error("Błąd podczas sprawdzania rekordu");
    } finally {
      setIsCheckingRecord(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/records">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do rekordów
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
              Dodaj nowy rekord
            </CardTitle>
            <CardDescription>
              Wprowadź dane nowego rekordu. System automatycznie sprawdzi czy
              wynik pobija istniejące rekordy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Podstawowe informacje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ rekordu</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz typ rekordu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={RecordType.WORLD}>
                              Rekord świata
                            </SelectItem>
                            <SelectItem value={RecordType.CONTINENTAL}>
                              Rekord kontynentu
                            </SelectItem>
                            <SelectItem value={RecordType.NATIONAL}>
                              Rekord kraju
                            </SelectItem>
                            <SelectItem value={RecordType.REGIONAL}>
                              Rekord regionu
                            </SelectItem>
                            <SelectItem value={RecordType.CLUB}>
                              Rekord klubu
                            </SelectItem>
                            <SelectItem value={RecordType.FACILITY}>
                              Rekord obiektu
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poziom</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz poziom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={RecordLevel.SENIOR}>
                              Senior
                            </SelectItem>
                            <SelectItem value={RecordLevel.JUNIOR}>
                              Junior (U20)
                            </SelectItem>
                            <SelectItem value={RecordLevel.YOUTH}>
                              Młodzik (U18)
                            </SelectItem>
                            <SelectItem value={RecordLevel.CADETS}>
                              Kadet (U16)
                            </SelectItem>
                            <SelectItem value={RecordLevel.MASTERS}>
                              Weteran (35+)
                            </SelectItem>
                            <SelectItem value={RecordLevel.PARA}>
                              Para-atletyka
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Konkurencja */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa konkurencji</FormLabel>
                        <FormControl>
                          <Input placeholder="np. 100m, Shot Put" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discipline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dyscyplina</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz dyscyplinę" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TRACK">Bieg</SelectItem>
                            <SelectItem value="FIELD">Skok/Rzut</SelectItem>
                            <SelectItem value="ROAD">Bieg szosowy</SelectItem>
                            <SelectItem value="COMBINED">Wielobój</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Płeć i kategoria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Płeć</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz płeć" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Gender.MALE}>
                              Mężczyźni
                            </SelectItem>
                            <SelectItem value={Gender.FEMALE}>
                              Kobiety
                            </SelectItem>
                            <SelectItem value={Gender.MIXED}>
                              Mieszane
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoria wiekowa</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz kategorię" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Category.SENIOR}>
                              Senior
                            </SelectItem>
                            <SelectItem value={Category.U20}>U20</SelectItem>
                            <SelectItem value={Category.U18}>U18</SelectItem>
                            <SelectItem value={Category.U16}>U16</SelectItem>
                            <SelectItem value={Category.M35}>M35</SelectItem>
                            <SelectItem value={Category.M40}>M40</SelectItem>
                            <SelectItem value={Category.M45}>M45</SelectItem>
                            <SelectItem value={Category.M50}>M50</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Wynik */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wynik</FormLabel>
                        <FormControl>
                          <Input placeholder="np. 9.58, 23.37m" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jednostka</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Jednostka" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Unit.TIME}>Czas</SelectItem>
                            <SelectItem value={Unit.DISTANCE}>
                              Odległość
                            </SelectItem>
                            <SelectItem value={Unit.HEIGHT}>
                              Wysokość
                            </SelectItem>
                            <SelectItem value={Unit.POINTS}>Punkty</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wind"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wiatr</FormLabel>
                        <FormControl>
                          <Input placeholder="np. +1.2, -0.5" {...field} />
                        </FormControl>
                        <FormDescription>Dla biegów i skoków</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sprawdzenie rekordu */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      Sprawdź potencjalny rekord
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sprawdź czy podany wynik pobija istniejące rekordy
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckRecord}
                    disabled={isCheckingRecord}
                  >
                    {isCheckingRecord ? "Sprawdzam..." : "Sprawdź rekord"}
                  </Button>
                </div>

                {recordCheck && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Wyniki sprawdzenia:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle
                          className={`h-4 w-4 mr-2 ${recordCheck.world ? "text-yellow-500" : "text-gray-400"}`}
                        />
                        <span
                          className={
                            recordCheck.world
                              ? "text-yellow-600 font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          Rekord świata: {recordCheck.world ? "TAK" : "NIE"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle
                          className={`h-4 w-4 mr-2 ${recordCheck.national ? "text-blue-500" : "text-gray-400"}`}
                        />
                        <span
                          className={
                            recordCheck.national
                              ? "text-blue-600 font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          Rekord kraju: {recordCheck.national ? "TAK" : "NIE"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Zawodnik */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="athleteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imię i nazwisko zawodnika</FormLabel>
                        <FormControl>
                          <Input placeholder="np. Jan Kowalski" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Narodowość</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="np. POL, USA"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            maxLength={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Zawody */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="competitionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa zawodów</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="np. Mistrzostwa Świata"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Miejsce zawodów</FormLabel>
                        <FormControl>
                          <Input placeholder="np. Berlin, Germany" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data ustanowienia rekordu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Opcje dodatkowe */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isIndoor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Rekord halowy</FormLabel>
                          <FormDescription>
                            Zaznacz jeśli rekord został ustanowiony w hali
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRatified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Rekord ratyfikowany</FormLabel>
                          <FormDescription>
                            Zaznacz jeśli rekord został oficjalnie ratyfikowany
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {watchedValues.isRatified && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ratifiedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ratyfikowany przez</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="np. World Athletics, PZLA"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ratifiedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data ratyfikacji</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Link href="/records">
                    <Button variant="outline">Anuluj</Button>
                  </Link>
                  <Button type="submit" disabled={createRecord.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {createRecord.isPending
                      ? "Zapisywanie..."
                      : "Zapisz rekord"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
