'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateAthleteForm } from '@/components/forms/CreateAthleteForm';

export default function CreateAthletePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/athletes');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dodaj zawodnika</h1>
          <p className="text-gray-600">Wypełnij formularz, aby dodać nowego zawodnika do bazy</p>
        </div>

        <CreateAthleteForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  );
}