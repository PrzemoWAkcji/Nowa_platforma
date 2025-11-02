'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecords, useRecordStatistics } from '@/hooks/useRecords';
import { Category, Gender, RecordType } from '@/types';
import { Download, Filter, Plus, Trophy, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RecordsPage() {
  const [filters, setFilters] = useState({
    type: '',
    eventName: '',
    gender: '',
    category: '',
    nationality: '',
    isActive: true,
  });

  const { data: records, isLoading } = useRecords(filters);
  const { data: statistics } = useRecordStatistics();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
    }));
  };

  const getRecordTypeColor = (type: RecordType) => {
    switch (type) {
      case RecordType.WORLD:
        return 'bg-yellow-500 text-white';
      case RecordType.NATIONAL:
        return 'bg-blue-500 text-white';
      case RecordType.CONTINENTAL:
        return 'bg-green-500 text-white';
      case RecordType.REGIONAL:
        return 'bg-purple-500 text-white';
      case RecordType.CLUB:
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatResult = (result: string, unit: string) => {
    if (unit === 'TIME') {
      return result;
    }
    if (unit === 'DISTANCE' || unit === 'HEIGHT') {
      return result.includes('m') ? result : `${result}m`;
    }
    if (unit === 'POINTS') {
      return `${result} pkt`;
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-6">
        <PageHeader 
          title="Rekordy" 
          description="Zarządzaj rekordami świata, kraju i regionu"
        >
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importuj CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Eksportuj
          </Button>
          <Link href="/records/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj rekord
            </Button>
          </Link>
        </PageHeader>

      {/* Statystyki */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wszystkie rekordy</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalRecords}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rekordy świata</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.worldRecords}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rekordy kraju</CardTitle>
              <Trophy className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.nationalRecords}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ostatnie rekordy</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.recentRecords.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtry */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Input
                placeholder="Szukaj konkurencji..."
                value={filters.eventName}
                onChange={(e) => handleFilterChange('eventName', e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Typ rekordu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                <SelectItem value={RecordType.WORLD}>Rekord świata</SelectItem>
                <SelectItem value={RecordType.NATIONAL}>Rekord kraju</SelectItem>
                <SelectItem value={RecordType.CONTINENTAL}>Rekord kontynentu</SelectItem>
                <SelectItem value={RecordType.REGIONAL}>Rekord regionu</SelectItem>
                <SelectItem value={RecordType.CLUB}>Rekord klubu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Płeć" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value={Gender.MALE}>Mężczyźni</SelectItem>
                <SelectItem value={Gender.FEMALE}>Kobiety</SelectItem>
                <SelectItem value={Gender.MIXED}>Mieszane</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value={Category.SENIOR}>Senior</SelectItem>
                <SelectItem value={Category.U20}>U20</SelectItem>
                <SelectItem value={Category.U18}>U18</SelectItem>
                <SelectItem value={Category.U16}>U16</SelectItem>
                <SelectItem value={Category.M35}>M35</SelectItem>
                <SelectItem value={Category.M40}>M40</SelectItem>
                <SelectItem value={Category.M45}>M45</SelectItem>
                <SelectItem value={Category.M50}>M50</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Narodowość (np. POL)"
              value={filters.nationality}
              onChange={(e) => handleFilterChange('nationality', e.target.value.toUpperCase())}
              className="w-full"
            />
            <Button 
              variant="outline" 
              onClick={() => setFilters({
                type: '',
                eventName: '',
                gender: '',
                category: '',
                nationality: '',
                isActive: true,
              })}
            >
              Wyczyść filtry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista rekordów */}
      <Card>
        <CardHeader>
          <CardTitle>Lista rekordów</CardTitle>
          <CardDescription>
            {records ? `Znaleziono ${records.length} rekordów` : 'Ładowanie...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Ładowanie rekordów...</div>
          ) : records && records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <Badge className={getRecordTypeColor(record.type)}>
                      {record.type}
                    </Badge>
                    <div>
                      <div className="font-semibold">
                        {record.eventName} - {record.gender} {record.category}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.athleteName} ({record.nationality})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatResult(record.result, record.unit)}
                      {record.wind && (
                        <span className="text-sm text-muted-foreground ml-2">
                          {record.wind}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(record.date).toLocaleDateString('pl-PL')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {record.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nie znaleziono rekordów spełniających kryteria
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}