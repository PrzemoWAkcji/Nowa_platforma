'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  fallbackHref?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function BackButton({ 
  fallbackHref = '/dashboard', 
  children = 'Wstecz',
  className = '',
  variant = 'ghost',
  size = 'sm'
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Sprawdź czy jest historia w przeglądarce
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Jeśli nie ma historii, przekieruj do fallback
      router.push(fallbackHref);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`text-gray-600 hover:text-gray-900 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {children}
    </Button>
  );
}