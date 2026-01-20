import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface UploadFieldProps {
  name: string;
  label: string;
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
  required?: boolean;
}

export function UploadField({
  name,
  label,
  hint,
  accept,
  maxSizeMb = 10,
  required,
}: UploadFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const file = useWatch({ control, name }) as File | null;

  const error = errors[name]?.message as string | undefined;
  const isImage = file?.type?.startsWith('image/') ?? false;
  const sizeMb = file ? file.size / (1024 * 1024) : 0;
  const fileExtension = file?.name?.split('.').pop()?.toUpperCase() ?? 'DOC';

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!file || !isImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  const hasFile = Boolean(file);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              {required ? <span className="text-xs text-muted-foreground">*</span> : null}
            </div>
            <span
              className={cn(
                'flex h-2.5 w-2.5 rounded-full',
                hasFile ? 'bg-emerald-500' : 'bg-muted-foreground/40',
              )}
              aria-label={hasFile ? 'Ok' : 'Pendente'}
            />
          </div>
          <Card className="border-dashed border-border/70 p-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/70 text-primary">
                  {isImage && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={label}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{fileExtension}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{file ? file.name : label}</p>
                  <p className="text-xs text-muted-foreground">
                    {file ? `${sizeMb.toFixed(2)}MB` : `Até ${maxSizeMb}MB`}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                {file ? 'Trocar' : 'Selecionar'}
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                field.onChange(selected);
              }}
            />
          </Card>
          {error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      )}
    />
  );
}
