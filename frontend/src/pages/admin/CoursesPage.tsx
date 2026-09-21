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
import { getCoursesApi, deleteCourseApi } from '../../services/courseService';
import type { Course } from '../../types/course';
import CourseModal from '../../features/courses/components/CourseModal';

const PAGE_LIMIT = 5;

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Delete confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    course: Course | null;
  }>({ show: false, course: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification
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

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCoursesApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      setCourses(res.data.data.courses);
      setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load courses.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder, setPaginationData]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);


  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Open Edit Modal
  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  // Open Add Modal
  const handleAddNew = () => {
    setSelectedCourse(null);
    setShowModal(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.course) return;
    setIsDeleting(true);
    try {
      await deleteCourseApi(deleteConfirm.course.id);
      setToast({
        message: 'Course "' + deleteConfirm.course.name + '" deleted successfully.',
        type: 'success',
      });
      setDeleteConfirm({ show: false, course: null });
      await fetchCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to delete course.';
      setToast({ message: msg, type: 'error' });
      setDeleteConfirm({ show: false, course: null });
    } finally {
      setIsDeleting(false);
    }
  };

  // Columns definition
  const columns: TableColumn<Course>[] = [
    {
      header: 'Course Name',
      sortField: 'name',
      className: 'min-w-[200px]',
      accessor: (c) => (
        <span className="font-semibold text-neutral-800 whitespace-nowrap">
          {c.name}
        </span>
      ),
    },
    {
      header: 'Code',
      sortField: 'code',
      className: 'min-w-[130px]',
      accessor: (c) => (
        <span className="font-mono text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded font-medium whitespace-nowrap">
          {c.code}
        </span>
      ),
    },
    {
      header: 'Program',
      className: 'min-w-[200px]',
      accessor: (c) => (
        <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-medium whitespace-nowrap">
          {c.programName || '—'}
        </span>
      ),
    },
    {
      header: 'Levels',
      className: 'min-w-[200px]',
      accessor: (c) => {
        const count = c.levelCount || c.levels?.length || 0;
        const levelName =
          c.levelName ||
          (c.levels?.[0]?.name ? c.levels[0].name.replace(/\s*\d+$/, '').trim() : 'Level');

        if (count === 0 && (!c.levels || c.levels.length === 0)) {
          return <span className="text-xs text-neutral-400">—</span>;
        }

        const startName = c.levels?.[0]?.name || `${levelName} 1`;
        const endName =
          c.levels && c.levels.length > 1
            ? c.levels[c.levels.length - 1].name
            : `${levelName} ${count}`;

        const label = count > 1 ? `${startName} - ${endName}` : startName;

        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/80 whitespace-nowrap shadow-xs">
            {label}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'min-w-[100px]',
      accessor: (c) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(c)}
            title="Edit Course"
            className="p-1 text-neutral-400 hover:text-brand-600 rounded transition-colors cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, course: c })}
            title="Delete Course"
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
            className={'fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ' + (toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white')}
          >
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Courses</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {pagination.total} course{pagination.total !== 1 ? 's' : ''} configured
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddNew}
            >
              Add Course
            </Button>
          </div>
        </div>

{/* Search */}
        <SearchBox
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search by course name or code…"
        />

{/* Content */}
        {error ? (
          <ErrorState message={error} onRetry={fetchCourses} />
        ) : courses.length === 0 && !isLoading ? (
          <EmptyState
            title="No Courses Found"
            description={
              debouncedSearch
                ? 'No results for "' + debouncedSearch + '". Try another search term.'
                : 'Get started by creating your first academic course under a program.'
            }
            action={
              !debouncedSearch && (
                <Button size="sm" onClick={handleAddNew}>
                  Add Your First Course
                </Button>
              )
            }
          />
        ) : (
          <Table
            columns={columns}
            data={courses}
            keyExtractor={(c) => c.id}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            minTableWidth="min-w-[1100px]"
          />
        )}
      </div>

      {/* Pagination */}
      {courses.length > 0 && !isLoading && totalPages > 1 && (
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
        <CourseModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={() => {
            fetchCourses();
            setToast({
              message: selectedCourse
                ? 'Course updated successfully.'
                : 'Course created successfully.',
              type: 'success',
            });
          }}
          course={selectedCourse}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Delete Course"
        message={'Are you sure you want to delete "' + (deleteConfirm.course?.name || '') + '"?\nThis action cannot be undone.'}
        confirmText="Delete Course"
        cancelText="Cancel"
        loading={isDeleting}
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, course: null })}
      />
    </div>
  );
};

export default CoursesPage;
