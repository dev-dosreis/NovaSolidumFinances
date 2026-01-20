import * as React from 'react';

import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}

export function InfoCard({ icon, className, children, ...props }: InfoCardProps) {
  return (
    <Card className={cn('h-full p-6', className)} {...props}>
      <div className="flex flex-col gap-4">
        {icon ? <div className="text-primary">{icon}</div> : null}
        <div className="space-y-2">{children}</div>
      </div>
    </Card>
  );
}
