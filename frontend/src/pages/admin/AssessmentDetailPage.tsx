import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  Edit3,
  BookOpen,
  Award,
  Lock,
  Globe,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Modal } from '../../components/Modal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { ErrorState } from '../../components/ErrorState';
import { MarkEntryModal } from '../../features/assessments/components/MarkEntryModal';
import {
  getAssessmentsApi,
  updateAssessmentApi,
  reviewAssessmentDelegationApi,
} from '../../services/assessmentService';
import { getSubjectAssignmentsApi } from '../../services/subjectAssignmentService';
import {
  getAssessmentSchedulesApi,
  createAssessmentScheduleApi,
  updateAssessmentScheduleApi,
} from '../../services/assessmentScheduleService';
import {
  getAssessmentCriteriaApi,
  createAssessmentCriteriaApi,
  updateAssessmentCriteriaApi,
} from '../../services/assessmentCriteriaService';
import { publishAssessmentResultsApi } from '../../services/assessmentResultService';
import { getBatchesApi } from '../../services/batchService';
import { getCentersApi } from '../../services/centerService';
import type { Assessment, AssessmentStatus } from '../../types/assessment';
import type { SubjectAssignment } from '../../types/subjectAssignment';
import type { AssessmentSchedule } from '../../types/assessmentSchedule';
import type { AssessmentCriteria } from '../../types/assessmentCriteria';
import type { Batch } from '../../types/batch';
import type { Center } from '../../types/center';

export const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [subjects, setSubjects] = useState<SubjectAssignment[]>([]);
  const [schedules, setSchedules] = useState<AssessmentSchedule[]>([]);
  const [criteriaList, setCriteriaList] = useState<AssessmentCriteria[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Status Change Modal
  const [statusConfirm, setStatusConfirm] = useState<{
    show: boolean;
    targetStatus: AssessmentStatus | null;
  }>({ show: false, targetStatus: null });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Schedule Modal / State for Subject
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    subject: SubjectAssignment | null;
    existingSchedule: AssessmentSchedule | null;
    existingCriteria: AssessmentCriteria | null;
  }>({ isOpen: false, subject: null, existingSchedule: null, existingCriteria: null });

  // Mark Entry Modal for Admin (when delegated & approved)
  const [activeMarkEntryScheduleId, setActiveMarkEntryScheduleId] = useState<string | null>(null);

  // Marks Edit Modal
  const [marksModal, setMarksModal] = useState<{
    isOpen: boolean;
    subject: SubjectAssignment | null;
    existingCriteria: AssessmentCriteria | null;
    maxMarks: number;
    passMarks: number;
  }>({ isOpen: false, subject: null, existingCriteria: null, maxMarks: 100, passMarks: 40 });

  const [scheduleForm, setScheduleForm] = useState({
    batchId: '',
    centerId: '',
    examDate: '',
    startTime: '09:30',
    endTime: '12:30',
  });
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [isSubmittingMarks, setIsSubmittingMarks] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [marksError, setMarksError] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    if (!assessmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const assessmentRes = await getAssessmentsApi({ limit: 100 });
      const currentAssessment = assessmentRes.data.data.assessments.find(
        (a) => a.id === assessmentId
      );

      if (!currentAssessment) {
        setError('Assessment event not found.');
        return;
      }

      setAssessment(currentAssessment);

      let subResAssignments: SubjectAssignment[] = [];
      let critResCriteria: AssessmentCriteria[] = [];
      let batchResBatches: Batch[] = [];

      if (currentAssessment.courseId) {
        const [subRes, critRes, batchRes] = await Promise.all([
          getSubjectAssignmentsApi({
            courseId: currentAssessment.courseId,
            levelNumber: currentAssessment.levelNumber,
            limit: 100,
          }),
          getAssessmentCriteriaApi({
            courseId: currentAssessment.courseId,
            levelNumber: currentAssessment.levelNumber,
            limit: 100,
          }),
          getBatchesApi({
            courseId: currentAssessment.courseId,
            levelNumber: currentAssessment.levelNumber,
            limit: 100,
          }),
        ]);
        subResAssignments = subRes.data.data.assignments || [];
        critResCriteria = critRes.data.data.criteria || [];
        batchResBatches = batchRes.data.data.batches || [];
      }

      const [schedRes, centerRes] = await Promise.all([
        getAssessmentSchedulesApi({
          assessmentId: currentAssessment.id,
          limit: 100,
        }),
        getCentersApi({ limit: 100 }),
      ]);

      setSubjects(subResAssignments);
      setSchedules(schedRes.data.data.schedules || []);
      setCriteriaList(critResCriteria);
      setBatches(batchResBatches);
      setCenters(centerRes.data.data.centers || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load assessment details.');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  const handleReviewEventDelegation = async (status: 'APPROVED' | 'REJECTED') => {
    if (!assessment) return;
    try {
      await reviewAssessmentDelegationApi(assessment.id, { status });
      showToast(`Event mark entry delegation ${status.toLowerCase()} successfully.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to review delegation request.', 'error');
    }
  };

  const handlePublishResults = async (scheduleId: string) => {
    try {
      await publishAssessmentResultsApi({ scheduleId, isPublished: true });
      showToast('Assessment marks published to students successfully.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to publish results.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Schedule Dialog for a Subject Card
  const handleOpenSchedule = (subject: SubjectAssignment) => {
    const existingCriteria = criteriaList.find((c) => c.subjectId === subject.subjectId) || null;
    const existingSchedule = schedules.find(
      (s) => s.subjectId === subject.subjectId || (existingCriteria && s.criteriaId === existingCriteria.id)
    ) || null;

    setScheduleModal({
      isOpen: true,
      subject,
      existingSchedule,
      existingCriteria,
    });
    setScheduleError(null);

    if (existingSchedule) {
      const d = new Date(existingSchedule.examDate);
      const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
      setScheduleForm({
        batchId: existingSchedule.batchId,
        centerId: existingSchedule.centerId,
        examDate: dateStr,
        startTime: existingSchedule.startTime || '09:30',
        endTime: existingSchedule.endTime || '12:30',
      });
    } else {
      const defaultBatch = batches[0];
      const eventStart = assessment?.startDate
        ? new Date(assessment.startDate).toISOString().split('T')[0]
        : '';
      setScheduleForm({
        batchId: defaultBatch?.id || '',
        centerId: defaultBatch?.centerId || centers[0]?.id || '',
        examDate: eventStart,
        startTime: '09:30',
        endTime: '12:30',
      });
    }
  };

  // Open Marks Edit Dialog
  const handleOpenMarks = (subject: SubjectAssignment) => {
    const existingCriteria = criteriaList.find((c) => c.subjectId === subject.subjectId) || null;
    setMarksModal({
      isOpen: true,
      subject,
      existingCriteria,
      maxMarks: existingCriteria?.maxMarks ?? 100,
      passMarks: existingCriteria?.passMarks ?? 40,
    });
    setMarksError(null);
  };

  // Save Marks (Criteria)
  const handleSaveMarks = async () => {
    if (!marksModal.subject || !assessment) return;
    if (marksModal.passMarks > marksModal.maxMarks) {
      setMarksError('Pass marks cannot exceed maximum marks.');
      return;
    }
    setMarksError(null);

    const courseId = assessment.courseId || marksModal.subject.courseId;
    const levelNumber = Number(assessment.levelNumber ?? marksModal.subject.levelNumber);
    const safeCriteriaName = `${assessment.name || 'Exam'} - ${marksModal.subject.subjectName}`
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim();

    setIsSubmittingMarks(true);
    try {
      if (marksModal.existingCriteria?.id) {
        await updateAssessmentCriteriaApi(marksModal.existingCriteria.id, {
          name: marksModal.existingCriteria.name || safeCriteriaName,
          courseId,
          levelNumber,
          subjectId: marksModal.subject.subjectId,
          assessmentType: marksModal.existingCriteria.assessmentType || 'exam',
          maxMarks: marksModal.maxMarks,
          passMarks: marksModal.passMarks,
          hasCe: marksModal.existingCriteria.hasCe || false,
        });
      } else {
        await createAssessmentCriteriaApi({
          name: safeCriteriaName,
          courseId,
          levelNumber,
          subjectId: marksModal.subject.subjectId,
          assessmentType: 'exam',
          maxMarks: marksModal.maxMarks,
          passMarks: marksModal.passMarks,
          hasCe: false,
        });
      }

      showToast('Marks criteria saved successfully.', 'success');
      setMarksModal((prev) => ({ ...prev, isOpen: false }));
      loadData();
    } catch (err: any) {
      setMarksError(err?.response?.data?.message || 'Failed to save marks criteria.');
    } finally {
      setIsSubmittingMarks(false);
    }
  };

  // Save Schedule
  const handleSaveSchedule = async () => {
    if (!scheduleModal.subject || !assessment) return;
    if (!scheduleForm.batchId || !scheduleForm.centerId || !scheduleForm.examDate) {
      setScheduleError('Please fill all schedule fields.');
      return;
    }

    if (scheduleForm.startTime >= scheduleForm.endTime) {
      setScheduleError('End time must be after start time.');
      return;
    }
    setScheduleError(null);

    const courseId = assessment.courseId || scheduleModal.subject.courseId;
    const levelNumber = Number(assessment.levelNumber ?? scheduleModal.subject.levelNumber);
    const safeCriteriaName = `${assessment.name || 'Exam'} - ${scheduleModal.subject.subjectName}`
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim();

    setIsSubmittingSchedule(true);
    try {
      // Ensure criteria exists or auto-create it with defaults
      let criteriaId = scheduleModal.existingCriteria?.id;
      if (!criteriaId) {
        const critRes = await createAssessmentCriteriaApi({
          name: safeCriteriaName,
          courseId,
          levelNumber,
          subjectId: scheduleModal.subject.subjectId,
          assessmentType: 'exam',
          maxMarks: 100,
          passMarks: 40,
          hasCe: false,
        });
        criteriaId = critRes.data.data.id;
      }

      if (scheduleModal.existingSchedule?.id) {
        await updateAssessmentScheduleApi(scheduleModal.existingSchedule.id, {
          assessmentId: assessment.id,
          courseId,
          levelNumber,
          criteriaId: criteriaId!,
          batchId: scheduleForm.batchId,
          centerId: scheduleForm.centerId,
          examDate: new Date(scheduleForm.examDate).toISOString(),
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
        });
        showToast('Exam schedule updated successfully.', 'success');
      } else {
        await createAssessmentScheduleApi({
          assessmentId: assessment.id,
          courseId,
          levelNumber,
          criteriaId: criteriaId!,
          batchId: scheduleForm.batchId,
          centerId: scheduleForm.centerId,
          examDate: new Date(scheduleForm.examDate).toISOString(),
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
        });
        showToast('Exam scheduled successfully.', 'success');
      }

      setScheduleModal((prev) => ({ ...prev, isOpen: false }));
      loadData();
    } catch (err: any) {
      setScheduleError(err?.response?.data?.message || 'Failed to save schedule.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // Update Overall Event Status
  const handleUpdateStatus = async (newStatus: AssessmentStatus) => {
    if (!assessment) return;

    if (newStatus === 'COMPLETED') {
      const scheduledIds = new Set(schedules.map((s) => s.subjectId));
      const unscheduled = subjects.filter((s) => !scheduledIds.has(s.subjectId));

      if (subjects.length === 0 || schedules.length === 0 || unscheduled.length > 0) {
        showToast('Event is not fully scheduled', 'error');
        return;
      }
    }

    setIsUpdatingStatus(true);
    try {
      await updateAssessmentApi(assessment.id, {
        name: assessment.name,
        academicYearId: assessment.academicYearId,
        courseId: assessment.courseId,
        levelNumber: assessment.levelNumber,
        startDate: assessment.startDate,
        endDate: assessment.endDate,
        status: newStatus,
      });
      showToast(`Assessment marked as ${newStatus.toLowerCase()}.`, 'success');
      setStatusConfirm({ show: false, targetStatus: null });
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  const statusBadge = useMemo(() => {
    if (!assessment) return null;
    const isAllGraded = schedules.length > 0 && schedules.every((s) => s.isGraded);
    const effectiveStatus = assessment.status === 'PUBLISHED' ? 'PUBLISHED' : (assessment.status === 'GRADED' || isAllGraded) ? 'GRADED' : assessment.status;
    switch (effectiveStatus) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Published
          </span>
        );
      case 'GRADED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Graded
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed (Mark Entry Open)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
            <AlertCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> Scheduled
          </span>
        );
    }
  }, [assessment, schedules]);

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="text-sm font-medium text-neutral-500">Loading exam subjects and timetable...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="p-6">
        <ErrorState message={error || 'Assessment not found'} onRetry={loadData} />
      </div>
    );
  }

  const isAllGraded = schedules.length > 0 && schedules.every((s) => s.isGraded);
  const isCompletedOrPublished = assessment.status === 'COMPLETED' || assessment.status === 'GRADED' || assessment.status === 'PUBLISHED' || isAllGraded;

  return (
    <div className="space-y-6">
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

      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/assessments')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Assessments
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
                {assessment.name}
              </h1>
              {statusBadge}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1 text-neutral-700">
                <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                {assessment.courseName} ({assessment.courseCode}) — {assessment.levelName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                {new Date(assessment.startDate).toLocaleDateString()} →{' '}
                {new Date(assessment.endDate).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>Academic Year: {assessment.academicYearName}</span>
            </div>
          </div>
        </div>

        {/* Global Event Actions */}
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handlePrintTimetable}>
            <Printer className="h-4 w-4 mr-1.5" /> Print Timetable
          </Button>

          {assessment.status === 'SCHEDULED' && (
            <Button
              size="sm"
              onClick={() => {
                const scheduledIds = new Set(schedules.map((s) => s.subjectId));
                const unscheduled = subjects.filter((s) => !scheduledIds.has(s.subjectId));
                if (subjects.length === 0 || schedules.length === 0 || unscheduled.length > 0) {
                  showToast('Event is not fully scheduled', 'error');
                  return;
                }
                setStatusConfirm({ show: true, targetStatus: 'COMPLETED' });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Completed
            </Button>
          )}

          {(assessment.status === 'COMPLETED' || assessment.status === 'GRADED' || isAllGraded) && (
            <Button
              size="sm"
              onClick={() =>
                setStatusConfirm({ show: true, targetStatus: 'PUBLISHED' })
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Award className="h-4 w-4 mr-1.5" /> Publish Results
            </Button>
          )}
        </div>
      </div>

      {/* Event-Level Delegation Request Banner for Admin */}
      {(assessment.delegationStatus === 'REQUESTED' || schedules.some((s) => s.delegationStatus === 'REQUESTED')) && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Teacher Mark Entry Delegation Requested</div>
              <div className="text-xs text-amber-700 mt-0.5">
                The teacher requested Admin mark entry for this entire event. Reason: "<strong>{assessment.delegationReason || schedules.find((s) => s.delegationReason)?.delegationReason || 'Teacher is on leave'}</strong>"
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleReviewEventDelegation('APPROVED')}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Approve Request
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReviewEventDelegation('REJECTED')}
              className="text-xs text-red-600 border-red-300 hover:bg-red-50"
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {(assessment.delegationStatus === 'APPROVED' || (assessment.delegationStatus !== 'REQUESTED' && schedules.some((s) => s.delegationStatus === 'APPROVED'))) && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Delegation Approved — Admin Authorized to enter and edit marks for all subjects of this event.</span>
        </div>
      )}

      {/* Printable Timetable Section (Visible on screen and optimized for Print) */}
      <div className="hidden print:block mb-8">
        <h2 className="text-xl font-bold text-center mb-2">EXAMINATION TIMETABLE</h2>
        <p className="text-center text-sm mb-4">
          {assessment.name} — {assessment.courseName} ({assessment.levelName}) — Academic Year:{' '}
          {assessment.academicYearName}
        </p>
        <table className="w-full border-collapse border border-neutral-300 text-sm">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 p-2 text-left">Subject Code</th>
              <th className="border border-neutral-300 p-2 text-left">Subject Name</th>
              <th className="border border-neutral-300 p-2 text-left">Exam Date</th>
              <th className="border border-neutral-300 p-2 text-left">Time</th>
              <th className="border border-neutral-300 p-2 text-left">Max / Pass</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => {
              const sched = schedules.find((s) => s.subjectId === sub.subjectId);
              const crit = criteriaList.find((c) => c.subjectId === sub.subjectId);
              return (
                <tr key={sub.id}>
                  <td className="border border-neutral-300 p-2 font-mono">{sub.subjectCode}</td>
                  <td className="border border-neutral-300 p-2 font-medium">{sub.subjectName}</td>
                  <td className="border border-neutral-300 p-2">
                    {sched?.examDate ? new Date(sched.examDate).toLocaleDateString() : 'TBD'}
                  </td>
                  <td className="border border-neutral-300 p-2">
                    {sched?.startTime ? `${sched.startTime} - ${sched.endTime}` : 'TBD'}
                  </td>
                  <td className="border border-neutral-300 p-2">
                    {crit ? `${crit.maxMarks} / ${crit.passMarks}` : '100 / 40'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Screen Subject Cards Section */}
      <div className="print:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">
            Course Subjects ({subjects.length})
          </h2>
          <span className="text-xs text-neutral-500">
            {schedules.length} of {subjects.length} subjects scheduled
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
            No subjects are currently assigned to {assessment.courseName} ({assessment.levelName}). Please assign subjects under Academics → Subject Assignments first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject) => {
              const criteria = criteriaList.find((c) => c.subjectId === subject.subjectId);
              const schedule = schedules.find(
                (s) =>
                  (s.subjectId === subject.subjectId || (criteria && s.criteriaId === criteria.id)) &&
                  s.assessmentId === assessment.id
              );
              const maxMarks = criteria?.maxMarks ?? 100;
              const passMarks = criteria?.passMarks ?? 40;

              return (
                <div
                  key={subject.id}
                  className="flex flex-col justify-between rounded-xl bg-white border border-neutral-200/90 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-neutral-100 bg-neutral-50/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 mb-1">
                          {subject.subjectCode || 'SUB'}
                        </span>
                        <h3 className="text-base font-bold text-neutral-800 leading-snug">
                          {subject.subjectName}
                        </h3>
                      </div>
                      {schedule?.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Published
                        </span>
                      ) : schedule?.isGraded ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
                          <CheckCircle2 className="h-3 w-3" /> Graded
                        </span>
                      ) : (schedule?.isCompleted || isCompletedOrPublished) && schedule ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : schedule ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3" /> Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 border border-neutral-200">
                          <Clock className="h-3 w-3" /> Not Scheduled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3.5 text-xs text-neutral-600">
                    {/* Marks Configuration */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-150">
                      <div>
                        <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold block">
                          Evaluation Marks
                        </span>
                        <div className="font-semibold text-neutral-800 text-sm mt-0.5">
                          Max: <span className="text-brand-600 font-bold">{maxMarks}</span>{' '}
                          <span className="text-neutral-300 mx-1">|</span>{' '}
                          Pass: <span className="text-neutral-700">{passMarks}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isCompletedOrPublished}
                        onClick={() => handleOpenMarks(subject)}
                        className="text-neutral-600 hover:text-brand-600 hover:bg-neutral-100"
                        title={
                          isCompletedOrPublished
                            ? 'Marks cannot be changed after exam is completed'
                            : 'Edit Passing and Maximum Marks'
                        }
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </div>

                    {/* Schedule Details */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400 font-medium">Exam Date:</span>
                        <span className="font-semibold text-neutral-800">
                          {schedule?.examDate
                            ? new Date(schedule.examDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Not set'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400 font-medium">Exam Time:</span>
                        <span className="font-semibold text-neutral-800">
                          {schedule?.startTime ? `${schedule.startTime} → ${schedule.endTime}` : 'Not set'}
                        </span>
                      </div>

                      {schedule?.batchName && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400 font-medium">Batch:</span>
                          <span className="font-medium text-neutral-700">{schedule.batchName}</span>
                        </div>
                      )}
                    </div>

                    {/* Delegation Status Indicator on Card */}
                    {(assessment.delegationStatus === 'APPROVED' || schedule?.delegationStatus === 'APPROVED') ? (
                      <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Delegation Approved — Admin Authorized
                      </div>
                    ) : (assessment.delegationStatus === 'REQUESTED' || schedule?.delegationStatus === 'REQUESTED') ? (
                      <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        Delegation Pending Approval
                      </div>
                    ) : null}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-neutral-50/40 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isCompletedOrPublished}
                      onClick={() => handleOpenSchedule(subject)}
                      className="w-1/2 text-xs"
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {schedule ? 'Edit Schedule' : 'Schedule Exam'}
                    </Button>

                    {schedule?.isGraded ? (
                      <div className="flex items-center gap-1.5 w-1/2">
                        {!schedule.isPublished ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handlePublishResults(schedule.id)}
                            className={(assessment.delegationStatus === 'APPROVED' || schedule.delegationStatus === 'APPROVED') ? 'w-1/2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white' : 'w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white'}
                            title="Publish marks to students"
                          >
                            <Globe className="h-3.5 w-3.5 mr-1" />
                            Publish
                          </Button>
                        ) : (
                          <span className={(assessment.delegationStatus === 'APPROVED' || schedule.delegationStatus === 'APPROVED') ? 'w-1/2 text-[11px] font-semibold text-emerald-700 text-center' : 'w-full text-[11px] font-semibold text-emerald-700 text-center'}>
                            Published
                          </span>
                        )}

                        {/* Only show Edit Marks if teacher requested delegation and Admin approved it */}
                        {(assessment.delegationStatus === 'APPROVED' || schedule.delegationStatus === 'APPROVED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveMarkEntryScheduleId(schedule.id)}
                            className={schedule.isPublished ? 'w-full text-xs' : 'w-1/2 text-xs'}
                            title="Review or adjust entered marks (Approved Delegation)"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                            Edit Marks
                          </Button>
                        )}
                      </div>
                    ) : isCompletedOrPublished && schedule ? (
                      (assessment.delegationStatus === 'APPROVED' || schedule.delegationStatus === 'APPROVED') ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setActiveMarkEntryScheduleId(schedule.id)}
                          className="w-1/2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                          Enter Marks
                        </Button>
                      ) : (assessment.delegationStatus === 'REQUESTED' || schedule.delegationStatus === 'REQUESTED') ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="w-1/2 text-xs opacity-75 cursor-not-allowed bg-amber-50 text-amber-700 border-amber-200"
                          title="Please approve or reject the teacher delegation request above"
                        >
                          Pending Approval
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="w-1/2 text-xs opacity-50 cursor-not-allowed bg-neutral-100 text-neutral-400"
                          title="Mark entry is assigned to the teacher. Only available to Admin upon approved delegation."
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Teacher Duty
                        </Button>
                      )
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled
                        className="w-1/2 text-xs opacity-40 cursor-not-allowed bg-neutral-200 text-neutral-500"
                        title="Mark entry is locked while exam is Scheduled. Admin marks Completed once exams conclude."
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Enter Marks
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Configuration Modal */}
      {scheduleModal.isOpen && scheduleModal.subject && (
        <Modal
          isOpen={scheduleModal.isOpen}
          onClose={() => setScheduleModal((prev) => ({ ...prev, isOpen: false }))}
          title={`Schedule Exam — ${scheduleModal.subject.subjectName}`}
          icon={<Calendar className="h-5 w-5 text-brand-600" />}
          size="md"
        >
          <div className="space-y-4 p-1">
            {scheduleError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{scheduleError}</span>
              </div>
            )}

            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs text-neutral-600">
              Event Window:{' '}
              <span className="font-semibold text-neutral-800">
                {new Date(assessment.startDate).toLocaleDateString()}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-neutral-800">
                {new Date(assessment.endDate).toLocaleDateString()}
              </span>
            </div>

            <Select
              label="Select Batch"
              options={[
                { value: '', label: 'Select Batch' },
                ...batches.map((b) => ({ value: b.id, label: `${b.name} (${b.centerName || 'Academy'})` })),
              ]}
              value={scheduleForm.batchId}
              onChange={(e) => {
                const bId = e.target.value;
                const bObj = batches.find((b) => b.id === bId);
                setScheduleForm((prev) => ({
                  ...prev,
                  batchId: bId,
                  centerId: bObj?.centerId || prev.centerId,
                }));
              }}
            />

            <Select
              label="Exam Center"
              options={[
                { value: '', label: 'Select Center' },
                ...centers.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
              ]}
              value={scheduleForm.centerId}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, centerId: e.target.value }))}
            />

            <Input
              label="Exam Date"
              type="date"
              min={new Date(assessment.startDate).toISOString().split('T')[0]}
              max={new Date(assessment.endDate).toISOString().split('T')[0]}
              value={scheduleForm.examDate}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, examDate: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
              <Input
                label="End Time"
                type="time"
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleModal((prev) => ({ ...prev, isOpen: false }))}
                disabled={isSubmittingSchedule}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSchedule}
                isLoading={isSubmittingSchedule}
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Marks Configuration Modal */}
      {marksModal.isOpen && marksModal.subject && (
        <Modal
          isOpen={marksModal.isOpen}
          onClose={() => setMarksModal((prev) => ({ ...prev, isOpen: false }))}
          title={`Marks Configuration — ${marksModal.subject.subjectName}`}
          icon={<Award className="h-5 w-5 text-brand-600" />}
          size="md"
        >
          <div className="space-y-4 p-1">
            {marksError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{marksError}</span>
              </div>
            )}

            <p className="text-xs text-neutral-500">
              Set the maximum score and passing threshold for this subject exam.
            </p>

            <Input
              label="Maximum Marks"
              type="number"
              min={1}
              max={1000}
              value={marksModal.maxMarks}
              onChange={(e) =>
                setMarksModal((prev) => ({ ...prev, maxMarks: Number(e.target.value) || 0 }))
              }
            />

            <Input
              label="Pass Marks"
              type="number"
              min={1}
              max={marksModal.maxMarks}
              value={marksModal.passMarks}
              onChange={(e) =>
                setMarksModal((prev) => ({ ...prev, passMarks: Number(e.target.value) || 0 }))
              }
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMarksModal((prev) => ({ ...prev, isOpen: false }))}
                disabled={isSubmittingMarks}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveMarks}
                isLoading={isSubmittingMarks}
              >
                Save Marks
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Transition Confirmation Modal */}
      {statusConfirm.show && (
        <ConfirmationModal
          isOpen={statusConfirm.show}
          onCancel={() => setStatusConfirm({ show: false, targetStatus: null })}
          onConfirm={() => {
            if (statusConfirm.targetStatus) {
              handleUpdateStatus(statusConfirm.targetStatus);
            }
          }}
          title={
            statusConfirm.targetStatus === 'COMPLETED'
              ? 'Mark Assessment as Completed'
              : 'Publish Assessment Results'
          }
          message={
            statusConfirm.targetStatus === 'COMPLETED'
              ? `Mark "${assessment.name}" as Completed? This confirms exams are concluded and unlocks the "Enter Marks" buttons for grading.`
              : `Publish results for "${assessment.name}"? This releases graded results to the students.`
          }
          confirmText={statusConfirm.targetStatus === 'COMPLETED' ? 'Mark Completed' : 'Publish'}
          cancelText="Cancel"
          loading={isUpdatingStatus}
          confirmVariant={statusConfirm.targetStatus === 'COMPLETED' ? 'primary' : 'primary'}
        />
      )}

      {/* Mark Entry Modal for Admin (when delegated & approved) */}
      {activeMarkEntryScheduleId && (
        <MarkEntryModal
          isOpen={Boolean(activeMarkEntryScheduleId)}
          onClose={() => setActiveMarkEntryScheduleId(null)}
          scheduleId={activeMarkEntryScheduleId}
          onSuccess={() => {
            showToast('Marks successfully saved', 'success');
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default AssessmentDetailPage;
