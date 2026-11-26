import React, { useCallback, useEffect, useState } from 'react';
import { Send, Bell, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { usePagination } from '../../hooks/usePagination';
import {
  getSentNotificationsApi,
  createNotificationApi,
} from '../../services/notificationService';
import { getCentersApi } from '../../services/centerService';
import { getCoursesApi } from '../../services/courseService';
import { getBatchesApi } from '../../services/batchService';
import type { DeliveryChannel, NotificationTargetType } from '../../types/notification';

const PAGE_LIMIT = 5;

const NOTIFICATION_TITLE_PRESETS = [
  { value: 'General Announcement', label: 'General Announcement' },
  { value: 'Important Alert', label: 'Important Alert' },
  { value: 'Emergency Notice', label: 'Emergency Notice' },
  { value: 'Holiday Notice', label: 'Holiday Notice' },
  { value: 'Exam & Assessment Notice', label: 'Exam & Assessment Notice' },
  { value: 'Homework & Assignment Update', label: 'Homework & Assignment Update' },
  { value: 'Attendance Warning', label: 'Attendance Warning' },
  { value: 'Fee Due Reminder', label: 'Fee Due Reminder' },
  { value: 'Event & Extracurricular Notice', label: 'Event & Extracurricular Notice' },
  { value: 'CUSTOM', label: '-- Custom Title --' },
];

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, setPaginationData, totalPages, setPage } = pagination;
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [titlePreset, setTitlePreset] = useState('General Announcement');
  const [customTitle, setCustomTitle] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>('IN_APP');
  const [targetType, setTargetType] = useState<NotificationTargetType>('ALL');
  const [selectedTargetId, setSelectedTargetId] = useState('');

  const [centers, setCenters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const loadSentNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSentNotificationsApi({
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const data = response.data.data;
      setNotifications(data.notifications || []);
      const total = data.total || 0;
      setPaginationData(total, Math.ceil(total / limit) || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, setPaginationData]);

  useEffect(() => {
    loadSentNotifications();
  }, [loadSentNotifications]);

  useEffect(() => {
    if (showModal) {
      if (targetType === 'CENTER' && centers.length === 0) {
        getCentersApi({ page: 1, limit: 100 }).then((res: any) =>
          setCenters(res.data.data.centers || [])
        );
      } else if (targetType === 'COURSE' && courses.length === 0) {
        getCoursesApi({ page: 1, limit: 100 }).then((res: any) =>
          setCourses(res.data.data.courses || [])
        );
      } else if (targetType === 'BATCH' && batches.length === 0) {
        getBatchesApi({ page: 1, limit: 100 }).then((res: any) =>
          setBatches(res.data.data.batches || [])
        );
      }
    }
  }, [showModal, targetType, centers.length, courses.length, batches.length]);

  const handleOpenModal = () => {
    setTitlePreset('General Announcement');
    setCustomTitle('');
    setMessage('');
    setDeliveryChannel('IN_APP');
    setTargetType('ALL');
    setSelectedTargetId('');
    setFormError(null);
    setShowModal(true);
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
    if (targetType !== 'ALL' && !selectedTargetId) {
      setFormError(`Please select a ${targetType.toLowerCase()}`);
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
      loadSentNotifications();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: TableColumn<any>[] = [
    {
      header: 'Announcement',
      accessor: (row: any) => {
        const isAlert =
          row.title.toLowerCase().includes('alert') ||
          row.title.toLowerCase().includes('emergency') ||
          row.title.toLowerCase().includes('warning');

        return (
          <div className="max-w-md">
            <div className="flex items-center gap-1.5">
              {isAlert && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              <p className="font-semibold text-neutral-900">{row.title}</p>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{row.message}</p>
          </div>
        );
      },
    },
    {
      header: 'Target Audience',
      accessor: (row: any) => (
        <Badge
          variant={
            row.targetType === 'ALL'
              ? 'info'
              : row.targetType === 'CENTER'
              ? 'warning'
              : row.targetType === 'BATCH'
              ? 'success'
              : 'neutral'
          }
        >
          {row.targetType}
        </Badge>
      ),
    },
    {
      header: 'Channel',
      accessor: (row: any) => (
        <Badge variant={row.deliveryChannel === 'EMAIL' ? 'warning' : 'neutral'}>
          {row.deliveryChannel}
        </Badge>
      ),
    },
    {
      header: 'Sent On',
      accessor: (row: any) => (
        <span className="text-xs text-neutral-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  const filteredNotifications = notifications.filter((n) =>
    search ? n.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const isCurrentSelectionAlert =
    titlePreset === 'Important Alert' ||
    titlePreset === 'Emergency Notice' ||
    titlePreset === 'Attendance Warning';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Notifications</h1>
          <p className="text-sm text-neutral-500">
            Broadcast announcements and view delivery history.
          </p>
        </div>
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Send Notification
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <SearchBox value={search} onChange={setSearch} placeholder="Search sent notices..." />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-400">
          Loading notifications...
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadSentNotifications} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="No notifications sent"
          description="Send your first announcement to students and staff."
          action={
            <Button onClick={handleOpenModal} className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Send Notification
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
          <Table
            columns={columns}
            data={filteredNotifications}
            keyExtractor={(row: any) => row.id}
          />
        </div>
      )}

      {/* Pagination */}
      {filteredNotifications.length > 0 && !isLoading && (
        <div className="mt-auto pt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

{/* create notification */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Send Notification"
          size="lg"
        >
          <form onSubmit={handleCreateNotification} className="space-y-4">
            {formError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Select
                label="Notification Category / Title *"
                value={titlePreset}
                onChange={(e) => setTitlePreset(e.target.value)}
                options={NOTIFICATION_TITLE_PRESETS}
              />

              {isCurrentSelectionAlert && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>This category will play an audible alert chime on student & teacher portals.</span>
                </div>
              )}

              {titlePreset === 'CUSTOM' && (
                <Input
                  label="Custom Notification Title *"
                  placeholder="Enter custom title here..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-600">
                Notification Message *
              </label>
              <textarea
                className="w-full rounded-lg border border-neutral-300 p-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                rows={4}
                placeholder="Write your announcement message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Delivery Channel"
                value={deliveryChannel}
                onChange={(e) => setDeliveryChannel(e.target.value as DeliveryChannel)}
                options={[
                  { value: 'IN_APP', label: 'In-App Realtime Notification' },
                  { value: 'EMAIL', label: 'Email Only' },
                ]}
              />

              <Select
                label="Target Audience"
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as NotificationTargetType);
                  setSelectedTargetId('');
                }}
                options={[
                  { value: 'ALL', label: 'All Users (Entire Institution)' },
                  { value: 'CENTER', label: 'Specific Center' },
                  { value: 'COURSE', label: 'Specific Course' },
                  { value: 'BATCH', label: 'Specific Batch' },
                ]}
              />
            </div>

            {targetType === 'CENTER' && (
              <Select
                label="Select Center *"
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                options={[
                  { value: '', label: '-- Choose a center --' },
                  ...centers.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            )}

            {targetType === 'COURSE' && (
              <Select
                label="Select Course *"
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                options={[
                  { value: '', label: '-- Choose a course --' },
                  ...courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
                ]}
              />
            )}

            {targetType === 'BATCH' && (
              <Select
                label="Select Batch *"
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                options={[
                  { value: '', label: '-- Choose a batch --' },
                  ...batches.map((b) => ({ value: b.id, label: b.name })),
                ]}
              />
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Broadcast'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default AdminNotificationsPage;
