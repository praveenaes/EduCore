import React from "react";
import type { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl border border-neutral-200/50 bg-white p-6 shadow-sm transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-neutral-800">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};
