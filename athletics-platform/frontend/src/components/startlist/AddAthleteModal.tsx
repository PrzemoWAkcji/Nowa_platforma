'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertCircle
    // Search // Obecnie nieużywane
    ,
    Building,
    Clock,
    Hash,
    Plus,
    User
} from 'lucide-react';
import React, { useState } from 'react';

interface AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (athleteData: NewAthleteData) => void;
  eventId: string;
  competitionId: string;
}

interface NewAthleteData {
  firstName: string;
  lastName: string;
  club?: string;
  bibNumber?: string;
  seedTime?: string;
  category: string;
  gender: 'MALE' | 'FEMALE';
}

export const AddAthleteModal: React.FC<AddAthleteModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  eventId: _eventId, // Obecnie nieużywane
  competitionId: _competitionId // Obecnie nieużywane
}) => {
  const [formData, setFormData] = useState<NewAthleteData>({
    firstName: '',
    lastName: '',
    club: '',
    bibNumber: '',
    seedTime: '',
    category: 'SENIOR',
    gender: 'MALE'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Imię jest wymagane';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nazwisko jest wymagane';
    }

    if (formData.bibNumber && !/^\d+$/.test(formData.bibNumber)) {
      newErrors.bibNumber = 'Numer startowy musi być liczbą';
    }

    if (formData.seedTime && !/^\d+([.,]\d+)?$/.test(formData.seedTime)) {
      newErrors.seedTime = 'Nieprawidłowy format wyniku';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Normalizacja danych
      const athleteData: NewAthleteData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        club: formData.club?.trim() || undefined,
        bibNumber: formData.bibNumber?.trim() || undefined,
        seedTime: formData.seedTime?.trim().replace(',', '.') || undefined
      };

      await onAdd(athleteData);
      
      // Reset formularza
      setFormData({
        firstName: '',
        lastName: '',
        club: '',
        bibNumber: '',
        seedTime: '',
        category: 'SENIOR',
        gender: 'MALE'
      });
      
      onClose();
    } catch (error) {
      
      setErrors({ submit: 'Wystąpił błąd podczas dodawania zawodnika' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewAthleteData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Usuń błąd dla tego pola
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Dodaj zawodnika
          </DialogTitle>
          <DialogDescription>
            Dodaj nowego zawodnika do konkurencji. Wypełnij wszystkie wymagane pola.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Dane osobowe */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Imię *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Imię"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nazwisko *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Nazwisko"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Klub */}
              <div className="space-y-2">
                <Label htmlFor="club" className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Klub
                </Label>
                <Input
                  id="club"
                  value={formData.club}
                  onChange={(e) => handleInputChange('club', e.target.value)}
                  placeholder="Nazwa klubu"
                />
              </div>

              {/* Kategoria i płeć */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JUNIOR">Junior</SelectItem>
                      <SelectItem value="SENIOR">Senior</SelectItem>
                      <SelectItem value="MASTER">Master</SelectItem>
                      <SelectItem value="U20">U20</SelectItem>
                      <SelectItem value="U18">U18</SelectItem>
                      <SelectItem value="U16">U16</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Płeć</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value: 'MALE' | 'FEMALE') => handleInputChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Mężczyzna</SelectItem>
                      <SelectItem value="FEMALE">Kobieta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Numer startowy i wynik */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bibNumber" className="flex items-center">
                    <Hash className="h-4 w-4 mr-1" />
                    Numer startowy
                  </Label>
                  <Input
                    id="bibNumber"
                    value={formData.bibNumber}
                    onChange={(e) => handleInputChange('bibNumber', e.target.value)}
                    placeholder="123"
                    className={errors.bibNumber ? 'border-red-500' : ''}
                  />
                  {errors.bibNumber && (
                    <p className="text-sm text-red-500">{errors.bibNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seedTime" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Wynik kwalifikacyjny
                  </Label>
                  <Input
                    id="seedTime"
                    value={formData.seedTime}
                    onChange={(e) => handleInputChange('seedTime', e.target.value)}
                    placeholder="10.50"
                    className={errors.seedTime ? 'border-red-500' : ''}
                  />
                  {errors.seedTime && (
                    <p className="text-sm text-red-500">{errors.seedTime}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Przyciski */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Dodawanie...' : 'Dodaj zawodnika'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};