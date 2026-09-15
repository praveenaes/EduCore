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
import { getProgramsApi, deleteProgramApi } from '../../services/programService';
import type { Program } from '../../types/program';
import ProgramModal from '../../features/programs/components/ProgramModal';

const PAGE_LIMIT = 5;

const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Delete confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    program: Program | null;
  }>({ show: false, program: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  // Fetch programs
  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProgramsApi({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setPrograms(res.data.data.programs);
      setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load programs.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, setPaginationData]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchPrograms();
  }, [fetchPrograms]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Open Edit Modal
  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setShowModal(true);
  };

  // Open Add Modal
  const handleAddNew = () => {
    setSelectedProgram(null);
    setShowModal(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.program) return;
    setIsDeleting(true);
    try {
      await deleteProgramApi(deleteConfirm.program.id);
      setToast({
        message: `Program "${deleteConfirm.program.name}" deleted successfully.`,
        type: 'success',
      });
      setDeleteConfirm({ show: false, program: null });
      await fetchPrograms();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to delete program.';
      setToast({ message: msg, type: 'error' });
      setDeleteConfirm({ show: false, program: null });
    } finally {
      setIsDeleting(false);
    }
  };

  // Columns definition
  const columns: TableColumn<Program>[] = [
    {
      header: 'Program Name',
      sortField: 'name',
      accessor: (p) => (
        <span className="font-semibold text-neutral-800">
          {p.name}
        </span>
      ),
    },
    {
      header: 'Code',
      sortField: 'code',
      accessor: (p) => (
        <span className="font-mono text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded font-medium">
          {p.code}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (p) => (
        <span className="text-neutral-500 line-clamp-1 max-w-xs">
          {p.description || '—'}
        </span>
      ),
    },
    {
      header: 'Created At',
      accessor: (p) => (
        <span className="text-neutral-400 text-xs">
          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (p) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(p)}
            title="Edit Program"
            className="p-1 text-neutral-400 hover:text-brand-600 rounded transition-colors cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, program: p })}
            title="Delete Program"
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
        {/* Toast */}
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
            <h1 className="text-2xl font-bold text-neutral-800">Programs</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {pagination.total} program{pagination.total !== 1 ? 's' : ''} configured
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddNew}
            >
              Add Program
            </Button>
          </div>
        </div>

        {/* Search */}
        <SearchBox
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search by program name or code…"
        />

        {/* Content */}
        {error ? (
          <ErrorState message={error} onRetry={fetchPrograms} />
        ) : programs.length === 0 && !isLoading ? (
          <EmptyState
            title="No Programs Found"
            description={
              debouncedSearch
                ? `No results for "${debouncedSearch}". Try another search term.`
                : 'Get started by creating your first academic program.'
            }
            action={
              !debouncedSearch && (
                <Button size="sm" onClick={handleAddNew}>
                  Add Your First Program
                </Button>
              )
            }
          />
        ) : (
          <Table
            columns={columns}
            data={programs}
            keyExtractor={(p) => p.id}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Pagination */}
      {programs.length > 0 && !isLoading && totalPages > 1 && (
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
        <ProgramModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProgram(null);
          }}
          onSuccess={() => {
            fetchPrograms();
            setToast({
              message: selectedProgram
                ? 'Program updated successfully.'
                : 'Program created successfully.',
              type: 'success',
            });
          }}
          program={selectedProgram}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Delete Program"
        message={`Are you sure you want to delete "${deleteConfirm.program?.name}"?\nThis action cannot be undone.`}
        confirmText="Delete Program"
        cancelText="Cancel"
        loading={isDeleting}
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, program: null })}
      />
    </div>
  );
};

export default ProgramsPage;