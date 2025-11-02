'use client';

// import { useRouter } from 'next/navigation'; // Obecnie nieużywane
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { Shield } from 'lucide-react';

export default function CreateUserPage() {
  // const router = useRouter(); // Obecnie nieużywane
  const { user } = useAuthStore();

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dodaj użytkownika</h1>
          <p className="text-gray-600">Wypełnij formularz, aby dodać nowego użytkownika do systemu</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Funkcja dodawania użytkowników będzie dostępna wkrótce.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}