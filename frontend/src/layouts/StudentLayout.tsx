import React from 'react';
import { AppShellLayout } from './AppShellLayout';
import type { SidebarItem } from '../components/layout/Sidebar';
import { LayoutDashboard, ClipboardCheck, Award, CreditCard } from 'lucide-react';

const studentNavItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', path: '/student/attendance', icon: ClipboardCheck },
  { label: 'Results', path: '/student/results', icon: Award },
  { label: 'Fees', path: '/student/fees', icon: CreditCard },
];

export const StudentLayout: React.FC = () => {
  return <AppShellLayout sidebarItems={studentNavItems} settingsPath="/student/settings" />;
};

export default StudentLayout;
