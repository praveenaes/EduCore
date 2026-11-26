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
  MessageSquare,
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
      { label: 'Assessment Events', path: '/admin/assessments' },
      { label: 'Results', path: '/admin/assessments/results' },
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
  { label: 'Chat & AI Copilot', path: '/admin/chat', icon: MessageSquare },
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
        <main className="flex-1 overflow-x-hidden p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
