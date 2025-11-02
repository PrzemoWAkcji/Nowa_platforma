'use client';

import React from 'react';
import { Play, Trophy, Users, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const features = [
    {
      icon: Trophy,
      title: 'Zarządzanie zawodami',
      description: 'Twórz i zarządzaj zawodami lekkoatletycznymi z łatwością',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      icon: Users,
      title: 'Rejestracja uczestników',
      description: 'Automatyczna rejestracja zawodników online',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Wyniki na żywo',
      description: 'Śledzenie wyników w czasie rzeczywistym',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Clock,
      title: 'Integracja z FinishLynx',
      description: 'Automatyczne pobieranie czasów z systemu pomiarowego',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Demo Platformy" size="lg">
      <div className="space-y-6">
        {/* Hero */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Poznaj możliwości naszej platformy
          </h3>
          <p className="text-gray-600">
            Nowoczesne rozwiązanie do zarządzania zawodami lekkoatletycznymi
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Video Placeholder */}
        <div className="bg-gray-100 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-10 w-10 text-gray-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Demo Video</h4>
          <p className="text-gray-600 mb-4">
            Zobacz jak działa nasza platforma w praktyce
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Play className="mr-2 h-4 w-4" />
            Odtwórz demo (3:45)
          </Button>
        </div>

        {/* Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Korzyści dla organizatorów
          </h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Oszczędność czasu przy organizacji zawodów
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Automatyzacja procesów rejestracji
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Profesjonalna prezentacja wyników
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Integracja z systemami pomiarowymi
            </li>
          </ul>
        </div>

        {/* Test Accounts */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            🧪 Konta testowe do wypróbowania
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="font-medium text-red-800">👑 Administrator</div>
              <div className="text-red-600 text-xs mt-1">
                admin@athletics.pl / admin123
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="font-medium text-blue-800">🏃‍♂️ Trener</div>
              <div className="text-blue-600 text-xs mt-1">
                coach@athletics.pl / coach123
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-medium text-green-800">🏆 Zawodnik</div>
              <div className="text-green-600 text-xs mt-1">
                athlete@athletics.pl / athlete123
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <div className="font-medium text-purple-800">📋 Organizator</div>
              <div className="text-purple-600 text-xs mt-1">
                organizer@athletics.pl / organizer123
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Każda rola ma różne uprawnienia i widoki w systemie. Kliknij &quot;Zaloguj się&quot; i wybierz rolę do przetestowania.
          </p>
        </div>

        {/* CTA */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Zamknij
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Rozpocznij testowanie
          </Button>
        </div>
      </div>
    </Modal>
  );
}