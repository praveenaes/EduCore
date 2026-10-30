import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Select } from '../../components/Select';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import AssessmentScheduleModal from '../../features/assessments/components/AssessmentScheduleModal';
import {
  getAssessmentSchedulesApi,
  deleteAssessmentScheduleApi,
} from '../../services/assessmentScheduleService';
import { getAssessmentsApi } from '../../services/assessmentService';
import { getCoursesApi } from '../../services/courseService';
import type { AssessmentSchedule } from '../../types/assessmentSchedule';
import type { Assessment } from '../../types/assessment';
import type { Course } from '../../types/course';

const AssessmentSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<AssessmentSchedule[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAssessmentFilter, setSelectedAssessmentFilter] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const limit = 10;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AssessmentSchedule | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    schedule: AssessmentSchedule | null;
  }>({ show: false, schedule: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Assessments and Courses for filter dropdowns
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [assessmentsRes, coursesRes] = await Promise.all([
          getAssessmentsApi({ limit: 100 }),
          getCoursesApi({ limit: 100 }),
        ]);
        setAssessments(assessmentsRes.data.data.assessments || []);
        setCourses(coursesRes.data.data.courses || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load filters for assessment schedules.');
      }
    };
    loadFilterData();
  }, []);

  // Fetch assessment schedules
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAssessmentSchedulesApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        assessmentId: selectedAssessmentFilter || undefined,
        courseId: selectedCourseFilter || undefined,
      });
      const data = response.data.data;
      setSchedules(data.schedules || []);
      setTotalCount(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessment schedules.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, selectedAssessmentFilter, selectedCourseFilter]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getScheduleStatus = (s: AssessmentSchedule) => {
    if (s.isPublished) return 'PUBLISHED';
    if (s.isGraded) return 'GRADED';
    if (s.assessmentStatus === 'COMPLETED' || s.isCompleted) return 'COMPLETED';
    if (s.assessmentStatus === 'CANCELLED') return 'CANCELLED';
    return 'SCHEDULED';
  };

  const renderStatusBadge = (s: AssessmentSchedule) => {
    const status = getScheduleStatus(s);
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Published
          </span>
        );
      case 'GRADED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Graded
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Scheduled
          </span>
        );
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.schedule) return;
    const target = deleteConfirm.schedule;
    setDeleteConfirm({ show: false, schedule: null });
    setIsDeleting(true);
    try {
      await deleteAssessmentScheduleApi(target.id);
      showToast('Assessment schedule deleted successfully.', 'success');
      fetchSchedules();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete schedule.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumn<AssessmentSchedule>[] = [
    {
      header: 'Assessment Event',
      accessor: (s) => (
        <span className="font-semibold text-neutral-800">
          {s.assessmentName || '—'}
        </span>
      ),
    },
    {
      header: 'Subject & Criteria',
      accessor: (s) => (
        <div>
          <span className="font-medium text-neutral-800">{s.criteriaName || '—'}</span>
          <p className="text-xs text-neutral-500">
            {s.courseName} (Level {s.levelNumber})
          </p>
        </div>
      ),
    },
    {
      header: 'Batch',
      accessor: (s) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-medium">
          <Users className="h-3.5 w-3.5 text-neutral-400" />
          <span>{s.batchName || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Exam Center',
      accessor: (s) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-700">
          <Building2 className="h-3.5 w-3.5 text-neutral-400" />
          <span>{s.centerName || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      accessor: (s) => (
        <div className="space-y-1 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5 font-medium text-neutral-800">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <span>
              {new Date(s.examDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span>
              {s.startTime} – {s.endTime}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (s) => renderStatusBadge(s),
    },
    {
      header: 'Actions',
      accessor: (s) => {
        const status = getScheduleStatus(s);
        const isCompleted = status === 'COMPLETED' || status === 'GRADED' || status === 'PUBLISHED';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              disabled={isCompleted}
              onClick={() => {
                if (isCompleted) return;
                setSelectedSchedule(s);
                setShowModal(true);
              }}
              className={
                isCompleted
                  ? 'opacity-30 cursor-not-allowed text-neutral-400'
                  : 'text-neutral-500 hover:text-neutral-700'
              }
              title={
                isCompleted
                  ? 'Completed schedules cannot be edited'
                  : 'Edit Schedule'
              }
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isCompleted}
              onClick={() => {
                if (isCompleted) return;
                setDeleteConfirm({ show: true, schedule: s });
              }}
              className={
                isCompleted
                  ? 'opacity-30 cursor-not-allowed text-neutral-400'
                  : 'text-red-500 hover:text-red-700'
              }
              title={
                isCompleted
                  ? 'Completed schedules cannot be deleted'
                  : 'Delete Schedule'
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const assessmentFilterOptions = [
    { value: '', label: 'All Assessment Events' },
    ...assessments.map((a) => ({
      value: a.id,
      label: a.name,
    })),
  ];

  const courseFilterOptions = [
    { value: '', label: 'All Courses' },
    ...courses.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.code})`,
    })),
  ];

  return (
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Assessment Schedules
          </h1>
          <p className="text-sm text-neutral-500">
            {totalCount} exam slot{totalCount !== 1 ? 's' : ''} scheduled across batches and centers
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedSchedule(null);
            setShowModal(true);
          }}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Assessment
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search batch, criteria or center..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-56">
            <Select
              options={assessmentFilterOptions}
              value={selectedAssessmentFilter}
              onChange={(e) => {
                setSelectedAssessmentFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              options={courseFilterOptions}
              value={selectedCourseFilter}
              onChange={(e) => {
                setSelectedCourseFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500">Loading schedules...</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSchedules} />
        ) : schedules.length === 0 ? (
          <EmptyState
            title="No exam schedules found"
            description="Schedule examination slots for batches with assigned centers, dates, and times."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setSelectedSchedule(null);
                  setShowModal(true);
                }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Schedule Assessment
              </Button>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={schedules}
              keyExtractor={(item) => item.id}
            />
            <div className="p-4 border-t border-neutral-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <AssessmentScheduleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchSchedules}
          schedule={selectedSchedule}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <ConfirmationModal
          isOpen={deleteConfirm.show}
          onCancel={() => setDeleteConfirm({ show: false, schedule: null })}
          onConfirm={handleDelete}
          title="Delete Assessment Schedule"
          message={`Are you sure you want to delete the schedule for "${deleteConfirm.schedule?.criteriaName || 'this exam'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          loading={isDeleting}
          confirmVariant="danger"
        />
      )}
    </div>
  );
};

export default AssessmentSchedulesPage;
