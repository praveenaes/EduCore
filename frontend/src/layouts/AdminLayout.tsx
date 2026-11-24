import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import type { SidebarItem } from '../components/layout/Sidebar';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  CreditCard,
} from 'lucide-react';

const adminNavItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/admin/students', icon: Users },
  { label: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
  { label: 'Classes', path: '/admin/classes', icon: Building2 },
  { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
  { label: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Exams', path: '/admin/exams', icon: FileSpreadsheet },
  { label: 'Fees', path: '/admin/fees', icon: CreditCard },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        {/* Navigation Sidebar Drawer */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={adminNavItems}
          settingsPath="/admin/settings"
        />

        {/* Content Area */}
        <main className="flex-1 flex flex-col px-6 pb-6 pt-3 md:px-8 md:pb-8 md:pt-4 max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
