import React from 'react';
import { AppShellLayout } from './AppShellLayout';
import type { SidebarItem } from '../components/layout/Sidebar';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  FileSpreadsheet,
  Bell,
  MessageSquare,
} from 'lucide-react';

const teacherNavItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Homeworks', path: '/teacher/homework', icon: BookOpen },
  { label: 'Batches', path: '/teacher/batches', icon: Users },
  { label: 'Subjects', path: '/teacher/subjects', icon: GraduationCap },
  { label: 'Exam Mark Entry', path: '/teacher/mark-entry', icon: FileSpreadsheet },
  { label: 'Notifications', path: '/teacher/notifications', icon: Bell },
  { label: 'Chat', path: '/teacher/chat', icon: MessageSquare },
];

export const TeacherLayout: React.FC = () => {
  return <AppShellLayout sidebarItems={teacherNavItems} settingsPath="/teacher/settings" />;
};

export default TeacherLayout;
