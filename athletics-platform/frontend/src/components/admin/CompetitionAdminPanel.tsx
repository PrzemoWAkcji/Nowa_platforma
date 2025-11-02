'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Competition, CompetitionStatus } from '@/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { 
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  Hash,
  UserPlus,
  BarChart3,
  Settings,
  Download,
  Upload,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import Link from 'next/link';

// Nieużywany interface AdminAction
// interface AdminAction {
//   label: string;
//   icon: React.ComponentType;
//   href: string;
// }

interface CompetitionAdminPanelProps {
  competition: Competition;
  onBack: () => void;
}

export function CompetitionAdminPanel({ competition, onBack }: CompetitionAdminPanelProps) {

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.DRAFT:
        return <Badge variant="secondary">Szkic</Badge>;
      case CompetitionStatus.PUBLISHED:
        return <Badge variant="outline">Opublikowane</Badge>;
      case CompetitionStatus.REGISTRATION_OPEN:
        return <Badge className="bg-green-500">Rejestracja otwarta</Badge>;
      case CompetitionStatus.REGISTRATION_CLOSED:
        return <Badge className="bg-orange-500">Rejestracja zamknięta</Badge>;
      case CompetitionStatus.ONGOING:
        return <Badge className="bg-blue-500">W trakcie</Badge>;
      case CompetitionStatus.COMPLETED:
        return <Badge className="bg-gray-500">Zakończone</Badge>;
      case CompetitionStatus.CANCELLED:
        return <Badge variant="destructive">Anulowane</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const adminSections = [
    {
      id: 'startlists',
      title: 'Listy startowe',
      description: 'Zarządzanie listami startowymi',
      icon: FileText,
      href: `/competitions/${competition.id}/startlists?from=admin`,
      actions: []
    },
    {
      id: 'results',
      title: 'Wyniki',
      description: 'Wprowadzanie i zarządzanie wynikami',
      icon: Trophy,
      href: `/results?competitionId=${competition.id}`,
      actions: [
        { label: 'Dodaj wyniki', icon: Plus, href: `/results?competitionId=${competition.id}` },
        { label: 'Import wyników', icon: Upload, href: `/results?competitionId=${competition.id}&tab=import` },
        { label: 'Eksport wyników', icon: Download, href: `/results?competitionId=${competition.id}&tab=export` }
      ]
    },
    {
      id: 'schedule',
      title: 'Program minutowy',
      description: 'Harmonogram zawodów i konkurencji',
      icon: Clock,
      href: `/minute-program?competitionId=${competition.id}`,
      actions: [
        { label: 'Edytuj program', icon: Edit, href: `/minute-program?competitionId=${competition.id}` },
        { label: 'Eksport PDF', icon: Download, href: `/minute-program?competitionId=${competition.id}&export=pdf` },
        { label: 'Podgląd', icon: Eye, href: `/minute-program?competitionId=${competition.id}&preview=true` }
      ]
    },
    {
      id: 'numbers',
      title: 'Numery startowe',
      description: 'Przydzielanie numerów startowych',
      icon: Hash,
      href: `/competitions/${competition.id}/numbers`,
      actions: [
        { label: 'Przydziel numery', icon: Settings, href: `/competitions/${competition.id}/numbers` },
        { label: 'Lista numerów', icon: FileText, href: `/competitions/${competition.id}/numbers?view=list` },
        { label: 'Drukuj numery', icon: Download, href: `/competitions/${competition.id}/numbers?print=true` }
      ]
    },
    {
      id: 'registrations',
      title: 'Zgłoszenia',
      description: 'Zarządzanie rejestracjami zawodników',
      icon: UserPlus,
      href: `/registrations?competitionId=${competition.id}`,
      actions: [
        { label: 'Przeglądaj zgłoszenia', icon: Eye, href: `/registrations?competitionId=${competition.id}` },
        { label: 'Dodaj zgłoszenie', icon: Plus, href: `/registrations?competitionId=${competition.id}&add=true` },
        { label: 'Eksport listy', icon: Download, href: `/registrations?competitionId=${competition.id}&export=true` }
      ]
    },
    {
      id: 'participants',
      title: 'Uczestnicy',
      description: 'Lista wszystkich uczestników',
      icon: Users,
      href: `/participants?competitionId=${competition.id}`,
      actions: [
        { label: 'Lista uczestników', icon: Eye, href: `/participants?competitionId=${competition.id}` },
        { label: 'Statystyki', icon: BarChart3, href: `/participants?competitionId=${competition.id}&stats=true` },
        { label: 'Eksport', icon: Download, href: `/participants?competitionId=${competition.id}&export=true` }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do listy
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{competition.name}</h1>
            {getStatusBadge(competition.status)}
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(competition.startDate), 'dd MMM yyyy', { locale: pl })}
              {competition.endDate && competition.startDate !== competition.endDate && (
                <span> - {format(new Date(competition.endDate), 'dd MMM yyyy', { locale: pl })}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {competition.location}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {competition._count?.registrations || 0} rejestracji
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/competitions/${competition.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Podgląd publiczny
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/competitions/${competition.id}/edit`}>
              <Settings className="h-4 w-4 mr-2" />
              Ustawienia
            </Link>
          </Button>
        </div>
      </div>

      {/* Competition Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informacje o zawodach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Podstawowe informacje</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Nazwa:</span> {competition.name}</div>
                <div><span className="font-medium">Lokalizacja:</span> {competition.location}</div>
                <div><span className="font-medium">Data rozpoczęcia:</span> {format(new Date(competition.startDate), 'dd MMMM yyyy', { locale: pl })}</div>
                {competition.endDate && competition.startDate !== competition.endDate && (
                  <div><span className="font-medium">Data zakończenia:</span> {format(new Date(competition.endDate), 'dd MMMM yyyy', { locale: pl })}</div>
                )}
                <div><span className="font-medium">Status:</span> {getStatusBadge(competition.status)}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Opis</h4>
              <p className="text-sm text-gray-600">
                {competition.description || 'Brak opisu'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminSections.map((section) => (
          <Card key={section.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{section.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild className="w-full justify-start">
                  <Link href={section.href}>
                    <Eye className="h-4 w-4 mr-2" />
                    Otwórz {section.title.toLowerCase()}
                  </Link>
                </Button>
                <div className="flex flex-wrap gap-2">
                  {section.actions.map((action, index) => (
                    <Button key={index} variant="outline" size="sm" asChild>
                      <Link href={action.href}>
                        <action.icon className="h-3 w-3 mr-1" />
                        {action.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}