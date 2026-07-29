import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import type { SidebarItem } from '../components/layout/Sidebar';

interface AppShellLayoutProps {
  sidebarItems: SidebarItem[];
  settingsPath: string;
  className?: string;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  sidebarItems,
  settingsPath,
  className = '',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`flex min-h-screen flex-col bg-neutral-50 ${className}`}>
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        {/* Navigation Sidebar Drawer */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={sidebarItems}
          settingsPath={settingsPath}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShellLayout;
