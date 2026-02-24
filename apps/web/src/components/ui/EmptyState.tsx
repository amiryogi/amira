import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="mb-4 text-warm-400">{icon}</div>}
    <h3 className="text-lg font-semibold text-warm-800">{title}</h3>
    {description && <p className="mt-1 text-sm text-warm-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
