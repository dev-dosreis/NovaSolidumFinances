import { cn } from '../../lib/utils';
import { Progress } from '../ui/progress';

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-4">
      <Progress value={progress} />
      <div className="grid grid-cols-5 gap-2 text-[11px] text-muted-foreground sm:gap-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          return (
            <div key={`${step.label}-${index}`} className="flex flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold sm:h-8 sm:w-8',
                  isActive && 'border-primary text-primary',
                  isComplete && 'border-primary bg-primary text-primary-foreground',
                )}
              >
                {index + 1}
              </span>
              <span className={cn('hidden text-[11px] md:block', isActive && 'text-foreground')}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
