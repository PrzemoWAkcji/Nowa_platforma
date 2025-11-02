import { Metadata } from 'next';
import LazyOrganizationDashboard from '@/components/optimized/LazyOrganizationDashboard';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Organizacja zawodów',
  description: 'Zarządzanie programem minutowym i rozstawieniem zawodników',
};

export default async function OrganizationPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <LazyOrganizationDashboard competitionId={id} />
      </div>
    </div>
  );
}