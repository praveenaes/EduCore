import React, { useCallback, useEffect, useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import { BookOpen, Plus, Users, Calendar, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { getTeacherHomeworksApi, deleteHomeworkApi } from '../../services/homeworkService';
import type { Homework } from '../../types/homework';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { CreateHomeworkModal } from '../../features/homework/components/CreateHomeworkModal';
import { HomeworkSubmissionsModal } from '../../features/homework/components/HomeworkSubmissionsModal';

const PAGE_LIMIT = 10;

export const TeacherHomeworkPage: React.FC = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [selectedHomeworkForSubmissions, setSelectedHomeworkForSubmissions] = useState<Homework | null>(null);
  const [deletingHomework, setDeletingHomework] = useState<Homework | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  const fetchHomeworks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTeacherHomeworksApi({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setHomeworks(res.data.data.homeworks || []);
      setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load homework assignments.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, setPaginationData]);

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  const handleConfirmDelete = async () => {
    if (!deletingHomework) return;
    const hwToDelete = deletingHomework;
    setDeletingHomework(null);
    setIsDeleting(true);
    try {
      await deleteHomeworkApi(hwToDelete.id);
      setToast({
        message: `Homework "${hwToDelete.title}" deleted successfully.`,
        type: 'success',
      });
      fetchHomeworks();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete homework assignment.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumn<Homework>[] = [
    {
      header: 'Title',
      accessor: (hw) => (
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-200/60 font-semibold text-xs mt-0.5">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 line-clamp-1">{hw.title}</p>
            {hw.description ? (
              <p className="text-xs text-neutral-400 line-clamp-1 max-w-sm">{hw.description}</p>
            ) : (
              <p className="text-xs text-neutral-400 italic">No description</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Batch',
      accessor: (hw) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-700">{hw.batchName || 'Batch'}</span>
          {hw.subjectName && (
            <div className="text-neutral-400">{hw.subjectName}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessor: (hw) => {
        const due = new Date(hw.dueDate);
        const isPast = due < new Date();
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <span className={isPast ? 'text-rose-600 font-medium' : 'text-neutral-700 font-medium'}>
              {due.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Submissions',
      accessor: (hw) => {
        const submitted = hw.submittedCount ?? 0;
        const total = hw.totalStudents ?? 0;
        const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
        return (
          <div className="w-28 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>{submitted} / {total}</span>
              <span className="font-semibold text-neutral-400">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (hw) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Users className="h-3.5 w-3.5 text-brand-600" />}
            onClick={() => setSelectedHomeworkForSubmissions(hw)}
            className="text-xs hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 shadow-2xs"
          >
            Submissions
          </Button>
          <button
            type="button"
            onClick={() => setEditingHomework(hw)}
            className="p-1.5 text-neutral-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition"
            title="Edit Homework"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingHomework(hw)}
            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
            title="Delete Homework"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-6">
  {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        )}

{/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Homework Assignments</h1>
            <p className="text-sm text-neutral-450 mt-0.5">
              {pagination.total} assignment{pagination.total !== 1 ? 's' : ''} created
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Homework
          </Button>
        </div>

        {/* Search */}
        <SearchBox
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search by assignment title, batch, or subject…"
        />

 {/* Content */}
        {error ? (
          <ErrorState message={error} onRetry={fetchHomeworks} />
        ) : homeworks.length === 0 && !isLoading ? (
          <EmptyState
            title={debouncedSearch ? 'No Matching Assignments Found' : 'No Homework Assigned Yet'}
            description={
              debouncedSearch
                ? `No results for "${debouncedSearch}". Try a different search term.`
                : 'Click "Create Homework" above to assign problem sets or tasks to your batches.'
            }
          />
        ) : (
          <Table
            columns={columns}
            data={homeworks}
            keyExtractor={(hw) => hw.id}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && homeworks.length > 0 && (
        <div className="pt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

  {/* Modals */}
      <CreateHomeworkModal
        isOpen={isCreateModalOpen || Boolean(editingHomework)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingHomework(null);
        }}
        onSuccess={() => {
          fetchHomeworks();
          setToast({
            message: editingHomework
              ? 'Homework assignment updated successfully.'
              : 'Homework assignment created successfully.',
            type: 'success',
          });
        }}
        homework={editingHomework}
      />

      <HomeworkSubmissionsModal
        isOpen={!!selectedHomeworkForSubmissions}
        onClose={() => setSelectedHomeworkForSubmissions(null)}
        homework={selectedHomeworkForSubmissions}
      />

 {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingHomework)}
        title="Delete Homework Assignment"
        message={`Are you sure you want to delete "${deletingHomework?.title}"? This action cannot be undone.`}
        confirmText="Delete Assignment"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingHomework(null)}
      />
    </div>
  );
};

export default TeacherHomeworkPage;
