'use client';

import React from 'react';
import { Calendar, MapPin, Users, Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type CompetitionStatus = 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
type CompetitionCategory = 'Mistrzostwa' | 'Memoriał' | 'Młodzież' | 'Bieg';

interface Competition {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: CompetitionStatus;
  registrations: number;
  maxRegistrations: number;
  category: CompetitionCategory;
  featured: boolean;
  liveResults: boolean;
}

interface CompetitionDetailsModalProps {
  competition: Competition | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (competitionId: string) => void;
}

const statusColors: Record<CompetitionStatus, string> = {
  'DRAFT': 'bg-gray-100 text-gray-800',
  'PUBLISHED': 'bg-blue-100 text-blue-800',
  'REGISTRATION_OPEN': 'bg-green-100 text-green-800',
  'REGISTRATION_CLOSED': 'bg-yellow-100 text-yellow-800',
  'ONGOING': 'bg-purple-100 text-purple-800',
  'COMPLETED': 'bg-gray-100 text-gray-800',
  'CANCELLED': 'bg-red-100 text-red-800',
};

const statusLabels: Record<CompetitionStatus, string> = {
  'DRAFT': 'Szkic',
  'PUBLISHED': 'Opublikowane',
  'REGISTRATION_OPEN': 'Rejestracja otwarta',
  'REGISTRATION_CLOSED': 'Rejestracja zamknięta',
  'ONGOING': 'W trakcie',
  'COMPLETED': 'Zakończone',
  'CANCELLED': 'Anulowane',
};

const categoryColors: Record<CompetitionCategory, string> = {
  'Mistrzostwa': 'bg-gradient-to-r from-yellow-400 to-orange-500',
  'Memoriał': 'bg-gradient-to-r from-purple-500 to-pink-500',
  'Młodzież': 'bg-gradient-to-r from-blue-500 to-cyan-500',
  'Bieg': 'bg-gradient-to-r from-green-500 to-teal-500',
};

export function CompetitionDetailsModal({ 
  competition, 
  isOpen, 
  onClose, 
  onRegister 
}: CompetitionDetailsModalProps) {
  if (!competition) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const registrationPercentage = (competition.registrations / competition.maxRegistrations) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Szczegóły zawodów" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className={`h-32 ${categoryColors[competition.category]} rounded-xl flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center text-white">
              <Trophy className="h-12 w-12 mx-auto mb-2" />
              <div className="text-lg font-semibold">{competition.category}</div>
            </div>
            {competition.liveResults && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </div>
            )}
          </div>
        </div>

        {/* Title and Status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{competition.name}</h3>
          </div>
          <Badge className={`${statusColors[competition.status]} border-0 text-sm`}>
            {statusLabels[competition.status]}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <div className="p-2 rounded-lg bg-blue-50 mr-3">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Lokalizacja</div>
                <div className="font-medium">{competition.location}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <div className="p-2 rounded-lg bg-green-50 mr-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Data rozpoczęcia</div>
                <div className="font-medium">{formatDate(competition.startDate)}</div>
                <div className="text-sm text-gray-500">{formatTime(competition.startDate)}</div>
              </div>
            </div>

            {competition.startDate !== competition.endDate && (
              <div className="flex items-center text-gray-700">
                <div className="p-2 rounded-lg bg-orange-50 mr-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Data zakończenia</div>
                  <div className="font-medium">{formatDate(competition.endDate)}</div>
                  <div className="text-sm text-gray-500">{formatTime(competition.endDate)}</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <div className="p-2 rounded-lg bg-purple-50 mr-3">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Uczestnicy</div>
                <div className="font-medium">{competition.registrations} / {competition.maxRegistrations}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${registrationPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {registrationPercentage.toFixed(0)}% zapełnienia
                </div>
              </div>
            </div>

            {competition.status === 'REGISTRATION_OPEN' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div className="text-sm text-green-800">
                    <div className="font-medium">Rejestracja otwarta</div>
                    <div>Możesz zapisać się na te zawody</div>
                  </div>
                </div>
              </div>
            )}

            {competition.status === 'REGISTRATION_CLOSED' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium">Rejestracja zamknięta</div>
                    <div>Nie można już zapisać się na te zawody</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Opis zawodów</h4>
          <p className="text-gray-700 leading-relaxed">
            {competition.category === 'Mistrzostwa' && 
              'Prestiżowe zawody lekkoatletyczne na najwyższym poziomie. Udział biorą najlepsi zawodnicy z całego kraju, rywalizując o tytuły mistrzowskie w różnych konkurencjach.'
            }
            {competition.category === 'Memoriał' && 
              'Tradycyjne zawody upamiętniające wybitnych sportowców. Wydarzenie łączy sportową rywalizację z uczczeniem pamięci legend lekkoatletyki.'
            }
            {competition.category === 'Młodzież' && 
              'Zawody dedykowane młodym talentom lekkoatletycznym. Doskonała okazja dla juniorów do zaprezentowania swoich umiejętności i zdobycia cennego doświadczenia.'
            }
            {competition.category === 'Bieg' && 
              'Masowe zawody biegowe otwarte dla wszystkich miłośników biegania. Różne dystanse dostosowane do możliwości uczestników - od amatorów po zaawansowanych biegaczy.'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Zamknij
          </Button>
          {competition.status === 'REGISTRATION_OPEN' && (
            <Button
              onClick={() => onRegister(competition.id)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Zapisz się na zawody
            </Button>
          )}
          {competition.liveResults && (
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              Zobacz wyniki na żywo
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}