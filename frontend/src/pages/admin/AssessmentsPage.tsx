import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Select } from '../../components/Select';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import AssessmentModal from '../../features/assessments/components/AssessmentModal';
import {
  getAssessmentsApi,
  deleteAssessmentApi,
  updateAssessmentApi,
} from '../../services/assessmentService';
import { getAcademicYearsApi } from '../../services/academicYearService';
import type { Assessment, AssessmentStatus } from '../../types/assessment';
import type { AcademicYear } from '../../types/academicYear';

const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('');
  const limit = 10;

  // Sorting
  const [sortBy, setSortBy] = useState<string>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    assessment: Assessment | null;
  }>({ show: false, assessment: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusConfirm, setStatusConfirm] = useState<{
    show: boolean;
    assessment: Assessment | null;
    targetStatus: AssessmentStatus | null;
  }>({ show: false, assessment: null, targetStatus: null });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // const[isAsc,setIsAsc]=useState(true)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Academic Years for filter
  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await getAcademicYearsApi({ limit: 100 });
        setAcademicYears(res.data.data.academicYears || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load academic years.');
      }
    };
    loadYears();
  }, []);

  // Fetch assessments
  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAssessmentsApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        academicYearId: selectedYearFilter || undefined,
        sortBy,
        sortOrder,
      });
      const data = response.data.data;
      setAssessments(data.assessments || []);
      setTotalCount(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessments.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedYearFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.assessment) return;
    const target = deleteConfirm.assessment;
    setDeleteConfirm({ show: false, assessment: null });
    setIsDeleting(true);
    try {
      await deleteAssessmentApi(target.id);
      showToast('Assessment deleted successfully.', 'success');
      fetchAssessments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete assessment.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

// const sortFn=()=>{
//   const sorted=[...assessments].sort((a,b)=>{
//     const comparison= a.name.localeCompare(b.name)
//     return isAsc ?comparison:-comparison
//   })
//   setIsAsc(!isAsc)
//   setAssessments(sorted)
// }

  const handleUpdateStatus = async (assessment: Assessment, newStatus: AssessmentStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateAssessmentApi(assessment.id, { status: newStatus });
      showToast(`Assessment marked as ${newStatus.toLowerCase()}.`, 'success');
      fetchAssessments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: AssessmentStatus | string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Scheduled
          </span>
        );
    }
  };

  const columns: TableColumn<Assessment>[] = [
    {
      header: 'Exam / Assessment',
      sortField: 'name',
      accessor: (a) => (
        <div>
          <span className="font-semibold text-neutral-800">{a.name}</span>
        </div>
      ),
    },
    {
      header: 'Academic Year',
      accessor: (a) => (
        <span className="text-neutral-700 font-medium">
          {a.academicYearName || '—'}
        </span>
      ),
    },
    {
      header: 'Date Range',
      sortField: 'startDate',
      accessor: (a) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-600">
          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
          <span>
            {new Date(a.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' → '}
            {new Date(a.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      sortField: 'status',
      accessor: (a) => getStatusBadge(a.status),
    },
    {
      header: 'Actions',
      accessor: (a) => {
        const isCompleted = a.status === 'COMPLETED' || a.status === 'PUBLISHED';

        return (
          <div className="flex items-center justify-end gap-1.5">
          {a.status === 'SCHEDULED' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setStatusConfirm({
                    show: true,
                    assessment: a,
                    targetStatus: 'COMPLETED',
                  })
                }
                className="!text-blue-600 hover:!text-blue-700 hover:bg-blue-50"
                title="Mark as Completed (concludes exams & opens mark entry)"
              >
                <CheckCircle2 className="h-4 w-4 text-blue-600 stroke-[2.5]" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setStatusConfirm({
                    show: true,
                    assessment: a,
                    targetStatus: 'CANCELLED',
                  })
                }
                className="!text-red-700 hover:!text-red-800 hover:bg-red-50"
                title="Cancel Assessment (remains on list as Cancelled)"
              >
                <Ban className="h-4 w-4 text-red-700 stroke-[2.5]" />
              </Button>
            </>
          )}

          {a.status === 'COMPLETED' && (
            <Button
              size="sm"
              variant="ghost"
              disabled
              className="opacity-30 cursor-not-allowed !text-neutral-400"
              title="Completed exams cannot be cancelled"
            >
              <Ban className="h-4 w-4 stroke-[2.5]" />
            </Button>
          )}

          {a.status === 'CANCELLED' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setStatusConfirm({
                  show: true,
                  assessment: a,
                  targetStatus: 'SCHEDULED',
                })
              }
              className="!text-emerald-600 hover:!text-emerald-700 hover:bg-emerald-50"
              title="Reopen as Scheduled"
            >
              <Clock className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            disabled={isCompleted}
            onClick={() => {
              if (isCompleted) return;
              setSelectedAssessment(a);
              setShowModal(true);
            }}
            className={
              isCompleted
                ? 'opacity-30 cursor-not-allowed text-neutral-400'
                : 'text-neutral-500 hover:text-neutral-700'
            }
            title={
              isCompleted
                ? 'Completed exams cannot be edited'
                : 'Edit Assessment'
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
              setDeleteConfirm({ show: true, assessment: a });
            }}
            className={
              isCompleted
                ? 'opacity-30 cursor-not-allowed text-neutral-400'
                : 'text-red-500 hover:text-red-700'
            }
            title={
              isCompleted
                ? 'Completed exams cannot be deleted'
                : 'Delete Assessment'
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

  const yearFilterOptions = [
    { value: '', label: 'All Academic Years' },
    ...academicYears.map((y) => ({
      value: y.id,
      label: `${y.name} (${y.code})`,
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
            Assessment Events
          </h1>
          <p className="text-sm text-neutral-500">
            {totalCount} exam session{totalCount !== 1 ? 's' : ''} configured across academic years
          </p>
        </div>
        {/* <button onClick={()=>sortFn()} >sort</button> */}
        <Button
          onClick={() => {
            setSelectedAssessment(null);
            setShowModal(true);
          }}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>

  {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search exam sessions..."
          />
        </div>
        <div className="w-full sm:w-60">
          <Select
            options={yearFilterOptions}
            value={selectedYearFilter}
            onChange={(e) => {
              setSelectedYearFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

{/* Table Content */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500">Loading assessments...</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAssessments} />
        ) : assessments.length === 0 ? (
          <EmptyState
            title="No assessments found"
            description="Create your first exam event to begin scheduling assessments and grading."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setSelectedAssessment(null);
                  setShowModal(true);
                }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Create Assessment
              </Button>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={assessments}
              keyExtractor={(item) => item.id}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
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
        <AssessmentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchAssessments}
          assessment={selectedAssessment}
        />
      )}

      {/* Status Change Confirmation */}
      {statusConfirm.show && (
        <ConfirmationModal
          isOpen={statusConfirm.show}
          onCancel={() =>
            setStatusConfirm({ show: false, assessment: null, targetStatus: null })
          }
          onConfirm={async () => {
            if (statusConfirm.assessment && statusConfirm.targetStatus) {
              await handleUpdateStatus(
                statusConfirm.assessment,
                statusConfirm.targetStatus
              );
              setStatusConfirm({
                show: false,
                assessment: null,
                targetStatus: null,
              });
            }
          }}
          title={
            statusConfirm.targetStatus === 'COMPLETED'
              ? 'Mark Assessment as Completed'
              : statusConfirm.targetStatus === 'CANCELLED'
              ? 'Cancel Assessment Event'
              : 'Reopen Assessment Event'
          }
          message={
            statusConfirm.targetStatus === 'COMPLETED'
              ? `Mark "${statusConfirm.assessment?.name}" as Completed? This will conclude the exam event and enable mark entry for teachers and admins.`
              : statusConfirm.targetStatus === 'CANCELLED'
              ? `Are you sure you want to cancel "${statusConfirm.assessment?.name}"? The event will remain on the list with a Cancelled badge.`
              : `Reopen "${statusConfirm.assessment?.name}" and set it back to Scheduled?`
          }
          confirmText={
            statusConfirm.targetStatus === 'COMPLETED'
              ? 'Mark Completed'
              : statusConfirm.targetStatus === 'CANCELLED'
              ? 'Cancel Assessment'
              : 'Reopen'
          }
          cancelText="Cancel"
          loading={isUpdatingStatus}
          confirmVariant={
            statusConfirm.targetStatus === 'CANCELLED' ? 'danger' : 'primary'
          }
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <ConfirmationModal
          isOpen={deleteConfirm.show}
          onCancel={() => setDeleteConfirm({ show: false, assessment: null })}
          onConfirm={handleDelete}
          title="Delete Assessment Event"
          message={`Are you sure you want to delete "${deleteConfirm.assessment?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          loading={isDeleting}
          confirmVariant="danger"
        />
      )}
    </div>
  );
};

export default AssessmentsPage;
