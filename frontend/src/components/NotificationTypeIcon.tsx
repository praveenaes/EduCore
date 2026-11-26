import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export const isAlertNotification = (title?: string): boolean => {
  const normalized = title?.toLowerCase() ?? '';
  return (
    normalized.includes('alert') ||
    normalized.includes('emergency') ||
    normalized.includes('warning')
  );
};

interface NotificationTypeIconProps {
  title?: string;
}

export const NotificationTypeIcon: React.FC<NotificationTypeIconProps> = ({ title }) => {
  if (isAlertNotification(title)) {
    return <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2.5} />;
  }

  return <Bell className="h-5 w-5 text-blue-600" strokeWidth={2.5} />;
};
