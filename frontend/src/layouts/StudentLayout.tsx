import React from 'react';
import { AppShellLayout } from './AppShellLayout';
import type { SidebarItem } from '../components/layout/Sidebar';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  BarChart2,
  Bell,
  MessageSquare,
  CreditCard,
} from 'lucide-react';

const studentNavItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Homeworks', path: '/student/homework', icon: BookOpen },
  { label: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
  { label: 'Exams & Results', path: '/student/results', icon: BarChart2 },
  { label: 'Notifications', path: '/student/notifications', icon: Bell },
  { label: 'Chat', path: '/student/chat', icon: MessageSquare },
  { label: 'Fees', path: '/student/fees', icon: CreditCard },
];

export const StudentLayout: React.FC = () => {
  return <AppShellLayout sidebarItems={studentNavItems} settingsPath="/student/settings" />;
};

export default StudentLayout;

