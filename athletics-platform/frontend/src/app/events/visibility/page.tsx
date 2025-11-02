'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function EventVisibilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Widoczność konkurencji</h1>
          <p className="text-gray-600 mt-1">Zarządzaj widocznością konkurencji w programie minutowym</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Ustawienia widoczności
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <EyeOff className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Funkcja w przygotowaniu
              </h3>
              <p className="text-gray-600">
                Zarządzanie widocznością konkurencji będzie dostępne wkrótce.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}