'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Users, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAthletes } from '@/hooks/useAthletes';
import { useAddRelayTeamMember, useRemoveRelayTeamMember } from '@/hooks/useRelayTeams';
import { RelayTeam, AddRelayTeamMemberForm, UserRole } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const addMemberSchema = z.object({
  athleteId: z.string().min(1, 'Wybierz zawodnika'),
  position: z.number().min(1).max(6),
  isReserve: z.boolean(),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface RelayTeamMembersManagerProps {
  team: RelayTeam;
}

export function RelayTeamMembersManager({ team }: RelayTeamMembersManagerProps) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const { data: athletes } = useAthletes();
  const addMember = useAddRelayTeamMember();
  const removeMember = useRemoveRelayTeamMember();
  const { user } = useAuthStore();
  
  // Sprawdź uprawnienia do edycji
  const canEdit = user && (
    user.role === UserRole.ADMIN || 
    user.role === UserRole.ORGANIZER ||
    user.role === UserRole.COACH ||
    user.id === team.createdById
  );

  // Debug uprawnień
  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      athleteId: '',
      position: 1,
      isReserve: false,
    },
  });

  const watchIsReserve = form.watch('isReserve');

  const onSubmit = async (data: AddMemberFormData) => {
    try {
      const formData: AddRelayTeamMemberForm = {
        athleteId: data.athleteId,
        position: data.position,
        isReserve: data.isReserve,
      };

      await addMember.mutateAsync({ teamId: team.id, data: formData });
      toast.success('Członek zespołu został dodany');
      setAddMemberOpen(false);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd podczas dodawania członka');
    }
  };

  const handleRemoveMember = async (memberId: string, athleteName: string) => {
    if (confirm(`Czy na pewno chcesz usunąć ${athleteName} z zespołu?`)) {
      try {
        await removeMember.mutateAsync({ teamId: team.id, memberId });
        toast.success('Członek zespołu został usunięty');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Błąd podczas usuwania członka');
      }
    }
  };

  const getAvailablePositions = () => {
    const occupiedPositions = team.members?.map(m => m.position) || [];
    const positions = [];
    
    if (watchIsReserve) {
      // Pozycje dla rezerwowych (5-6)
      for (let i = 5; i <= 6; i++) {
        if (!occupiedPositions.includes(i)) {
          positions.push(i);
        }
      }
    } else {
      // Pozycje dla podstawowych (1-4)
      for (let i = 1; i <= 4; i++) {
        if (!occupiedPositions.includes(i)) {
          positions.push(i);
        }
      }
    }
    
    return positions;
  };

  const getAvailableAthletes = () => {
    if (!athletes) return [];
    
    const teamMemberIds = team.members?.map(m => m.athleteId) || [];
    return athletes.filter(athlete => !teamMemberIds.includes(athlete.id));
  };

  const mainMembers = team.members?.filter(m => !m.isReserve).sort((a, b) => a.position - b.position) || [];
  const reserveMembers = team.members?.filter(m => m.isReserve).sort((a, b) => a.position - b.position) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Skład zespołu ({team.members?.length || 0}/6)
          </CardTitle>
          {canEdit && (
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={(team.members?.length || 0) >= 6}>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj członka
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Dodaj członka zespołu</DialogTitle>
                <DialogDescription>
                  Zespół może mieć maksymalnie 4 podstawowych członków (pozycje 1-4) i 2 rezerwowych (pozycje 5-6).
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="athleteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zawodnik *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz zawodnika" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAvailableAthletes().map((athlete) => (
                              <SelectItem key={athlete.id} value={athlete.id}>
                                {athlete.firstName} {athlete.lastName}
                                {athlete.club && ` (${athlete.club})`}
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
                    name="isReserve"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ członka *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const isReserve = value === 'true';
                            field.onChange(isReserve);
                            // Reset pozycji gdy zmienia się typ
                            const availablePositions = isReserve ? [5, 6] : [1, 2, 3, 4];
                            const occupiedPositions = team.members?.map(m => m.position) || [];
                            const firstAvailable = availablePositions.find(p => !occupiedPositions.includes(p));
                            if (firstAvailable) {
                              form.setValue('position', firstAvailable);
                            }
                          }} 
                          defaultValue={field.value ? 'true' : 'false'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">Podstawowy (pozycje 1-4)</SelectItem>
                            <SelectItem value="true">Rezerwowy (pozycje 5-6)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pozycja *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAvailablePositions().map((position) => (
                              <SelectItem key={position} value={position.toString()}>
                                Pozycja {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddMemberOpen(false)}
                    >
                      Anuluj
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addMember.isPending}
                    >
                      {addMember.isPending ? 'Dodawanie...' : 'Dodaj'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Podstawowy skład */}
        <div>
          <div className="flex items-center mb-3">
            <UserCheck className="h-4 w-4 mr-2 text-green-600" />
            <h4 className="font-medium">Podstawowy skład ({mainMembers.length}/4)</h4>
          </div>
          {mainMembers.length > 0 ? (
            <div className="space-y-2">
              {mainMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {member.position}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {member.athlete.firstName} {member.athlete.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.athlete.club || 'Brak klubu'} • {member.athlete.category}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id, `${member.athlete.firstName} ${member.athlete.lastName}`)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Brak podstawowych członków</p>
          )}
        </div>

        {/* Rezerwowi */}
        <div>
          <div className="flex items-center mb-3">
            <UserX className="h-4 w-4 mr-2 text-orange-600" />
            <h4 className="font-medium">Rezerwowi ({reserveMembers.length}/2)</h4>
          </div>
          {reserveMembers.length > 0 ? (
            <div className="space-y-2">
              {reserveMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100">
                      {member.position}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {member.athlete.firstName} {member.athlete.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.athlete.club || 'Brak klubu'} • {member.athlete.category}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id, `${member.athlete.firstName} ${member.athlete.lastName}`)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Brak rezerwowych</p>
          )}
        </div>

        {mainMembers.length < 4 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Uwaga:</strong> Zespół musi mieć co najmniej 4 podstawowych członków, aby móc być zarejestrowany do konkurencji.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}