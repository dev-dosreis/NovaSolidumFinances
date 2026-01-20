const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(
  value?: number | null,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }
  if (!options) {
    return brlFormatter.format(value);
  }
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  });
  return formatter.format(value);
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${percentFormatter.format(value)}%`;
}

export function formatDecimal(value?: number | null, decimals = 4, signed = false) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = signed && value > 0 ? '+' : '';
  return `${sign}${formatter.format(value)}`;
}

export function formatTime(value?: Date | null) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

export function formatDateTime(value?: Date | null) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(value);
}
