import React, { useCallback, useEffect, useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import { Building2, BookOpen, ClipboardCheck, CalendarX } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { getTeacherBatchesApi } from '../../services/teacherService';
import type { TeacherInChargeBatch } from '../../types/teacher';
import { AttendanceModal } from '../../features/attendance/components/AttendanceModal';
import { BatchLeavesModal } from '../../features/attendance/components/BatchLeavesModal';

const PAGE_LIMIT = 10;

export const TeacherBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<TeacherInChargeBatch[]>([]);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState<TeacherInChargeBatch | null>(null);
  const [selectedBatchForLeaves, setSelectedBatchForLeaves] = useState<TeacherInChargeBatch | null>(null);

  // Debounce search input (identical to ProgramsPage and CoursesPage)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  // Fetch batches with server-driven search, sort, and pagination
  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTeacherBatchesApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      setBatches(res.data.data.batches);
      setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load assigned batches.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder, setPaginationData]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Handle column sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    resetPage();
  };

  const handleOpenAttendance = (batch: TeacherInChargeBatch) => {
    setSelectedBatchForAttendance(batch);
  };

  const columns: TableColumn<TeacherInChargeBatch>[] = [
    {
      header: 'Batch',
      sortField: 'name',
      accessor: (batch) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-200/60 font-semibold text-xs">
            {batch.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-neutral-800">{batch.name}</p>
            <p className="text-xs text-neutral-400">{batch.levelName}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Center',
      sortField: 'centerName',
      accessor: (batch) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700">{batch.centerName}</span>
        </div>
      ),
    },
    {
      header: 'Course',
      sortField: 'courseName',
      accessor: (batch) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 max-w-xs truncate">
            {batch.courseName}
          </span>
        </div>
      ),
    },
    {
      header: 'Academic Year',
      sortField: 'academicYearName',
      accessor: (batch) => (
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
          {batch.academicYearName}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (batch) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ClipboardCheck className="h-4 w-4 text-brand-600" />}
            onClick={() => handleOpenAttendance(batch)}
            className="hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 shadow-2xs"
          >
            Attendance
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CalendarX className="h-4 w-4 text-amber-600" />}
            onClick={() => setSelectedBatchForLeaves(batch)}
            className="hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 shadow-2xs"
          >
            Leaves
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-6">
 {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Assigned Batches</h1>
            <p className="text-sm text-neutral-450 mt-0.5">
              {pagination.total} batch{pagination.total !== 1 ? 'es' : ''} assigned
            </p>
            
          </div>
        </div>

 {/* Search */}
        <SearchBox
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search by batch name, course, or center…"
        />

 {/* Content */}
        {error ? (
          <ErrorState message={error} onRetry={fetchBatches} />
        ) : batches.length === 0 && !isLoading ? (
          <EmptyState
            title={debouncedSearch ? 'No Matching Batches Found' : 'No Batches Assigned Yet'}
            description={
              debouncedSearch
                ? `No results for "${debouncedSearch}". Try a different search term.`
                : 'You have not been assigned to any batches as faculty in-charge yet.'
            }
          />
        ) : (
          <Table
            columns={columns}
            data={batches}
            keyExtractor={(b) => b.id}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

{/* Pagination */}
      {batches.length > 0 && !isLoading && totalPages > 1 && (
        <div className="mt-auto pt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

{/* Attendance Modal */}
      <AttendanceModal
        isOpen={Boolean(selectedBatchForAttendance)}
        onClose={() => setSelectedBatchForAttendance(null)}
        onSuccess={() => {
          setSelectedBatchForAttendance(null);
        }}
        batch={selectedBatchForAttendance}
      />

      {/* Batch Leaves Review Modal */}
      <BatchLeavesModal
        isOpen={Boolean(selectedBatchForLeaves)}
        onClose={() => setSelectedBatchForLeaves(null)}
        batch={selectedBatchForLeaves}
      />
    </div>
  );
};

export default TeacherBatchesPage;
