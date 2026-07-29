import React from 'react';
import { AppShellLayout } from './AppShellLayout';
import type { SidebarItem } from '../components/layout/Sidebar';
import { LayoutDashboard, Building2, ClipboardCheck, Award, ClipboardList } from 'lucide-react';

const teacherNavItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Classes', path: '/teacher/classes', icon: Building2 },
  { label: 'Attendance', path: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Marks', path: '/teacher/marks', icon: Award },
  { label: 'Homework', path: '/teacher/homework', icon: ClipboardList },
];

export const TeacherLayout: React.FC = () => {
  return <AppShellLayout sidebarItems={teacherNavItems} settingsPath="/teacher/settings" />;
};

export default TeacherLayout;
