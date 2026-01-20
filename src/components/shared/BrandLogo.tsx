import { useState } from 'react';

import { cn } from '../../lib/utils';
import { BrandMark } from './BrandMark';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <BrandMark className={className} />;
  }

  return (
    <img
      src="/assets/logo-nova-solidum.jpeg"
      alt="Nova Solidum Finances LTDA"
      className={cn('h-10 w-auto', className)}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
