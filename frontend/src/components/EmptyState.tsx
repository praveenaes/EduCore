import React from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There is no data to display in this list.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center shadow-xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-450 text-xl font-bold">
        📭
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-800">{title}</h3>
      <p className="mt-1 text-sm text-neutral-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
