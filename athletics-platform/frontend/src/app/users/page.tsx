'use client';

import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Shield, Users, Search, UserPlus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { User, UserRole } from '@/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import Link from 'next/link';

const roleColors = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800',
  [UserRole.ORGANIZER]: 'bg-blue-100 text-blue-800',
  [UserRole.COACH]: 'bg-green-100 text-green-800',
  [UserRole.ATHLETE]: 'bg-purple-100 text-purple-800',
  [UserRole.JUDGE]: 'bg-orange-100 text-orange-800',
};

const roleLabels = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.ORGANIZER]: 'Organizator',
  [UserRole.COACH]: 'Trener',
  [UserRole.ATHLETE]: 'Zawodnik',
  [UserRole.JUDGE]: 'Sędzia',
};

function UserCard({ user: userItem }: { user: User }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {userItem.firstName[0]}{userItem.lastName[0]}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">
                {userItem.firstName} {userItem.lastName}
              </CardTitle>
              <p className="text-sm text-gray-600">{userItem.email}</p>
            </div>
          </div>
          <Badge className={roleColors[userItem.role]}>
            {roleLabels[userItem.role]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          {userItem.phone && (
            <div>Telefon: {userItem.phone}</div>
          )}
          <div>
            Utworzony: {format(new Date(userItem.createdAt), 'dd.MM.yyyy', { locale: pl })}
          </div>
          {userItem.lastLogin && (
            <div>
              Ostatnie logowanie: {format(new Date(userItem.lastLogin), 'dd.MM.yyyy HH:mm', { locale: pl })}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${userItem.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {userItem.isActive ? 'Aktywny' : 'Nieaktywny'}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-1" />
            Edytuj
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-1" />
            Usuń
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Pobierz użytkowników (tylko dla adminów)
  const { data: users, isLoading } = useUsers();

  // Filtrowanie użytkowników
  const filteredUsers = users?.filter(userItem => {
    const fullName = `${userItem.firstName} ${userItem.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  if (user?.role !== UserRole.ADMIN) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Brak dostępu
          </h3>
          <p className="text-gray-600">
            Ta strona jest dostępna tylko dla administratorów.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Użytkownicy" 
          description="Zarządzaj użytkownikami platformy"
        >
          <Link href="/users/create">
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Dodaj użytkownika
            </Button>
          </Link>
        </PageHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Szukaj użytkowników..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rola" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie role</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                <SelectItem value={UserRole.ORGANIZER}>Organizator</SelectItem>
                <SelectItem value={UserRole.COACH}>Trener</SelectItem>
                <SelectItem value={UserRole.ATHLETE}>Zawodnik</SelectItem>
                <SelectItem value={UserRole.JUDGE}>Sędzia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wszyscy</p>
                  <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Administratorzy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users?.filter(u => u.role === UserRole.ADMIN).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trenerzy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users?.filter(u => u.role === UserRole.COACH).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Zawodnicy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users?.filter(u => u.role === UserRole.ATHLETE).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Users Grid */}
        {!isLoading && (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {users?.length === 0 ? 'Brak użytkowników' : 'Brak wyników wyszukiwania'}
                </h3>
                <p className="text-gray-600">
                  {users?.length === 0 
                    ? 'Nie ma jeszcze żadnych użytkowników w systemie.' 
                    : 'Spróbuj zmienić kryteria wyszukiwania.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((userItem) => (
                  <UserCard key={userItem.id} user={userItem} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}