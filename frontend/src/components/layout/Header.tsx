import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setOrganization } from '../../app/slices/organizationSlice';
import { getOrganizationSettingsApi } from '../../api/settingsApi';
import { Badge } from '../Badge';
import { Menu, User } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const org = useAppSelector((state) => state.organization.organization);
  const displayName = org?.name || 'EduCore';
  const logoUrl = org?.logoPath || null;

  useEffect(() => {
    if (!org) {
      getOrganizationSettingsApi()
        .then((response) => {
          const orgData = (response.data as any)?._props || response.data;
          dispatch(setOrganization(orgData));
        })
        .catch((err) => {
          console.error("Failed to load organization settings in header:", err);
        });
    }
  }, [org, dispatch]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'teacher':
        return 'success';
      case 'student':
        return 'warning';
      default:
        return 'neutral';
    }
  };


  return (
    <header className="sticky top-0 z-35 flex h-16 w-full items-center justify-between border-b border-neutral-200/60 bg-white/95 px-4 shadow-sm backdrop-blur-xs sm:px-6">
      {/* Left section: Toggle + Org Logo + Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 md:hidden focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${displayName} logo`}
              className="h-9 w-9 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-bold text-white text-lg shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden text-lg font-bold text-neutral-800 tracking-tight sm:block">
            {displayName}
          </span>
        </div>
      </div>

      {/* Right section: User Profile Info */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            {/* User Profile Info */}
            <div className="flex items-center gap-2.5 rounded-xl p-1.5 border border-brand-200 bg-neutral-50/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 overflow-hidden border border-brand-100/50">
                {user.photo ? (
                  <img src={user.photo} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
              </div>
              <div className="hidden text-left sm:block pr-1">
                <div className="text-xs font-semibold text-neutral-700">
                  {user.email.split('@')[0]}
                </div>
                <div className="mt-0.5">
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
