import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}

/**
 * Reusable Badge Indicator Component
 */
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const baseStyles =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider';

  const variantStyles = {
    info: 'bg-brand-50 text-brand-600 border border-brand-100',
    success: 'bg-green-50 text-green-700 border border-green-150',
    warning: 'bg-yellow-50 text-yellow-750 border border-yellow-100',
    danger: 'bg-red-50 text-red-600 border border-red-100',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200/30',
  };

  return <span className={`${baseStyles} ${variantStyles[variant]}`}>{children}</span>;
};
export default Badge;
