import React, { useCallback, useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Select } from '../../components/Select';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import MarkEntryModal from '../../features/assessments/components/MarkEntryModal';
import { getAssessmentSchedulesApi } from '../../services/assessmentScheduleService';
import { getAssessmentsApi } from '../../services/assessmentService';
import type { AssessmentSchedule } from '../../types/assessmentSchedule';
import type { Assessment } from '../../types/assessment';

export const TeacherMarkEntryPage: React.FC = () => {
  const [schedules, setSchedules] = useState<AssessmentSchedule[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAssessmentFilter, setSelectedAssessmentFilter] = useState('');
  const limit = 10;

  // Mark Entry Modal
  const [showMarkEntryModal, setShowMarkEntryModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await getAssessmentsApi({ limit: 100 });
        setAssessments(res.data.data.assessments || []);
      } catch (err) {
        console.error('Failed to load assessment events', err);
      }
    };
    loadEvents();
  }, []);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAssessmentSchedulesApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        assessmentId: selectedAssessmentFilter || undefined,
      });
      setSchedules(res.data.data.schedules || []);
      setTotalPages(Math.ceil((res.data.data.total || 0) / limit) || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load exam schedules');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedAssessmentFilter]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

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

  const columns: TableColumn<AssessmentSchedule>[] = [
    {
      header: 'Exam / Criteria',
      accessor: (s) => (
        <div>
          <span className="font-semibold text-neutral-900 block text-sm">
            {s.criteriaName || 'Exam Paper'}
          </span>
          <span className="text-xs text-neutral-500">
            {s.subjectName ? `${s.subjectName} (${s.subjectCode || ''})` : s.assessmentName}
          </span>
        </div>
      ),
    },
    {
      header: 'Batch & Level',
      accessor: (s) => (
        <div>
          <span className="font-medium text-neutral-900 block text-xs">{s.batchName || 'General'}</span>
          <span className="text-xs text-neutral-400">
            {s.courseName} • Level {s.levelNumber}
          </span>
        </div>
      ),
    },
    {
      header: 'Exam Date & Time',
      accessor: (s) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <span>{s.examDate}</span>
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
      header: 'Action',
      accessor: (s) => {
        const status = getScheduleStatus(s);
        const isEntryDisabled = status === 'SCHEDULED' || status === 'CANCELLED';

        return (
          <Button
            size="sm"
            variant="primary"
            disabled={isEntryDisabled}
            onClick={() => {
              setSelectedScheduleId(s.id);
              setShowMarkEntryModal(true);
            }}
            className="flex items-center gap-1.5 text-xs"
            title={
              status === 'SCHEDULED'
                ? 'Marks can only be entered once exam is completed'
                : status === 'CANCELLED'
                ? 'Exam is cancelled'
                : undefined
            }
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {status === 'GRADED' || status === 'PUBLISHED' ? 'Edit Marks' : 'Enter Marks'}
          </Button>
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

  return (
    <div className="space-y-6">
{/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-brand-600" />
            Exam Mark Entry & Grading
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Input student assessment marks, mark absences, and submit evaluation marks.
          </p>
        </div>
      </div>

 {/* search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchBox
            placeholder="Search exam paper, batch..."
            value={search}
            onChange={setSearch}
          />
        </div>
  {/* Filter Toolbar */}       
        <div className="w-full sm:w-64">
          <Select
            options={assessmentFilterOptions}
            value={selectedAssessmentFilter}
            onChange={(e) => {
              setSelectedAssessmentFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

{/* Main Content */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Loading exam schedules...</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSchedules} />
        ) : schedules.length === 0 ? (
          <EmptyState
            title="No Exam Schedules Found"
            description="There are currently no exams scheduled for mark entry matching your filter."
          />
        ) : (
          <>
            <Table
              data={schedules}
              columns={columns}
              keyExtractor={(s) => s.id}
            />
            <div className="border-t border-neutral-200/60 p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

{/* Mark Entry Modal */}
      {showMarkEntryModal && (
        <MarkEntryModal
          isOpen={showMarkEntryModal}
          onClose={() => {
            setShowMarkEntryModal(false);
            setSelectedScheduleId(null);
          }}
          scheduleId={selectedScheduleId}
          onSuccess={fetchSchedules}
        />
      )}
    </div>
  );
};
export default TeacherMarkEntryPage;
