import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../../app/slices/notificationSlice';
import {  checkAndPlayUnreadNotification } from '../../utils/soundHelper';
import { Bell, CheckCheck, Inbox  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notification
  );
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user?.role?.toUpperCase() !== 'ADMIN' && notifications.length > 0) {
      checkAndPlayUnreadNotification(notifications);
    }
  }, [user, notifications]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNotificationClick = (item: any) => {
    if (item.status !== 'READ') {
      dispatch(markAsRead(item.id || item.notificationId));
    }
    setIsOpen(false);
    if (item.metadata?.linkUrl) {
      navigate(item.metadata.linkUrl);
    } else {
      if (user?.role?.toUpperCase() === 'STUDENT') {
        navigate('/student/notifications');
      } else if (user?.role?.toUpperCase() === 'TEACHER') {
        navigate('/teacher/notifications');
      } else {
        navigate('/admin/notifications');
      }
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-neutral-200 bg-white shadow-xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playNotificationSound('normal');
                }}
                title="Test standard notification chime"
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-brand-600 transition-colors cursor-pointer"
              >
                <Volume2 className="h-3 w-3" />
                <span>Chime</span>
              </button> */}
              {/* <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playNotificationSound('alert');
                }}
                title="Test urgent alert sound"
                className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-700 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>Alert</span>
              </button> */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors ml-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 divide-y divide-neutral-100 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="rounded-full bg-neutral-100 p-3 text-neutral-400">
                  <Inbox className="h-6 w-6" />
                </div>
                <p className="mt-2 text-sm font-medium text-neutral-700">No notifications yet</p>
                <p className="text-xs text-neutral-400">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = item.status !== 'READ';
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-neutral-50 ${
                      isUnread ? 'bg-brand-50/30' : ''
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        isUnread ? 'bg-brand-600' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs ${isUnread ? 'font-bold text-neutral-900' : 'font-medium text-neutral-700'} truncate`}>
                          {item.notificationTitle || 'Notification'}
                        </p>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {formatTime(item.notificationCreatedAt || item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-600 line-clamp-2">
                        {item.notificationMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationDropdown;