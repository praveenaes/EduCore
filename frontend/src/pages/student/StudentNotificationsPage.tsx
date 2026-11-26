import React, { useCallback, useEffect, useState } from 'react';
import { CheckCheck, ExternalLink } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { NotificationTypeIcon, isAlertNotification } from '../../components/NotificationTypeIcon';
import { SearchBox } from '../../components/SearchBox';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { usePagination } from '../../hooks/usePagination';
import {
  getMyNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../../types/notification';

const PAGE_LIMIT = 10;

export const StudentNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, setPaginationData, totalPages, setPage } = pagination;
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyNotificationsApi({
        page,
        limit,
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const data = response.data.data;
      setNotifications(data.recipients || []);
      setUnreadCount(data.unreadCount || 0);
      const total = data.total || 0;
      setPaginationData(total, Math.ceil(total / limit) || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, setPaginationData]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.status === 'READ') return;
    try {
      await markNotificationAsReadApi(item.id || item.notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, status: 'READ' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    handleMarkAsRead(item);
    if (item.metadata?.linkUrl) {
      navigate(item.metadata.linkUrl);
    }
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Notifications</h1>
          <p className="text-sm text-neutral-500">
            View announcements, homework notices, and exam updates.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4 text-brand-600" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <SearchBox value={search} onChange={setSearch} placeholder="Search notifications..." />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-400">
          Loading notifications...
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You don't have any notifications at the moment."
        />
      ) : (
        <div className="space-y-3">
          <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
            {notifications.map((item) => {
              const isUnread = item.status !== 'READ';
              const isAlert = isAlertNotification(item.notificationTitle);
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-neutral-50 ${
                    isUnread ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotificationTypeIcon title={item.notificationTitle} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4
                          className={`text-sm ${
                            isUnread ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-700'
                          }`}
                        >
                          {item.notificationTitle || 'Notification'}
                        </h4>
                        {isAlert && <Badge variant="danger">Alert</Badge>}
                        {isUnread && <Badge variant="info">New</Badge>}
                      </div>
                      <span className="text-xs text-neutral-400 shrink-0">
                        {formatTime(item.notificationCreatedAt || item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600 whitespace-pre-line">
                      {item.notificationMessage}
                    </p>
                    {item.metadata?.linkUrl && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800">
                        <span>View Details</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center p-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default StudentNotificationsPage;
