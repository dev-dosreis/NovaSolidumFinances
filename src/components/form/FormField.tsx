import { Controller, useFormContext } from 'react-hook-form';

import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FormFieldProps {
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  mask?: (value: string) => string;
  autoComplete?: string;
}

export function FormField({
  name,
  label,
  hint,
  placeholder,
  type = 'text',
  inputMode,
  maxLength,
  mask,
  autoComplete,
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            autoComplete={autoComplete}
            value={field.value ?? ''}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              const raw = event.target.value;
              const formatted = mask ? mask(raw) : raw;
              field.onChange(formatted);
            }}
            onBlur={field.onBlur}
          />
          {error ? (
            <p className={cn('text-xs text-red-600')}>{error}</p>
          ) : hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      )}
    />
  );
}
