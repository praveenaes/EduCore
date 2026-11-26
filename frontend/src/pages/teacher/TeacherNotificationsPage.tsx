import React, { useCallback, useEffect, useState } from 'react';
import {
  Send,
  AlertTriangle,
  CheckCheck,
  Calendar,
  Clock,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select, type SelectOption } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { NotificationTypeIcon, isAlertNotification } from '../../components/NotificationTypeIcon';
import { usePagination } from '../../hooks/usePagination';
import {
  getMyNotificationsApi,
  getSentNotificationsApi,
  createNotificationApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../../services/notificationService';
import { getBatchesApi } from '../../services/batchService';
import type {
  DeliveryChannel,
  NotificationItem,
  NotificationTargetType,
} from '../../types/notification';

const PAGE_LIMIT = 10;

const TEACHER_TITLE_PRESETS: SelectOption[] = [
  { value: 'Class Rescheduled', label: 'Class Rescheduled' },
  { value: 'Assignment Due Reminder', label: 'Assignment Due Reminder' },
  { value: 'Exam & Assessment Notice', label: 'Exam & Assessment Notice' },
  { value: 'Homework Assigned', label: 'Homework Assigned' },
  { value: 'Quiz Scheduled', label: 'Quiz Scheduled' },
  { value: 'Important Alert', label: 'Important Alert' },
  { value: 'Lab Session Update', label: 'Lab Session Update' },
  { value: 'General Batch Announcement', label: 'General Batch Announcement' },
  { value: 'CUSTOM', label: '-- Custom Title --' },
];

export const TeacherNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  const [inboxNotifications, setInboxNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const inboxPagination = usePagination({ initialLimit: PAGE_LIMIT });
  const [inboxSearch, setInboxSearch] = useState('');
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);

  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const sentPagination = usePagination({ initialLimit: PAGE_LIMIT });
  const [sentSearch, setSentSearch] = useState('');
  const [isSentLoading, setIsSentLoading] = useState(false);
  const [sentError, setSentError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [titlePreset, setTitlePreset] = useState('Class Rescheduled');
  const [customTitle, setCustomTitle] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>('IN_APP');
  const [targetType, setTargetType] = useState<NotificationTargetType>('BATCH');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [batches, setBatches] = useState<any[]>([]);

  const loadInboxNotifications = useCallback(async () => {
    setIsInboxLoading(true);
    setInboxError(null);
    try {
      const response = await getMyNotificationsApi({
        page: inboxPagination.page,
        limit: inboxPagination.limit,
        search: inboxSearch,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const data = response.data.data;
      setInboxNotifications(data.recipients || []);
      setUnreadCount(data.unreadCount || 0);
      const total = data.total || 0;
      inboxPagination.setPaginationData(total, Math.ceil(total / inboxPagination.limit) || 1);
    } catch (err: any) {
      setInboxError(err.response?.data?.message || 'Failed to load inbox notifications');
    } finally {
      setIsInboxLoading(false);
    }
  }, [inboxPagination.page, inboxPagination.limit, inboxSearch, inboxPagination.setPaginationData]);

  const loadSentNotifications = useCallback(async () => {
    setIsSentLoading(true);
    setSentError(null);
    try {
      const response = await getSentNotificationsApi({
        page: sentPagination.page,
        limit: sentPagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const data = response.data.data;
      setSentNotifications(data.notifications || []);
      const total = data.total || 0;
      sentPagination.setPaginationData(total, Math.ceil(total / sentPagination.limit) || 1);
    } catch (err: any) {
      setSentError(err.response?.data?.message || 'Failed to load sent notifications');
    } finally {
      setIsSentLoading(false);
    }
  }, [sentPagination.page, sentPagination.limit, sentPagination.setPaginationData]);

  useEffect(() => {
    if (activeTab === 'inbox') {
      loadInboxNotifications();
    } else {
      loadSentNotifications();
    }
  }, [activeTab, loadInboxNotifications, loadSentNotifications]);

  useEffect(() => {
    if (showModal && targetType === 'BATCH' && batches.length === 0) {
      getBatchesApi({ page: 1, limit: 100 }).then((res: any) =>
        setBatches(res.data.data.batches || [])
      ).catch(() => {});
    }
  }, [showModal, targetType, batches.length]);

  const handleOpenModal = () => {
    setTitlePreset('Class Rescheduled');
    setCustomTitle('');
    setMessage('');
    setDeliveryChannel('IN_APP');
    setTargetType('BATCH');
    setSelectedTargetId('');
    setFormError(null);
    setShowModal(true);
  };

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.status === 'READ') return;
    try {
      await markNotificationAsReadApi(item.id || item.notificationId);
      setInboxNotifications((prev) =>
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
      setInboxNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = titlePreset === 'CUSTOM' ? customTitle.trim() : titlePreset;

    if (!finalTitle) {
      setFormError('Title is required');
      return;
    }
    if (!message.trim()) {
      setFormError('Message is required');
      return;
    }
    if (targetType === 'BATCH' && !selectedTargetId) {
      setFormError('Please select a batch');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await createNotificationApi({
        title: finalTitle,
        message: message.trim(),
        deliveryChannel,
        targetType,
        targetIds: selectedTargetId ? [selectedTargetId] : [],
      });
      setShowModal(false);
      setActiveTab('sent');
      loadSentNotifications();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentSelectionAlert =
    titlePreset === 'Important Alert' ||
    titlePreset === 'Exam & Assessment Notice' ||
    customTitle.toLowerCase().includes('alert') ||
    customTitle.toLowerCase().includes('urgent');

  const sentColumns: TableColumn<any>[] = [
    {
      header: 'Title',
      accessor: (row: any) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{row.title}</span>
            {row.title.toLowerCase().includes('alert') && (
              <Badge variant="danger">Alert</Badge>
            )}
          </div>
          <span className="text-xs text-neutral-500 line-clamp-1">{row.message}</span>
        </div>
      ),
    },
    {
      header: 'Audience',
      accessor: (row: any) => (
        <Badge variant={row.targetType === 'BATCH' ? 'info' : 'neutral'}>
          {row.targetType}
        </Badge>
      ),
    },
    {
      header: 'Channel',
      accessor: (row: any) => (
        <span className="text-xs font-medium text-neutral-600">{row.deliveryChannel}</span>
      ),
    },
    {
      header: 'Sent Date',
      accessor: (row: any) => (
        <span className="text-xs text-neutral-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const filteredSentNotifications = sentNotifications.filter((n) =>
    sentSearch ? n.title.toLowerCase().includes(sentSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Notifications</h1>
          <p className="text-sm text-neutral-500">
            View administrative notices and send announcements to your batches
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'inbox' && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4 text-brand-600" />
              Mark all as read ({unreadCount})
            </Button>
          )}
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </div>

      <div className="border-b border-neutral-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'inbox'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Received Notices {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sent'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Sent Announcements
          </button>
        </nav>
      </div>

      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="w-full sm:w-72">
            <SearchBox
              value={inboxSearch}
              onChange={setInboxSearch}
              placeholder="Search received notices..."
            />
          </div>

          {isInboxLoading ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-400">
              Loading notices...
            </div>
          ) : inboxError ? (
            <ErrorState message={inboxError} onRetry={loadInboxNotifications} />
          ) : inboxNotifications.length === 0 ? (
            <EmptyState
              title="No notifications received"
              description="You do not have any notices at the moment."
            />
          ) : (
            <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
              {inboxNotifications.map((item) => {
                const isUnread = item.status !== 'READ';
                const isAlert = isAlertNotification(item.notificationTitle);

                return (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between p-4 transition-colors ${
                      isUnread ? 'bg-blue-50/40' : 'bg-white hover:bg-neutral-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <NotificationTypeIcon title={item.notificationTitle} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm ${isUnread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                            {item.notificationTitle || 'Notice'}
                          </h4>
                          {isAlert && <Badge variant="danger">Alert</Badge>}
                          {isUnread && <Badge variant="info">New</Badge>}
                        </div>
                        <p className="text-sm text-neutral-600 whitespace-pre-line">
                          {item.notificationMessage}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-400">
                          {item.creatorName && (
                            <span>By: {item.creatorName}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.notificationCreatedAt ? new Date(item.notificationCreatedAt).toLocaleDateString() : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.notificationCreatedAt ? new Date(item.notificationCreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isUnread && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(item)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {inboxPagination.totalPages > 1 && (
            <div className="p-4">
              <Pagination
                currentPage={inboxPagination.page}
                totalPages={inboxPagination.totalPages}
                onPageChange={inboxPagination.setPage}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div className="space-y-4">
          <div className="w-full sm:w-72">
            <SearchBox
              value={sentSearch}
              onChange={setSentSearch}
              placeholder="Search sent announcements..."
            />
          </div>

          {isSentLoading ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-400">
              Loading sent announcements...
            </div>
          ) : sentError ? (
            <ErrorState message={sentError} onRetry={loadSentNotifications} />
          ) : filteredSentNotifications.length === 0 ? (
            <EmptyState
              title="No announcements sent"
              description="Send your first batch notice or exam alert to your students."
              action={
                <Button onClick={handleOpenModal} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Announcement
                </Button>
              }
            />
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
              <Table
                columns={sentColumns}
                data={filteredSentNotifications}
                keyExtractor={(row: any) => row.id}
              />
              {sentPagination.totalPages > 1 && (
                <div className="border-t border-neutral-100 p-4">
                  <Pagination
                    currentPage={sentPagination.page}
                    totalPages={sentPagination.totalPages}
                    onPageChange={sentPagination.setPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Send Announcement"
        size="lg"
      >
        <form onSubmit={handleCreateNotification} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Select Preset Title
            </label>
            <Select
              options={TEACHER_TITLE_PRESETS}
              value={titlePreset}
              onChange={(e) => setTitlePreset(e.target.value)}
            />
          </div>

          {titlePreset === 'CUSTOM' && (
            <Input
              label="Custom Title *"
              placeholder="e.g. Extra Physics Revision Class"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              required
            />
          )}

          {isCurrentSelectionAlert && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Urgent Notice:</strong> This title triggers an immediate chime alert sound on student portals.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Audience Scope
              </label>
              <Select
                options={[
                  { value: 'BATCH', label: 'Specific Batch' },
                  { value: 'ALL', label: 'All Students' },
                ]}
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as NotificationTargetType);
                  setSelectedTargetId('');
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Delivery Channel
              </label>
              <Select
                options={[
                  { value: 'IN_APP', label: 'In-App Portal Only' },
                  { value: 'EMAIL', label: 'In-App + Email' },
                ]}
                value={deliveryChannel}
                onChange={(e) => setDeliveryChannel(e.target.value as DeliveryChannel)}
              />
            </div>
          </div>

          {targetType === 'BATCH' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Select Batch *
              </label>
              <Select
                options={[
                  { value: '', label: '-- Select Batch --' },
                  ...batches.map((b) => ({
                    value: b.id || b._id,
                    label: `${b.name || 'Unnamed Batch'} (${b.code || 'No code'})`,
                  })),
                ]}
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Message Content *
            </label>
            <textarea
              rows={4}
              required
              className="block w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              placeholder="Write the announcement message details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherNotificationsPage;