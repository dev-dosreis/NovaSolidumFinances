import { motion, type HTMLMotionProps } from 'framer-motion';

import { cn } from '../../lib/utils';

interface MotionInViewProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export function MotionInView({ className, delay = 0, children, ...props }: MotionInViewProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
