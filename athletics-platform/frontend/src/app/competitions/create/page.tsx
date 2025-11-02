"use client";

import { CreateCompetitionForm } from "@/components/forms/CreateCompetitionForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateCompetitionPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = () => {
    router.push("/competitions");
  };

  const handleCancel = () => {
    router.back();
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Sprawdzanie autoryzacji...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check if user has permission to create competitions
  if (user && !["ADMIN", "ORGANIZER"].includes(user.role)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">
              Nie masz uprawnień do tworzenia zawodów.
            </p>
            <p className="text-gray-600 mt-2">
              Wymagana rola: ADMIN lub ORGANIZER
            </p>
            <p className="text-gray-600">Twoja rola: {user.role}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Utwórz nowe zawody
          </h1>
          <p className="text-gray-600">
            Wypełnij formularz, aby utworzyć nowe zawody lekkoatletyczne
          </p>
        </div>

        <CreateCompetitionForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}
