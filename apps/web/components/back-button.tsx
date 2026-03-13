'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

export function BackButton({ 
  variant = 'default', 
  className 
}: { 
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  className?: string;
}) {
  const router = useRouter();

  return (
    <Button 
      className={className} 
      variant={variant} 
      onClick={() => router.back()}
    >
      <ArrowLeft className={'mr-2 h-4'} />
      <Trans i18nKey={'common:goBack'} />
    </Button>
  );
}
