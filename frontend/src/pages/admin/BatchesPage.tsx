import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Select } from '../../components/Select';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import BatchModal from '../../features/batches/components/BatchModal';
import { getBatchesApi, deleteBatchApi } from '../../services/batchService';
import { getCentersApi } from '../../services/centerService';
import { getCoursesApi } from '../../services/courseService';
import type { Batch } from '../../types/batch';
import type { Center } from '../../types/center';
import type { Course } from '../../types/course';

const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const limit = 10;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    batch: Batch | null;
  }>({ show: false, batch: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load filter options (Centers and Courses)
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [centersRes, coursesRes] = await Promise.all([
          getCentersApi({ limit: 100 }),
          getCoursesApi({ limit: 100 }),
        ]);
        setCenters(centersRes.data.data.centers || []);
        setCourses(coursesRes.data.data.courses || []);
      } catch {
        // Fallback gracefully
      }
    };
    loadFilterOptions();
  }, []);

  // Fetch batches
  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBatchesApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        centerId: selectedCenterFilter || undefined,
        courseId: selectedCourseFilter || undefined,
      });

      const { batches: list, total } = response.data.data;
      setBatches(list || []);
      setTotalCount(total || 0);
      setTotalPages(Math.ceil((total || 0) / limit) || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load batches.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, selectedCenterFilter, selectedCourseFilter]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.batch) return;
    setIsDeleting(true);
    try {
      await deleteBatchApi(deleteConfirm.batch.id);
      setDeleteConfirm({ show: false, batch: null });
      showToast('Batch removed successfully.', 'success');
      fetchBatches();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete batch.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Table Columns
  const columns: TableColumn<Batch>[] = [
    {
      header: 'Batch / Division',
      accessor: (b) => (
        <div>
          <span className="font-medium text-neutral-800">{b.name}</span>
          {b.academicYearName && (
            <span className="block text-xs text-neutral-400">{b.academicYearName}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Course & Level',
      accessor: (b) => (
        <div>
          <span className="font-medium text-neutral-800">{b.courseName || '—'}</span>
          <span className="block text-xs text-brand-600 font-medium">{b.levelName}</span>
        </div>
      ),
    },
    {
      header: 'Center',
      accessor: (b) => (
        <span className="text-neutral-700">{b.centerName || '—'}</span>
      ),
    },
    {
      header: 'Teacher / Incharge',
      accessor: (b) =>
        b.teacherName ? (
          <div className="flex items-center gap-1.5 text-neutral-700">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            <span>{b.teacherName}</span>
            {b.teacherEmployeeId && (
              <span className="text-xs text-neutral-400">({b.teacherEmployeeId})</span>
            )}
          </div>
        ) : (
          <span className="text-xs italic text-neutral-400">Unassigned</span>
        ),
    },
   
    {
      header: 'Actions',
      accessor: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedBatch(b);
              setShowModal(true);
            }}
            title="Edit batch"
          >
            <Edit2 className="h-4 w-4 text-neutral-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirm({ show: true, batch: b })}
            title="Delete batch"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Batches
          </h1>
          <p className="text-sm text-neutral-500">
            {totalCount} batch{totalCount !== 1 ? 'es' : ''} configured across courses and centers
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedBatch(null);
            setShowModal(true);
          }}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Batch
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search batches by name…"
          />
        </div>
        <div className="flex flex-wrap gap-3 sm:w-auto w-full">
          <div className="w-full sm:w-56">
            <Select
              value={selectedCenterFilter}
              onChange={(e) => {
                setSelectedCenterFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Centers' },
                ...centers.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={selectedCourseFilter}
              onChange={(e) => {
                setSelectedCourseFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Courses' },
                ...courses.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.code})`,
                })),
              ]}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-white border border-neutral-200/80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBatches} />
      ) : batches.length === 0 ? (
        <EmptyState
          title="No batches found"
          description="Get started by creating a batch for a specific course level and center."
          action={
            <Button
              size="sm"
              onClick={() => {
                setSelectedBatch(null);
                setShowModal(true);
              }}
            >
              Add First Batch
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <Table
            columns={columns}
            data={batches}
            keyExtractor={(b) => b.id}
            isLoading={isLoading}
          />
          {totalPages > 1 && (
            <div className="p-4 border-t border-neutral-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <BatchModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBatch(null);
        }}
        onSuccess={() => {
          showToast(
            selectedBatch
              ? 'Batch updated successfully.'
              : 'Batch created successfully.',
            'success'
          );
          fetchBatches();
        }}
        batch={selectedBatch}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Remove Batch"
        message={`Are you sure you want to remove batch "${deleteConfirm.batch?.name}" from "${deleteConfirm.batch?.courseName}" (${deleteConfirm.batch?.levelName})?`}
        confirmText="Remove Batch"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, batch: null })}
      />
    </div>
  );
};

export default BatchesPage;
