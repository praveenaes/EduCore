import React, { useCallback, useEffect, useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import { BookOpen, GraduationCap } from 'lucide-react';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Badge } from '../../components/Badge';
import { getTeacherSubjectsApi } from '../../services/teacherService';
import type { TeacherAssignedSubject } from '../../types/teacher';

const PAGE_LIMIT = 10;

export const TeacherSubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<TeacherAssignedSubject[]>([]);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>('subjectName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debounce search input (identical to TeacherBatchesPage and SubjectsPage)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  // Fetch subjects with server-driven search, sort, and pagination
  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTeacherSubjectsApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      setSubjects(res.data.data.subjects);
      setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load assigned subjects.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder, setPaginationData]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

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

  const columns: TableColumn<TeacherAssignedSubject>[] = [
    {
      header: 'Subject',
      sortField: 'subjectName',
      accessor: (subject) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-200/60 font-semibold text-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800">{subject.subjectName}</p>
            {subject.subjectCode && (
              <span className="inline-block mt-0.5 text-2xs font-mono font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                {subject.subjectCode}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Course',
      sortField: 'courseName',
      accessor: (subject) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-neutral-400 shrink-0" />
          <div>
            <span className="text-sm font-medium text-neutral-700 block max-w-xs truncate">
              {subject.courseName}
            </span>
            {subject.courseCode && (
              <span className="text-xs text-neutral-400 font-mono">
                {subject.courseCode}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Level / Semester',
      sortField: 'levelNumber',
      accessor: (subject) => (
        <Badge variant="info">
          {subject.levelName || `Level ${subject.levelNumber}`}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Assigned Subjects</h1>
            <p className="text-sm text-neutral-450 mt-0.5">
              {pagination.total} subject{pagination.total !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </div>

        {/* Search */}
        <SearchBox
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search by subject name, code, or course…"
        />

        {/* Content */}
        {error ? (
          <ErrorState message={error} onRetry={fetchSubjects} />
        ) : subjects.length === 0 && !isLoading ? (
          <EmptyState
            title={debouncedSearch ? 'No Matching Subjects Found' : 'No Subjects Assigned Yet'}
            description={
              debouncedSearch
                ? `No results for "${debouncedSearch}". Try a different search term.`
                : 'You have not been assigned to any subjects yet.'
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectsPage;
