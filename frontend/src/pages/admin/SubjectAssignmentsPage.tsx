import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, User } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Select } from '../../components/Select';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { usePagination } from '../../hooks/usePagination';
import {
  getSubjectAssignmentsApi,
  deleteSubjectAssignmentApi,
} from '../../services/subjectAssignmentService';
import { getCoursesApi } from '../../services/courseService';
import type { SubjectAssignment } from '../../types/subjectAssignment';
import type { Course } from '../../types/course';
import SubjectAssignmentModal from '../../features/subject-assignments/components/SubjectAssignmentModal';

const PAGE_LIMIT = 10;

const SubjectAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');

  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<SubjectAssignment | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    assignment: SubjectAssignment | null;
  }>({ show: false, assignment: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load courses for filter dropdown
  useEffect(() => {
    getCoursesApi({ limit: 100 })
      .then((res) => setCourses(res.data.data.courses || []))
      .catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  // Fetch subject assignments
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSubjectAssignmentsApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        courseId: selectedCourseFilter || undefined,
      });
      const data = res.data.data;
      setAssignments(data.assignments);
      setPaginationData(data.total, Math.ceil(data.total / limit));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subject assignments');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCourseFilter, setPaginationData]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.assignment) return;
    setIsDeleting(true);
    try {
      await deleteSubjectAssignmentApi(deleteConfirm.assignment.id);
      setToast({ message: 'Subject assignment removed successfully.', type: 'success' });
      setDeleteConfirm({ show: false, assignment: null });
      fetchAssignments();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete assignment.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Table Columns
  const columns: TableColumn<SubjectAssignment>[] = [
    {
      key: 'courseName',
      title: 'Course',
      render: (item) => (
        <div>
          <span className="font-medium text-neutral-800">{item.courseName || '—'}</span>
          {item.courseCode && (
            <span className="block text-xs text-neutral-400 font-mono">{item.courseCode}</span>
          )}
        </div>
      ),
    },
    {
      key: 'levelName',
      title: 'Level / Semester',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
          {item.levelName}
        </span>
      ),
    },
    {
      key: 'subjectName',
      title: 'Subject',
      render: (item) => (
        <div>
          <span className="font-medium text-neutral-800">{item.subjectName || '—'}</span>
          {item.subjectCode && (
            <span className="block text-xs text-neutral-400 font-mono">{item.subjectCode}</span>
          )}
        </div>
      ),
    },
    {
      key: 'teacherName',
      title: 'Assigned Faculty',
      render: (item) =>
        item.teacherName ? (
          <div className="flex items-center gap-1.5 text-neutral-700">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            <span>{item.teacherName}</span>
            {item.teacherEmployeeId && (
              <span className="text-xs text-neutral-400">({item.teacherEmployeeId})</span>
            )}
          </div>
        ) : (
          <span className="text-xs italic text-neutral-400">Unassigned</span>
        ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedAssignment(item);
              setShowModal(true);
            }}
            title="Edit assignment"
          >
            <Edit2 className="h-4 w-4 text-neutral-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirm({ show: true, assignment: item })}
            title="Delete assignment"
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
          className={`fixed top-5 right-5 z-50 rounded-lg px-4 py-3 text-sm shadow-md transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Subject Assignments
          </h1>
          <p className="text-sm text-neutral-500">
            Map curriculum subjects to course levels and designate teaching faculty.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAssignment(null);
            setShowModal(true);
          }}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Assign Subject
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by course or subject…"
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={selectedCourseFilter}
            onChange={(e) => {
              setSelectedCourseFilter(e.target.value);
              resetPage();
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

      {/* Content Area */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-white border border-neutral-200/80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAssignments} />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-neutral-300" />}
          title="No subject assignments found"
          description="Get started by assigning a subject to a specific course level."
          actionLabel="Assign First Subject"
          onAction={() => {
            setSelectedAssignment(null);
            setShowModal(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <Table columns={columns} data={assignments} />
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
      <SubjectAssignmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAssignment(null);
        }}
        onSuccess={() => {
          showToast(
            selectedAssignment
              ? 'Subject assignment updated successfully.'
              : 'Subject assigned successfully.',
            'success'
          );
          fetchAssignments();
        }}
        assignment={selectedAssignment}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Remove Subject Assignment"
        message={`Are you sure you want to remove "${deleteConfirm.assignment?.subjectName}" from ${deleteConfirm.assignment?.levelName} of "${deleteConfirm.assignment?.courseName}"?`}
        confirmLabel="Remove Assignment"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, assignment: null })}
      />
    </div>
  );
};

export default SubjectAssignmentsPage;
