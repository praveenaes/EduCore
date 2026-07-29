import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, Download } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import AddTeacherModal from '../../features/teachers/components/AddTeacherModal';
import TeacherDetailsModal from '../../features/teachers/components/TeacherDetailsModal';
import {
  getTeachersApi,
  exportTeachersCsvApi,
  toggleTeacherStatusApi,
} from '../../services/teacherService';
import type { Teacher } from '../../types/teacher';
import { getPhotoUrl } from '../../utils/photo';

const PAGE_LIMIT = 5;

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTeachersApi({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch || undefined,
      });
      setTeachers(data.teachers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError('Failed to load teachers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    void fetchTeachers();
  }, [fetchTeachers]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleToggleStatus = async (teacher: Teacher) => {
    setTogglingId(teacher.id);
    try {
      await toggleTeacherStatusApi(teacher.id, !teacher.isActive);
      setToast({
        message: teacher.isActive
          ? `${teacher.firstName} ${teacher.lastName} has been deactivated.`
          : `${teacher.firstName} ${teacher.lastName} has been activated.`,
        type: 'success',
      });
      await fetchTeachers();
    } catch {
      setToast({ message: 'Failed to update teacher status.', type: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  // CSV export
  const handleExport = async () => {
    try {
      const blob = await exportTeachersCsvApi({ search: debouncedSearch || undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teachers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export CSV.');
    }
  };

  const columns: TableColumn<Teacher>[] = [
    {
      header: 'Teacher',
      accessor: (t) => (
        <button
          onClick={() => setSelectedTeacher(t)}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            {t.photo ? (
              <img
                src={getPhotoUrl(t.photo)}
                alt={t.firstName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-neutral-400 uppercase">
                {t.firstName?.[0]}
                {t.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-neutral-800 hover:text-brand-600 transition-colors">
              {t.firstName} {t.lastName}
            </p>
            <p className="text-xs text-neutral-400">{t.email}</p>
          </div>
        </button>
      ),
    },
    {
      header: 'Employee ID',
      accessor: (t) => (
        <span className="font-mono text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
          {t.employeeId}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: (t) => <span className="text-neutral-600">{t.phone}</span>,
    },
    {
      header: 'Status',
      accessor: (t) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            t.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              t.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          {t.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (t) => (
        <button
          id={`toggle-teacher-${t.id}`}
          onClick={() => handleToggleStatus(t)}
          disabled={togglingId === t.id}
          className={`text-xs font-semibold transition-colors cursor-pointer ${
            togglingId === t.id
              ? 'text-neutral-400 cursor-wait'
              : t.isActive !== false
                ? 'text-red-600 hover:text-red-800 hover:underline'
                : 'text-emerald-600 hover:text-emerald-800 hover:underline'
          }`}
        >
          {togglingId === t.id ? '…' : t.isActive !== false ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Teachers</h1>
          <p className="text-sm text-neutral-450 mt-0.5">
            {total} teacher{total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            disabled={teachers.length === 0}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Search */}
      <SearchBox
        value={search}
        onChange={(v) => setSearch(v)}
        placeholder="Search by name, employee ID, or email…"
      />

      {/* Content */}
      {error ? (
        <ErrorState message={error} onRetry={fetchTeachers} />
      ) : teachers.length === 0 && !isLoading ? (
        <EmptyState
          title="No Teachers Registered Yet"
          description={
            debouncedSearch
              ? `No results for "${debouncedSearch}". Try a different search term.`
              : 'Click "Add Teacher" to register the first teacher.'
          }
          action={
            !debouncedSearch && (
              <Button size="sm" onClick={() => setShowAddModal(true)}>
                Register Your First Teacher
              </Button>
            )
          }
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={teachers}
            keyExtractor={(t) => t.id}
            isLoading={isLoading}
          />
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddTeacherModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => void fetchTeachers()}
        />
      )}
      {selectedTeacher && (
        <TeacherDetailsModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onUpdated={() => void fetchTeachers()}
          onDeleted={() => void fetchTeachers()}
        />
      )}
    </div>
  );
};

export default TeachersPage;
