'use client';

import { useState } from 'react';
import { User, Bell, Shield, Database, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
          <p className="text-gray-600">Zarządzaj ustawieniami konta i aplikacji</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profil użytkownika
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Imię</Label>
                    <Input
                      id="firstName"
                      defaultValue={user?.firstName}
                      placeholder="Imię"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input
                      id="lastName"
                      defaultValue={user?.lastName}
                      placeholder="Nazwisko"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={user?.phone || ''}
                    placeholder="+48 123 456 789"
                  />
                </div>
                <Button>Zapisz zmiany</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Powiadomienia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Powiadomienia email</Label>
                    <p className="text-sm text-gray-600">Otrzymuj powiadomienia na email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Powiadomienia push</Label>
                    <p className="text-sm text-gray-600">Otrzymuj powiadomienia w przeglądarce</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">Powiadomienia SMS</Label>
                    <p className="text-sm text-gray-600">Otrzymuj powiadomienia SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>
                <Button>Zapisz ustawienia</Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Bezpieczeństwo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Aktualne hasło</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Wprowadź aktualne hasło"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Nowe hasło</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Wprowadź nowe hasło"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Potwierdź nowe hasło"
                  />
                </div>
                <Button>Zmień hasło</Button>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Zarządzanie danymi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Eksportuj dane
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Importuj dane
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium text-red-600 mb-2">Strefa niebezpieczna</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Usunięcie konta jest nieodwracalne. Wszystkie dane zostaną trwale usunięte.
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Usuń konto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informacje o koncie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Rola</p>
                  <p className="font-medium">{user?.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status konta</p>
                  <p className="font-medium text-green-600">
                    {user?.isActive ? 'Aktywne' : 'Nieaktywne'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ostatnie logowanie</p>
                  <p className="font-medium">Dzisiaj</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data rejestracji</p>
                  <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : 'Nieznana'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Szybkie akcje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Pobierz raport aktywności
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Wyczyść cache
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Zgłoś problem
                </Button>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informacje systemowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wersja:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ostatnia aktualizacja:</span>
                  <span>02.01.2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Środowisko:</span>
                  <span>Produkcja</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}