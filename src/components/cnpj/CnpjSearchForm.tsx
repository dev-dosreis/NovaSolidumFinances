/**
 * CNPJ Search Form Component
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cnpjLookupRequestSchema } from '../../lib/cnpj/schemas';
import type { CnpjLookupRequest } from '../../lib/cnpj/schemas';
import { formatCnpj, normalizeCnpj } from '../../lib/cnpj/utils';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface CnpjSearchFormProps {
  onSearch: (cnpj: string) => void;
  loading?: boolean;
}

export function CnpjSearchForm({ onSearch, loading = false }: CnpjSearchFormProps) {
  const [displayValue, setDisplayValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CnpjLookupRequest>({
    resolver: zodResolver(cnpjLookupRequestSchema),
  });

  const onSubmit = (data: CnpjLookupRequest) => {
    onSearch(data.cnpj);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeCnpj(raw);

    // Atualiza valor formatado para exibição
    setDisplayValue(formatCnpj(normalized));

    // Atualiza valor normalizado no form (para validação)
    setValue('cnpj', normalized);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const normalized = normalizeCnpj(pasted);

    setDisplayValue(formatCnpj(normalized));
    setValue('cnpj', normalized);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            type="text"
            placeholder="00.000.000/0000-00"
            value={displayValue}
            onChange={handleInputChange}
            onPaste={handlePaste}
            disabled={loading}
            className={errors.cnpj ? 'border-red-500' : ''}
            autoComplete="off"
          />
          <input
            type="hidden"
            {...register('cnpj')}
          />
          {errors.cnpj && (
            <p className="text-sm text-red-500">{errors.cnpj.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Digite ou cole o CNPJ que deseja consultar
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Consultando...' : 'Consultar CNPJ'}
        </Button>
      </form>
    </Card>
  );
}
