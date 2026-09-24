import { memo, type HTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card = memo(({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-slate-100/80 shadow-sm transition-all duration-200 hover:shadow-md p-5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const CardHeader = memo(({
  title,
  subtitle,
  icon,
  action,
  className,
}: CardHeaderProps) => {
  return (
    <div className={twMerge('flex items-center justify-between gap-3 mb-4', className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <div className="text-slate-500 flex-shrink-0">{icon}</div>}
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm md:text-base leading-tight truncate">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
});
