import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Award, BookOpen, Layers } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Select } from '../../components/Select';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import AssessmentCriteriaModal from '../../features/assessments/components/AssessmentCriteriaModal';
import {
  getAssessmentCriteriaApi,
  deleteAssessmentCriteriaApi,
} from '../../services/assessmentCriteriaService';
import { getCoursesApi } from '../../services/courseService';
import type { AssessmentCriteria, AssessmentType } from '../../types/assessmentCriteria';
import type { Course } from '../../types/course';

const AssessmentCriteriaPage: React.FC = () => {
  const [criteriaList, setCriteriaList] = useState<AssessmentCriteria[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const limit = 10;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<AssessmentCriteria | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    criteria: AssessmentCriteria | null;
  }>({ show: false, criteria: null });
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

  // Load Courses for filter dropdown
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await getCoursesApi({ limit: 100 });
        setCourses(res.data.data.courses || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load courses.');
      }
    };
    loadCourses();
  }, []);

  // Fetch assessment criteria
  const fetchCriteria = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAssessmentCriteriaApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        courseId: selectedCourseFilter || undefined,
      });
      const data = response.data.data;
      setCriteriaList(data.criteria || []);
      setTotalCount(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessment criteria.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, selectedCourseFilter]);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.criteria) return;
    const target = deleteConfirm.criteria;
    setDeleteConfirm({ show: false, criteria: null });
    setIsDeleting(true);
    try {
      await deleteAssessmentCriteriaApi(target.id);
      showToast('Assessment criteria deleted successfully.', 'success');
      fetchCriteria();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete criteria.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadge = (type: AssessmentType) => {
    const styles: Record<AssessmentType, string> = {
      exam: 'bg-purple-50 text-purple-700 border-purple-200',
      viva: 'bg-blue-50 text-blue-700 border-blue-200',
      assignment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      project: 'bg-amber-50 text-amber-700 border-amber-200',
      quiz: 'bg-rose-50 text-rose-700 border-rose-200',
      other: 'bg-neutral-50 text-neutral-700 border-neutral-200',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${
          styles[type] || styles.other
        }`}
      >
        {type}
      </span>
    );
  };

  const columns: TableColumn<AssessmentCriteria>[] = [
    {
      header: 'Criteria Name',
      accessor: (item) => (
        <div>
          <span className="font-semibold text-neutral-800">{item.name}</span>
        </div>
      ),
    },
    {
      header: 'Course & Level',
      accessor: (item) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-neutral-800 flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-neutral-400" />
            {item.courseName || '—'}
          </span>
          <span className="text-neutral-500 flex items-center gap-1 mt-0.5">
            <Layers className="h-3 w-3 text-neutral-400" />
            Level {item.levelNumber}
          </span>
        </div>
      ),
    },
    {
      header: 'Subject',
      accessor: (item) => (
        <span className="text-neutral-700 font-medium">
          {item.subjectName || '—'}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (item) => getTypeBadge(item.assessmentType),
    },
    {
      header: 'Marks (Max / Pass)',
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
          <Award className="h-3.5 w-3.5 text-neutral-400" />
          <span>
            {item.maxMarks} / <span className="text-emerald-600">{item.passMarks}</span>
          </span>
        </div>
      ),
    },
    {
      header: 'Has CE',
      accessor: (item) =>
        item.hasCe ? (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 border border-neutral-200">
            No
          </span>
        ),
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedCriteria(item);
              setShowModal(true);
            }}
            title="Edit Criteria"
          >
            <Edit2 className="h-4 w-4 text-neutral-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirm({ show: true, criteria: item })}
            title="Delete Criteria"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
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
            Assessment Criteria
          </h1>
          <p className="text-sm text-neutral-500">
            {totalCount} criteria rule{totalCount !== 1 ? 's' : ''} configured for subject grading
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCriteria(null);
            setShowModal(true);
          }}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Criteria
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="w-full sm:w-72">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search criteria or subject..."
          />
        </div>
        <div className="w-full sm:w-60">
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

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500">Loading criteria...</div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCriteria} />
        ) : criteriaList.length === 0 ? (
          <EmptyState
            title="No criteria found"
            description="Create assessment criteria to define maximum and passing marks for course subjects."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setSelectedCriteria(null);
                  setShowModal(true);
                }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Create Criteria
              </Button>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={criteriaList}
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
        <AssessmentCriteriaModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchCriteria}
          criteria={selectedCriteria}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <ConfirmationModal
          isOpen={deleteConfirm.show}
          onCancel={() => setDeleteConfirm({ show: false, criteria: null })}
          onConfirm={handleDelete}
          title="Delete Assessment Criteria"
          message={`Are you sure you want to delete "${deleteConfirm.criteria?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          loading={isDeleting}
          confirmVariant="danger"
        />
      )}
    </div>
  );
};

export default AssessmentCriteriaPage;
