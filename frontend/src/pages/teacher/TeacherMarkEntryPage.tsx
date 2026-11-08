import React, { useCallback, useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  Send,
  ArrowLeft,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Modal } from '../../components/Modal';
import MarkEntryModal from '../../features/assessments/components/MarkEntryModal';
import {
  getAssessmentsApi,
  requestAssessmentDelegationApi,
} from '../../services/assessmentService';
import { getAssessmentSchedulesApi } from '../../services/assessmentScheduleService';
import type { Assessment } from '../../types/assessment';
import type { AssessmentSchedule } from '../../types/assessmentSchedule';

export const TeacherMarkEntryPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [eventSchedules, setEventSchedules] = useState<AssessmentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Mark Entry Modal
  const [showMarkEntryModal, setShowMarkEntryModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Event Delegation Modal
  const [delegationModal, setDelegationModal] = useState<{
    isOpen: boolean;
    assessment: Assessment | null;
    reason: string;
    isSubmitting: boolean;
  }>({ isOpen: false, assessment: null, reason: '', isSubmitting: false });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Assessment Events
  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAssessmentsApi({
        limit: 100,
        search: debouncedSearch || undefined,
      });
      setAssessments(res.data.data.assessments || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load assessment events');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Load schedules when an assessment is selected
  const loadEventSchedules = useCallback(async (assessmentId: string) => {
    setIsLoadingSchedules(true);
    try {
      const res = await getAssessmentSchedulesApi({
        assessmentId,
        limit: 100,
      });
      setEventSchedules(res.data.data.schedules || []);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load event subjects', 'error');
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAssessment) {
      loadEventSchedules(selectedAssessment.id);
    } else {
      setEventSchedules([]);
    }
  }, [selectedAssessment, loadEventSchedules]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Published
          </span>
        );
      case 'GRADED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Graded
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> Scheduled
          </span>
        );
    }
  };

  const getDelegationBadge = (status?: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> Delegation Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Delegated to Admin
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3.5 w-3.5" /> Delegation Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
            Teacher Duty
          </span>
        );
    }
  };

  const eventColumns: TableColumn<Assessment>[] = [
    {
      header: 'Assessment Event',
      accessor: (a) => (
        <div className="cursor-pointer" onClick={() => setSelectedAssessment(a)}>
          <div className="font-semibold text-neutral-900 hover:text-brand-600 transition-colors flex items-center gap-2">
            {a.name}
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {a.courseName} — {a.levelName || `Level ${a.levelNumber}`} ({a.academicYearName || 'Current Year'})
          </div>
        </div>
      ),
    },
    {
      header: 'Exam Window',
      accessor: (a) => (
        <div className="text-xs text-neutral-600 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
          <span>
            {new Date(a.startDate).toLocaleDateString()} → {new Date(a.endDate).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (a) => getStatusBadge(a.status),
    },
    {
      header: 'Mark Entry Delegation',
      accessor: (a) => getDelegationBadge(a.delegationStatus),
    },
    {
      header: 'Actions',
      accessor: (a) => {
        const canRequest =
          a.status === 'COMPLETED' &&
          a.delegationStatus !== 'APPROVED' &&
          a.delegationStatus !== 'REQUESTED';

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setSelectedAssessment(a)}
              className="text-xs flex items-center gap-1"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> View Subjects
            </Button>

            {canRequest && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setDelegationModal({
                    isOpen: true,
                    assessment: a,
                    reason: '',
                    isSubmitting: false,
                  });
                }}
                className="text-xs flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                title="Request Admin to enter marks for this entire event"
              >
                <Send className="h-3 w-3" /> Request Admin
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const handleDelegationSubmit = async () => {
    if (!delegationModal.assessment?.id) return;
    if (!delegationModal.reason.trim()) {
      showToast('Please provide a reason for the delegation request.', 'error');
      return;
    }

    setDelegationModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await requestAssessmentDelegationApi(delegationModal.assessment.id, {
        reason: delegationModal.reason.trim(),
      });
      showToast('Delegation request submitted to Admin successfully.', 'success');
      setDelegationModal({ isOpen: false, assessment: null, reason: '', isSubmitting: false });
      fetchAssessments();
      if (selectedAssessment?.id === delegationModal.assessment.id) {
        setSelectedAssessment((prev) =>
          prev ? { ...prev, delegationStatus: 'REQUESTED', delegationReason: delegationModal.reason.trim() } : null
        );
        loadEventSchedules(delegationModal.assessment.id);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit delegation request.', 'error');
    } finally {
      setDelegationModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* View 1: Assessment Events List */}
      {!selectedAssessment ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
                <FileSpreadsheet className="h-6 w-6 text-brand-600" />
                Exam Mark Entry & Grading
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Select an assessment event to enter student marks, or request Admin delegation if on leave.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-80">
            <SearchBox
              placeholder="Search assessment event..."
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-neutral-500">Loading assessment events...</div>
            ) : error ? (
              <ErrorState title="Failed to load events" message={error} onRetry={fetchAssessments} />
            ) : assessments.length === 0 ? (
              <EmptyState
                title="No assessment events found"
                description="Assessment events created by Admin will appear here once scheduled."
              />
            ) : (
              <Table<Assessment>
                data={assessments}
                columns={eventColumns}
                keyExtractor={(a) => a.id}
              />
            )}
          </div>
        </>
      ) : (
        /* View 2: Subjects Under Selected Assessment Event */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssessment(null)}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Assessment Events
              </Button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
                    {selectedAssessment.name}
                  </h1>
                  {getStatusBadge(
                    eventSchedules.length > 0 && eventSchedules.every((s) => s.isGraded)
                      ? 'GRADED'
                      : selectedAssessment.status
                  )}
                  {getDelegationBadge(selectedAssessment.delegationStatus)}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-neutral-500 font-medium">
                  <span className="flex items-center gap-1 text-neutral-700">
                    <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                    {selectedAssessment.courseName} — {selectedAssessment.levelName || `Level ${selectedAssessment.levelNumber}`}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    {new Date(selectedAssessment.startDate).toLocaleDateString()} →{' '}
                    {new Date(selectedAssessment.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {selectedAssessment.status === 'COMPLETED' &&
              selectedAssessment.delegationStatus !== 'APPROVED' &&
              selectedAssessment.delegationStatus !== 'REQUESTED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDelegationModal({
                      isOpen: true,
                      assessment: selectedAssessment,
                      reason: '',
                      isSubmitting: false,
                    })
                  }
                  className="text-xs flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" /> Request Admin for Event
                </Button>
              )}
          </div>

          {selectedAssessment.delegationStatus === 'APPROVED' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Mark entry for this entire event has been delegated to and approved by the Admin.
              </span>
            </div>
          )}

          {selectedAssessment.delegationStatus === 'REQUESTED' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5 font-medium">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Delegation request for this event is pending Admin approval. Reason: "{selectedAssessment.delegationReason}".
              </span>
            </div>
          )}

          {isLoadingSchedules ? (
            <div className="p-12 text-center text-sm text-neutral-500">Loading subjects...</div>
          ) : eventSchedules.length === 0 ? (
            <EmptyState
              title="No subjects scheduled yet"
              description="Subjects under this event will appear once scheduled by the Admin."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {eventSchedules.map((schedule) => {
                const isDelegated = selectedAssessment.delegationStatus === 'APPROVED';
                const isEventScheduled = selectedAssessment.status === 'SCHEDULED';
                const subjectStatus = schedule.isPublished
                  ? 'PUBLISHED'
                  : schedule.isGraded
                  ? 'GRADED'
                  : isEventScheduled
                  ? 'SCHEDULED'
                  : 'COMPLETED';

                return (
                  <div
                    key={schedule.id}
                    className="flex flex-col justify-between rounded-xl bg-white border border-neutral-200/90 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-neutral-100 bg-neutral-50/60 flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 mb-1">
                          {schedule.subjectCode || 'SUB'}
                        </span>
                        <h3 className="text-base font-bold text-neutral-800 leading-snug">
                          {schedule.subjectName || schedule.criteriaName || 'Subject Exam'}
                        </h3>
                      </div>
                      {getStatusBadge(subjectStatus)}
                    </div>

                    <div className="p-4 space-y-2.5 text-xs text-neutral-600 flex-1">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                        <Calendar className="h-3.5 w-3.5 text-brand-600" />
                        <span>
                          {new Date(schedule.examDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                        <span>
                          {schedule.startTime} – {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-500 pt-1 border-t border-neutral-100">
                        <span>Batch: <strong className="text-neutral-700">{schedule.batchName}</strong></span>
                        <span>Center: <strong className="text-neutral-700">{schedule.centerName}</strong></span>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-50/40 border-t border-neutral-100 flex items-center justify-end">
                      {isDelegated ? (
                        <span className="text-xs font-semibold text-emerald-700 py-1.5">
                          Delegated to Admin
                        </span>
                      ) : isEventScheduled ? (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled
                          className="w-full text-xs opacity-50 cursor-not-allowed bg-neutral-200 text-neutral-500"
                        >
                          Mark Entry Locked (Scheduled)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedScheduleId(schedule.id);
                            setShowMarkEntryModal(true);
                          }}
                          className="w-full text-xs flex items-center justify-center gap-1.5"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                          {schedule.isGraded || schedule.isPublished ? 'Edit Marks' : 'Enter Marks'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mark Entry Modal */}
      {showMarkEntryModal && selectedScheduleId && (
        <MarkEntryModal
          isOpen={showMarkEntryModal}
          onClose={() => {
            setShowMarkEntryModal(false);
            setSelectedScheduleId(null);
            if (selectedAssessment) {
              loadEventSchedules(selectedAssessment.id);
            }
          }}
          scheduleId={selectedScheduleId}
          onSuccess={() => {
            showToast('Marks successfully saved', 'success');
            if (selectedAssessment) {
              loadEventSchedules(selectedAssessment.id);
              fetchAssessments();
            }
          }}
        />
      )}

      {/* Delegation Request Modal for Event */}
      {delegationModal.isOpen && delegationModal.assessment && (
        <Modal
          isOpen={delegationModal.isOpen}
          onClose={() =>
            setDelegationModal({ isOpen: false, assessment: null, reason: '', isSubmitting: false })
          }
          title={`Request Admin Mark Entry — ${delegationModal.assessment.name}`}
          icon={<Send className="h-5 w-5 text-amber-600" />}
          size="md"
        >
          <div className="space-y-4 p-1">
            <p className="text-xs text-neutral-600">
              Submit a mark entry delegation request for the entire assessment event <strong>{delegationModal.assessment.name}</strong> to the Admin (e.g., if you are on leave or unable to grade).
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                Reason for Delegation <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="e.g. On medical leave from Nov 4 to Nov 8..."
                value={delegationModal.reason}
                onChange={(e) =>
                  setDelegationModal((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDelegationModal({ isOpen: false, assessment: null, reason: '', isSubmitting: false })
                }
                disabled={delegationModal.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={delegationModal.isSubmitting}
                onClick={handleDelegationSubmit}
              >
                Submit Event Request
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </div>
  );
};

export default TeacherMarkEntryPage;
