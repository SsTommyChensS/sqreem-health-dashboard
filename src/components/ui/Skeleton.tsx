import { memo, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = memo(({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse rounded-lg bg-slate-200/80', className)
      )}
      {...props}
    />
  );
});
