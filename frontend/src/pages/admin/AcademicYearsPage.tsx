import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { usePagination } from '../../hooks/usePagination';
import { getAcademicYearsApi, deleteAcademicYearApi } from '../../services/academicYearService';
import { getCentersApi } from '../../services/centerService';
import type { AcademicYear } from '../../types/academicYear';
import AcademicYearModal from '../../features/academic-years/components/AcademicYearModal';

const PAGE_LIMIT = 5;

export const AcademicYearsPage: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [centersMap, setCentersMap] = useState<Record<string, string>>({});
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting states
  const [sortBy, setSortBy] = useState<string>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);

  // Delete confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    academicYear: AcademicYear | null;
  }>({ show: false, academicYear: null });
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

  // Load all centers to build a quick ID -> Name lookup map
  useEffect(() => {
    getCentersApi({ limit: 100 })
      .then((res) => {
        const centers = res.data.data.centers || [];
        const map: Record<string, string> = {};
        centers.forEach((c) => {
          map[c.id] = c.name;
        });
        setCentersMap(map);
      })
      .catch((err) => console.error('Failed to load centers for lookup:', err));
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  // Fetch academic years
  const fetchAcademicYears = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAcademicYearsApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      setAcademicYears(res.data.data.academicYears);
      setPaginationData(res.data.data.total, Math.ceil(res.data.data.total / limit) || 1);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load academic years.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder, setPaginationData]);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Open Edit Modal
  const handleEdit = (ay: AcademicYear) => {
    setSelectedAcademicYear(ay);
    setShowModal(true);
  };

  // Open Add Modal
  const handleAddNew = () => {
    setSelectedAcademicYear(null);
    setShowModal(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.academicYear) return;
    setIsDeleting(true);
    try {
      await deleteAcademicYearApi(deleteConfirm.academicYear.id);
      setToast({
        message: `Academic year "${deleteConfirm.academicYear.name}" deleted successfully.`,
        type: 'success',
      });
      setDeleteConfirm({ show: false, academicYear: null });
      await fetchAcademicYears();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to delete academic year.';
      setToast({ message: msg, type: 'error' });
      setDeleteConfirm({ show: false, academicYear: null });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '-'
      : d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  };

  const columns: TableColumn<AcademicYear>[] = [
    {
      header: 'Academic Year',
      sortField: 'name',
      accessor: (ay) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-800">{ay.name}</span>
          {ay.current && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" /> Current
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Code',
      sortField: 'code',
      accessor: (ay) => (
        <span className="font-mono text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded font-medium">
          {ay.code}
        </span>
      ),
    },
    {
      header: 'Duration',
      sortField: 'startDate',
      accessor: (ay) => (
        <span className="text-sm text-neutral-700 font-medium">
          {formatDate(ay.startDate)} - {formatDate(ay.endDate)}
        </span>
      ),
    },
    {
      header: 'Centers / Campuses',
      accessor: (ay) => {
        const centers = ay.centers || [];
        if (centers.length === 0) {
          return <span className="text-xs text-neutral-400">All Campuses</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {centers.map((c, idx) => {
              const label =
                typeof c === 'string'
                  ? centersMap[c] || c
                  : c.name || c.code || centersMap[c.id] || 'Campus';
              return (
                <span
                  key={idx}
                  className="inline-block bg-brand-50 text-brand-700 border border-brand-200 text-xs px-2 py-0.5 rounded font-medium"
                >
                  {label}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (ay) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(ay)}
            title="Edit Academic Year"
            className="p-1 text-neutral-400 hover:text-brand-600 rounded transition-colors cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, academicYear: ay })}
            title="Delete Academic Year"
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
            <h1 className="text-2xl font-bold text-neutral-800">Academic Years</h1>
            <p className="text-sm text-neutral-500">
              Manage academic sessions, terms, and active institution calendars.
            </p>
          </div>
          <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Academic Year
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-72">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search academic years..."
            />
          </div>
        </div>

        {/* Table Content */}
        {error ? (
          <ErrorState message={error} onRetry={fetchAcademicYears} />
        ) : !isLoading && academicYears.length === 0 ? (
          <EmptyState
            title="No academic years found"
            description={
              debouncedSearch
                ? `No academic years matching "${debouncedSearch}". Try a different search.`
                : 'Get started by creating your first academic year.'
            }
            action={
              !debouncedSearch ? (
                <Button size="sm" onClick={handleAddNew}>
                  Add Your First Academic Year
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table
            columns={columns}
            data={academicYears}
            keyExtractor={(ay) => ay.id}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Pagination Footer */}
      {academicYears.length > 0 && !isLoading && totalPages > 1 && (
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
        <AcademicYearModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedAcademicYear(null);
          }}
          onSuccess={() => {
            fetchAcademicYears();
            setToast({
              message: selectedAcademicYear
                ? 'Academic year updated successfully.'
                : 'Academic year created successfully.',
              type: 'success',
            });
          }}
          academicYear={selectedAcademicYear}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Delete Academic Year"
        message={`Are you sure you want to delete "${deleteConfirm.academicYear?.name}"?\nThis action cannot be undone.`}
        confirmText="Delete Academic Year"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, academicYear: null })}
      />
    </div>
  );
};

export default AcademicYearsPage;
