import { cn } from '../../lib/utils';

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 72"
      aria-hidden="true"
      className={cn('h-11 w-11', className)}
    >
      <path
        d="M32 2L8 12v22c0 16.5 10.7 30.2 24 36 13.3-5.8 24-19.5 24-36V12L32 2z"
        fill="white"
        stroke="hsl(var(--brand-silver))"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M19 28l26-11v7l-26 11z" fill="hsl(var(--brand-red))" />
      <path d="M19 40l26-11v7l-26 11z" fill="hsl(var(--brand-red))" />
      <path d="M19 52l26-11v7l-26 11z" fill="hsl(var(--brand-red))" />
    </svg>
  );
}
