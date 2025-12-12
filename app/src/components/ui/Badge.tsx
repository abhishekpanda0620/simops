import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-700 text-surface-200',
  success: 'bg-success-900/50 text-success-400 border-success-700/50',
  warning: 'bg-warning-900/50 text-warning-400 border-warning-700/50',
  error: 'bg-error-900/50 text-error-400 border-error-700/50',
  info: 'bg-primary-900/50 text-primary-400 border-primary-700/50',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-primary-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotStyles[variant],
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  );
}
