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
import { getCentersApi, deleteCenterApi } from '../../services/centerService';
import type { Center } from '../../types/center';
import CenterModal from '../../features/centers/components/CenterModal';

const PAGE_LIMIT = 5;

const CentersPage: React.FC = () => {
  const [centers, setCenters] = useState<Center[]>([]);
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
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  // Delete confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    center: Center | null;
  }>({ show: false, center: null });
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

  // Fetch centers
  const fetchCenters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCentersApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      setCenters(res.data.data.centers);
      setPaginationData(res.data.data.total, Math.ceil(res.data.data.total / limit) || 1);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load centers.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder, setPaginationData]);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Open Edit Modal
  const handleEdit = (center: Center) => {
    setSelectedCenter(center);
    setShowModal(true);
  };

  // Open Add Modal
  const handleAddNew = () => {
    setSelectedCenter(null);
    setShowModal(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.center) return;
    setIsDeleting(true);
    try {
      await deleteCenterApi(deleteConfirm.center.id);
      setToast({
        message: `Center "${deleteConfirm.center.name}" deleted successfully.`,
        type: 'success',
      });
      setDeleteConfirm({ show: false, center: null });
      await fetchCenters();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete center.';
      setToast({ message: msg, type: 'error' });
      setDeleteConfirm({ show: false, center: null });
    } finally {
      setIsDeleting(false);
    }
  };

  // Columns definition: Center Name, Code, Phone Number, Email ID, Actions
  const columns: TableColumn<Center>[] = [
    {
      header: 'Center Name',
      sortField: 'name',
      accessor: (c) => (
        <span className="font-semibold text-neutral-800">
          {c.name}
        </span>
      ),
    },
    {
      header: 'Code',
      sortField: 'code',
      accessor: (c) => (
        <span className="font-mono text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded font-medium">
          {c.code}
        </span>
      ),
    },
    {
      header: 'City',
      accessor: (c) => (
        <span className="text-sm text-neutral-700 font-medium">
          {c.address?.city || '—'}
        </span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (c) => (
        <span className="text-sm text-neutral-700 font-medium">
          {c.phone || '—'}
        </span>
      ),
    },
    {
      header: 'Email ID',
      accessor: (c) => (
        <span className="text-sm text-neutral-600">
          {c.email || '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (c) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(c)}
            title="Edit Center"
            className="p-1 text-neutral-400 hover:text-brand-600 rounded transition-colors cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, center: c })}
            title="Delete Center"
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
            <h1 className="text-2xl font-bold text-neutral-800">Centers / Campuses</h1>
            <p className="text-sm text-neutral-500">
              Manage physical and virtual branches of the institution.
            </p>
          </div>
          <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Center
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-72">
            <SearchBox
              placeholder="Search centers by name, code, or city…"
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>

        {/* Table / Error / Empty States */}
        {error ? (
          <ErrorState message={error} onRetry={fetchCenters} />
        ) : centers.length === 0 && !isLoading ? (
          <EmptyState
            title="No centers found"
            description={
              debouncedSearch
                ? `No centers matching "${debouncedSearch}". Try a different search.`
                : 'Get started by creating your first center / campus branch.'
            }
            action={
              !debouncedSearch && (
                <Button size="sm" onClick={handleAddNew}>
                  Add Your First Center
                </Button>
              )
            }
          />
        ) : (
          <Table
            columns={columns}
            data={centers}
            keyExtractor={(c) => c.id}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Pagination */}
      {centers.length > 0 && !isLoading && totalPages > 1 && (
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
        <CenterModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCenter(null);
          }}
          onSuccess={() => {
            fetchCenters();
            setToast({
              message: selectedCenter
                ? 'Center updated successfully.'
                : 'Center created successfully.',
              type: 'success',
            });
          }}
          center={selectedCenter}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Delete Center"
        message={`Are you sure you want to delete "${deleteConfirm.center?.name}"?\nThis action cannot be undone.`}
        confirmText="Delete Center"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, center: null })}
      />
    </div>
  );
};

export default CentersPage;
