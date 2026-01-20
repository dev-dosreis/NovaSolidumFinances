import { cn } from '../../lib/utils';
import { Separator } from '../ui/separator';

interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <Separator className={cn('bg-border/70', className)} />;
}
