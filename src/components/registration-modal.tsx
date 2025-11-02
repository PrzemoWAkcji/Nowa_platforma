'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Calendar, CheckCircle, Mail, Phone, Trophy, User } from 'lucide-react';
import React, { useState } from 'react';

interface RegistrationModalProps {
  competitionName: string;
  competitionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationData) => void;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  club: string;
  events: string[];
}

export function RegistrationModal({ 
  competitionName, 
  competitionId: _competitionId, // Parametr wymagany przez interfejs, ale obecnie nieużywany 
  isOpen, 
  onClose, 
  onSubmit 
}: RegistrationModalProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    club: '',
    events: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Symulacja wysyłania formularza
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSubmit(formData);
    setIsSubmitting(false);
    setIsSuccess(true);

    // Zamknij modal po 2 sekundach
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset formularza
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        club: '',
        events: []
      });
    }, 2000);
  };

  const availableEvents = [
    '100m',
    '200m',
    '400m',
    '800m',
    '1500m',
    '5000m',
    '10000m',
    'Skok w dal',
    'Skok wzwyż',
    'Skok o tyczce',
    'Pchnięcie kulą',
    'Rzut dyskiem',
    'Rzut oszczepem',
    'Rzut młotem'
  ];

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Rejestracja zakończona" size="md">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Rejestracja przebiegła pomyślnie!
          </h3>
          <p className="text-gray-600 mb-4">
            Zostałeś zapisany na zawody: <strong>{competitionName}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Na podany adres e-mail zostanie wysłane potwierdzenie rejestracji.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rejestracja na zawody" size="lg">
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="font-medium text-blue-900">Rejestracja na zawody</div>
              <div className="text-sm text-blue-700">{competitionName}</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dane osobowe */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              Imię *
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="pl-10"
                placeholder="Wprowadź imię"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Nazwisko *
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="pl-10"
                placeholder="Wprowadź nazwisko"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail *
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                placeholder="twoj@email.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Telefon
            </Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-10"
                placeholder="+48 123 456 789"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
              Data urodzenia *
            </Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="club" className="text-sm font-medium text-gray-700">
              Klub sportowy
            </Label>
            <div className="relative mt-1">
              <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="club"
                type="text"
                value={formData.club}
                onChange={(e) => handleInputChange('club', e.target.value)}
                className="pl-10"
                placeholder="Nazwa klubu (opcjonalnie)"
              />
            </div>
          </div>
        </div>

        {/* Wybór konkurencji */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Wybierz konkurencje *
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {availableEvents.map((event) => (
              <label
                key={event}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                  formData.events.includes(event)
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'hover:bg-gray-50 border-gray-200'
                } border`}
              >
                <input
                  type="checkbox"
                  checked={formData.events.includes(event)}
                  onChange={() => handleEventToggle(event)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                  formData.events.includes(event)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                }`}>
                  {formData.events.includes(event) && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm">{event}</span>
              </label>
            ))}
          </div>
          {formData.events.length === 0 && (
            <p className="text-sm text-red-600 mt-1">Wybierz przynajmniej jedną konkurencję</p>
          )}
        </div>

        {/* Przyciski */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isSubmitting || formData.events.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Rejestrowanie...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Zarejestruj się
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}