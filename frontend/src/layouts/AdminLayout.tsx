import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import type { SidebarItem } from '../components/layout/Sidebar';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  ClipboardCheck,
  BookOpen,
  Building2,
  CreditCard,
  Bell,
} from 'lucide-react';

//---------------------------------

         /*real routes */

//---------------------------------       

const adminNavItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/admin/students', icon: Users },
  { label: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
  { label: 'Batches', path: '/admin/batches', icon: Layers },
  {
    label: 'Assessments',
    icon: ClipboardCheck,
    children: [
      { label: 'Results', path: '/admin/assessments/results' },
      { label: 'Schedules', path: '/admin/assessments/schedules' },
      { label: 'Assessment Criteria', path: '/admin/assessments/criteria' },
      { label: 'Assessment Events', path: '/admin/assessments' },
    ],
  },
  {
    label: 'Academics',
    icon: BookOpen,
    children: [
      { label: 'Subject Assignments', path: '/admin/subject-assignments' },
      { label: 'Subjects', path: '/admin/subjects' },
      { label: 'Courses', path: '/admin/courses' },
      { label: 'Programs', path: '/admin/programs' },
      { label: 'Academic Years', path: '/admin/academic-years' },
    ],
  },
  { label: 'Centers', path: '/admin/centers', icon: Building2 },
  { label: 'Fees', path: '/admin/fees', icon: CreditCard },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
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
        <main className="flex-1 min-w-0 flex flex-col px-6 pb-6 pt-3 md:px-8 md:pb-8 md:pt-4 max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
