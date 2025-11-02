'use client';

import { useState } from 'react';
import { HelpCircle, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ImportStartListHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Pomoc
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Pomoc - Import List Startowych</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Przewodnik po importowaniu list startowych z różnych formatów plików.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Przegląd</TabsTrigger>
            <TabsTrigger value="formats">Formaty</TabsTrigger>
            <TabsTrigger value="process">Proces</TabsTrigger>
            <TabsTrigger value="troubleshooting">Problemy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Import list startowych pozwala na automatyczne dodawanie zawodników do zawodów 
                na podstawie plików CSV z systemów PZLA i Roster Athletics.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Obsługiwane Formaty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">PZLA</Badge>
                    <span className="text-sm">starter.pzla.pl</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Roster</Badge>
                    <span className="text-sm">Roster Athletics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">AUTO</Badge>
                    <span className="text-sm">Automatyczne rozpoznawanie</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Co System Robi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Tworzy zawodników</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Tworzy konkurencje</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Przypisuje do zawodów</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Zapisuje dane startowe</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="formats" className="space-y-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Format PZLA (starter.pzla.pl)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Separator:</strong> średnik (;)
                    </div>
                    <div>
                      <strong>Kodowanie:</strong> UTF-8 lub Windows-1250
                    </div>
                  </div>
                  
                  <div>
                    <strong>Główne kolumny:</strong>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li><code>Nazwisko</code> - nazwisko zawodnika</li>
                      <li><code>Imię</code> - imię zawodnika</li>
                      <li><code>DataUr</code> - data urodzenia (YYYY-MM-DD)</li>
                      <li><code>Klub</code> - nazwa klubu</li>
                      <li><code>NazwaPZLA</code> - nazwa konkurencji</li>
                      <li><code>NrStart</code> - numer startowy</li>
                      <li><code>Tor</code> - numer toru</li>
                      <li><code>PB</code> - rekord życiowy</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                    Nazwisko;Imię;DataUr;Klub;NazwaPZLA;NrStart;Tor<br/>
                    KOWALSKI;Anna;2004-07-04;AZS UMCS;100m kobiet;52;3
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Format Roster Athletics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Separator:</strong> przecinek (,)
                    </div>
                    <div>
                      <strong>Kodowanie:</strong> UTF-8
                    </div>
                  </div>
                  
                  <div>
                    <strong>Główne kolumny:</strong>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li><code>FirstName</code> - imię zawodnika</li>
                      <li><code>LastName</code> - nazwisko zawodnika</li>
                      <li><code>DateOfBirth</code> - data urodzenia</li>
                      <li><code>Gender</code> - płeć (Male/Female)</li>
                      <li><code>ClubName</code> - nazwa klubu</li>
                      <li><code>EventCode</code> - kod konkurencji</li>
                      <li><code>BibNumber</code> - numer startowy</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                    FirstName,LastName,DateOfBirth,Gender,ClubName,EventCode<br/>
                    Anna,Kowalska,2004-07-04,Female,AZS UMCS,100
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="process" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Krok 1: Wybór Pliku</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Przeciągnij plik CSV do obszaru importu</li>
                    <li>Lub kliknij &quot;Wybierz plik&quot; i wybierz z dysku</li>
                    <li>Opcjonalnie wybierz format (domyślnie: automatyczne)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Krok 2: Podgląd Danych</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>System wyświetli pierwsze wiersze pliku</li>
                    <li>Sprawdź czy dane są poprawnie rozpoznane</li>
                    <li>Sprawdź wykryty format pliku</li>
                    <li>Kliknij &quot;Importuj&quot; aby kontynuować</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Krok 3: Wyniki Importu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>System wyświetli podsumowanie importu</li>
                    <li>Sprawdź liczbę zaimportowanych zawodników</li>
                    <li>Przejrzyj ewentualne błędy i ostrzeżenia</li>
                    <li>Sprawdź utworzone konkurencje</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Najczęstsze problemy i ich rozwiązania
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Import się nie udaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Możliwe przyczyny:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Nieprawidłowy format pliku CSV</li>
                      <li>Błędne kodowanie pliku</li>
                      <li>Uszkodzony plik</li>
                    </ul>
                    <p><strong>Rozwiązanie:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Sprawdź czy plik ma rozszerzenie .csv</li>
                      <li>Zapisz plik w kodowaniu UTF-8</li>
                      <li>Sprawdź czy plik nie jest uszkodzony</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Błędne rozpoznanie płci</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Rozwiązanie:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Sprawdź nazwę konkurencji - powinna zawierać &quot;kobiet&quot;/&quot;mężczyzn&quot;</li>
                      <li>W formacie Roster sprawdź kolumnę &quot;Gender&quot;</li>
                      <li>Po imporcie możesz ręcznie poprawić płeć zawodników</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Błędne kategorie wiekowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Rozwiązanie:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Sprawdź format daty urodzenia (YYYY-MM-DD)</li>
                      <li>Sprawdź czy daty są logiczne</li>
                      <li>Po imporcie możesz ręcznie poprawić kategorie</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Duplikaty zawodników</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>To normalne:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>System automatycznie wykrywa duplikaty</li>
                      <li>Sprawdza po numerze licencji lub imieniu/nazwisku</li>
                      <li>Duplikaty są pomijane z ostrzeżeniem</li>
                      <li>Nie zostaną utworzone duplikaty rejestracji</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}