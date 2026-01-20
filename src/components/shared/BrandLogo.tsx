import { useState } from 'react';

import { cn } from '../../lib/utils';
import { BrandMark } from './BrandMark';

const LOGO_SOURCES = ['/assets/logo-nova-solidum.png', '/assets/logo-nova-solidum.jpeg'];

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  const [srcIndex, setSrcIndex] = useState(0);

  if (srcIndex >= LOGO_SOURCES.length) {
    return <BrandMark className={className} />;
  }

  return (
    <img
      src={LOGO_SOURCES[srcIndex]}
      alt="Nova Solidum Finances LTDA"
      className={cn('h-10 w-auto max-w-[180px] object-contain sm:max-w-[220px]', className)}
      loading="eager"
      decoding="async"
      onError={() => setSrcIndex((index) => index + 1)}
    />
  );
}
