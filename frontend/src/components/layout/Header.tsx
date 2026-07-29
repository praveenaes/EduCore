import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearUser } from '../../app/slices/authSlice';
import { clearOrganization, setOrganization } from '../../app/slices/organizationSlice';
import { logoutUserApi } from '../../api/authApi';
import { getOrganizationSettingsApi } from '../../api/settingsApi';
import { Badge } from '../Badge';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const org = useAppSelector((state) => state.organization.organization);
  const displayName = org?.name || 'EduCore';
  const logoUrl = org?.logoPath || null;

  useEffect(() => {
    if (!org) {
      getOrganizationSettingsApi()
        .then((response) => {
          dispatch(setOrganization(response.data));
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

  const handleLogoutClick = async () => {
    setDropdownOpen(false);
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

      {/* Right section: User Profile Menu */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-neutral-50 border border-transparent hover:border-neutral-200/40 transition-all duration-200 focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 overflow-hidden">
                {user.photo ? (
                  <img src={user.photo} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold text-neutral-700">
                  {user.email.split('@')[0]}
                </div>
                <div className="mt-0.5">
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop overlay to close dropdown */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 z-50 w-52 rounded-xl border border-neutral-200/50 bg-white p-1 shadow-lg transform origin-top-right transition-all">
                  <button
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
