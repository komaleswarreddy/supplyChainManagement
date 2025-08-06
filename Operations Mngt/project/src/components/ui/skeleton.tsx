import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Generic gray animated placeholder used while content is loading.
 * The component simply renders a div with an animated pulse effect.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/40 dark:bg-muted/20',
        className
      )}
    />
  );
};



