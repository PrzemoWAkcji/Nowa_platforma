'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateRelayTeam } from '@/hooks/useRelayTeams';
import { CreateRelayTeamForm } from '@/types';
import { toast } from 'sonner';

const createRelayTeamSchema = z.object({
  name: z.string().min(1, 'Nazwa zespołu jest wymagana').max(100, 'Nazwa może mieć maksymalnie 100 znaków'),
  club: z.string().max(100, 'Nazwa klubu może mieć maksymalnie 100 znaków').optional(),
});

type CreateRelayTeamFormData = z.infer<typeof createRelayTeamSchema>;

interface CreateRelayTeamDialogProps {
  competitionId: string;
  trigger?: React.ReactNode;
}

export function CreateRelayTeamDialog({ competitionId, trigger }: CreateRelayTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const createRelayTeam = useCreateRelayTeam();

  const form = useForm<CreateRelayTeamFormData>({
    resolver: zodResolver(createRelayTeamSchema),
    defaultValues: {
      name: '',
      club: '',
    },
  });

  const onSubmit = async (data: CreateRelayTeamFormData) => {
    try {
      const formData: CreateRelayTeamForm = {
        ...data,
        competitionId,
      };

      await createRelayTeam.mutateAsync(formData);
      toast.success('Zespół sztafetowy został utworzony');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd podczas tworzenia zespołu');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj zespół sztafetowy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nowy zespół sztafetowy</DialogTitle>
          <DialogDescription>
            Utwórz nowy zespół sztafetowy. Po utworzeniu będziesz mógł dodać członków zespołu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa zespołu *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="np. AZS Warszawa I, Legia Warszawa" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="club"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klub/Organizacja</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="np. AZS Warszawa, Legia Warszawa" 
                      {...field} 
                    />
                  </FormControl>
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
              <Button 
                type="submit" 
                disabled={createRelayTeam.isPending}
              >
                {createRelayTeam.isPending ? 'Tworzenie...' : 'Utwórz zespół'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}