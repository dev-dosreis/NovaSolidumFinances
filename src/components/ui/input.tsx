import * as React from 'react';

import { cn } from '../../lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm shadow-sm shadow-black/5 transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-red-200',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
