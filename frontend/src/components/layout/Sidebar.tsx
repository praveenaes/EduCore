import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Settings, LogOut } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { clearUser } from '../../app/slices/authSlice';
import { clearOrganization } from '../../app/slices/organizationSlice';
import { logoutUserApi } from '../../api/authApi';


export interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  settingsPath: string;
}

const NavItem: React.FC<{ item: SidebarItem; onClose: () => void }> = ({ item, onClose }) => (
  <NavLink
    to={item.path}
    end={item.path.split('/').length === 2}
    onClick={onClose}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-brand-50 text-brand-600 shadow-xs'
          : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
      }`
    }
  >
    {({ isActive }) => {
      const Icon = item.icon;
      return (
        <>
          <Icon
            className={`h-4.5 w-4.5 transition-colors duration-200 ${
              isActive ? 'text-brand-600' : 'text-neutral-450'
            }`}
          />
          <span>{item.label}</span>
        </>
      );
    }}
  </NavLink>
);

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  items,
  settingsPath,
}) => {
  const displayName = 'EduCore';
  const logoUrl = null;
  const dispatch = useAppDispatch();

  const handleLogoutClick = async () => {
    onClose();
    try {
      await logoutUserApi();
    } catch (err) {
      console.error("Logout call failed", err);
    } finally {
      dispatch(clearUser());
      dispatch(clearOrganization());
    }
  };

 

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-45 w-64 border-r border-neutral-200/65 bg-white transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Org branding header (mobile only) */}
          <div className="flex items-center gap-2.5 border-b border-neutral-100 px-4 py-3.5 md:hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${displayName} logo`}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold text-white text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-bold text-neutral-800 tracking-tight">{displayName}</span>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {items.map((item) => (
              <NavItem key={item.label} item={item} onClose={onClose} />
            ))}
          </nav>

          {/* Bottom Section: Settings & Logout */}
          <div className="border-t border-neutral-100 px-3 py-3 space-y-1">
            <NavLink
              to={settingsPath}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 shadow-xs'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Settings
                    className={`h-4.5 w-4.5 transition-colors duration-200 ${
                      isActive ? 'text-brand-600' : 'text-neutral-450'
                    }`}
                  />
                  <span>Settings</span>
                </>
              )}
            </NavLink>

            <button
              onClick={handleLogoutClick}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-500 hover:bg-red-100 hover:text-red-700 transition-all duration-200 focus:outline-none cursor-pointer group"
            >
              <LogOut className="h-4.5 w-4.5 text-neutral-450 group-hover:text-red-700 transition-colors duration-200" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
