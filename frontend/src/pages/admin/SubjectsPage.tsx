import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { usePagination } from '../../hooks/usePagination';
import { getSubjectsApi, deleteSubjectApi } from '../../services/subjectService';
import type { Subject } from '../../types/subject';
import SubjectModal from '../../features/subjects/components/SubjectModal';

const PAGE_LIMIT = 5;

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting states
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Delete confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    subject: Subject | null;
  }>({ show: false, subject: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification (bottom-right corner)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    resetPage();
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSubjectsApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      setSubjects(res.data.data.subjects);
      setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load subjects.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder, setPaginationData]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Open Edit Modal
  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowModal(true);
  };

  // Open Add Modal
  const handleAddNew = () => {
    setSelectedSubject(null);
    setShowModal(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.subject) return;
    setIsDeleting(true);
    try {
      await deleteSubjectApi(deleteConfirm.subject.id);
      setToast({
        message: `Subject "${deleteConfirm.subject.name}" deleted successfully.`,
        type: 'success',
      });
      setDeleteConfirm({ show: false, subject: null });
      await fetchSubjects();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete subject.';
      setToast({ message: msg, type: 'error' });
      setDeleteConfirm({ show: false, subject: null });
    } finally {
      setIsDeleting(false);
    }
  };

  // Columns definition
  const columns: TableColumn<Subject>[] = [
    {
      header: 'Subject Name',
      sortField: 'name',
      accessor: (s) => (
        <span className="font-semibold text-neutral-800">
          {s.name}
        </span>
      ),
    },
    {
      header: 'Code',
      sortField: 'code',
      accessor: (s) => (
        <span className="font-mono text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded font-medium">
          {s.code}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (s) => (
        <span className="text-neutral-500 line-clamp-1 max-w-xs">
          {s.description || '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(s)}
            title="Edit Subject"
            className="p-1 text-neutral-400 hover:text-brand-600 rounded transition-colors cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, subject: s })}
            title="Delete Subject"
            className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
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
        {/* Toast (bottom-right corner) */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Subjects</h1>
            <p className="text-sm text-neutral-500">
              Manage master subjects taught across courses and semesters.
            </p>
          </div>
          <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Subject
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-72">
            <SearchBox
              placeholder="Search subjects by name or code…"
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>

        {/* Table / Error / Empty States */}
        {error ? (
          <ErrorState message={error} onRetry={fetchSubjects} />
        ) : subjects.length === 0 && !isLoading ? (
          <EmptyState
            title="No subjects found"
            description={
              debouncedSearch
                ? `No subjects matching "${debouncedSearch}". Try a different search.`
                : 'Get started by creating your first subject.'
            }
            action={
              !debouncedSearch && (
                <Button size="sm" onClick={handleAddNew}>
                  Add Your First Subject
                </Button>
              )
            }
          />
        ) : (
          <Table
            columns={columns}
            data={subjects}
            keyExtractor={(s) => s.id}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Pagination */}
      {subjects.length > 0 && !isLoading && totalPages > 1 && (
        <div className="mt-auto pt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <SubjectModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSubject(null);
          }}
          onSuccess={() => {
            fetchSubjects();
            setToast({
              message: selectedSubject
                ? 'Subject updated successfully.'
                : 'Subject created successfully.',
              type: 'success',
            });
          }}
          subject={selectedSubject}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteConfirm.subject?.name}"?\nThis action cannot be undone.`}
        confirmText="Delete Subject"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, subject: null })}
      />
    </div>
  );
};

export default SubjectsPage;
