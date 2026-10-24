import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import {
  getStudentHomeworksApi,
  submitHomeworkApi,
} from '../../services/homeworkService';
import { RequestExtensionModal } from '../../features/homework/components/RequestExtensionModal';
import { openAttachment } from '../../utils/fileHelper';
import type {
  StudentHomeworkItem,
  HomeworkStatus,
  HomeworkAttachment,
} from '../../types/homework';

export const StudentHomeworkPage: React.FC = () => {
  const [homeworks, setHomeworks] = useState<StudentHomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab filter: 'all' | 'pending' | 'submitted' | 'verified'
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'verified'>('all');

  // Submit modal state
  const [selectedHomeworkForSubmit, setSelectedHomeworkForSubmit] = useState<StudentHomeworkItem | null>(null);
  const [solutionAttachments, setSolutionAttachments] = useState<HomeworkAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Extension request modal state
  const [selectedHomeworkForExtension, setSelectedHomeworkForExtension] = useState<StudentHomeworkItem | null>(null);

  const fetchHomeworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentHomeworksApi();
      setHomeworks(res.data.data.homeworks || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your homeworks.');
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = useMemo(() => {
    const total = homeworks.length;
    const pending = homeworks.filter((h) => h.status === 'pending' || h.status === 'redo').length;
    const submitted = homeworks.filter((h) => h.status === 'submitted').length;
    const verified = homeworks.filter((h) => h.status === 'verified').length;
    return { total, pending, submitted, verified };
  }, [homeworks]);

  const filteredHomeworks = useMemo(() => {
    if (statusFilter === 'all') return homeworks;
    if (statusFilter === 'pending') {
      return homeworks.filter((hw) => hw.status === 'pending' || hw.status === 'redo');
    }
    return homeworks.filter((hw) => hw.status === statusFilter);
  }, [homeworks, statusFilter]);

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        setSolutionAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            fileUrl: base64Data,
            fileType: file.type || file.name.split('.').pop(),
            fileSize: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (idx: number) => {
    setSolutionAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomeworkForSubmit) return;

    const due = new Date(selectedHomeworkForSubmit.dueDate);
    const extension = selectedHomeworkForSubmit.extensionRequest;
    const isExtensionApproved = extension?.status === 'approved';
    const effectiveDueDate =
      isExtensionApproved && extension?.extendedDueDate
        ? new Date(extension.extendedDueDate)
        : due;

    if (effectiveDueDate < new Date() && !isExtensionApproved) {
      setSubmitError('Deadline is over');
      return;
    }

    if (solutionAttachments.length === 0) {
      setSubmitError('Please attach at least one solution file.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitHomeworkApi(selectedHomeworkForSubmit.homeworkId, {
        attachments: solutionAttachments,
      });
      setSelectedHomeworkForSubmit(null);
      setSolutionAttachments([]);
      fetchHomeworks();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit homework.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: HomeworkStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-300 shadow-2xs">
            <Clock className="h-3.5 w-3.5" /> Submitted
          </span>
        );
      case 'redo':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/90 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-400 shadow-2xs">
            <RotateCcw className="h-3.5 w-3.5" /> Needs Redo
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 border border-rose-300 shadow-2xs">
            <AlertCircle className="h-3.5 w-3.5" /> Late
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="h-3.5 w-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800">
              Homework & Assignments
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200/80">
              <Sparkles className="h-3 w-3 text-brand-500" />
              Active Term
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            View course assignments, download problem sets, and submit your solutions.
          </p>
        </div>

        {/* Filter Tabs with Active Shading */}
        <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 w-fit">
          {(
            [
              { id: 'all', label: 'All', count: stats.total },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'submitted', label: 'Submitted', count: stats.submitted },
              { id: 'verified', label: 'Verified', count: stats.verified },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === tab.id
                  ? tab.id === 'pending'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                    : tab.id === 'submitted'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs'
                    : tab.id === 'verified'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                    : 'bg-white text-neutral-800 shadow-2xs border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  statusFilter === tab.id
                    ? tab.id === 'pending'
                      ? 'bg-amber-200/90 text-amber-900 font-bold'
                      : tab.id === 'submitted'
                      ? 'bg-blue-200/90 text-blue-900 font-bold'
                      : tab.id === 'verified'
                      ? 'bg-emerald-200/90 text-emerald-900 font-bold'
                      : 'bg-neutral-100 text-neutral-700 font-bold'
                    : 'bg-neutral-200/60 text-neutral-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Homework Summary Stat Cards with Enhanced Shading */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`group rounded-2xl border p-4.5 text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'border-neutral-300 bg-neutral-50 shadow-xs'
              : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Assigned
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-800">{stats.total}</p>
          <p className="mt-0.5 text-xs text-neutral-400">All course assignments</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`group rounded-2xl border p-4.5 text-left transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-amber-400 bg-linear-to-b from-amber-100/90 via-amber-50/60 to-white shadow-xs'
              : 'border-amber-300/80 bg-linear-to-b from-amber-50/60 to-white hover:border-amber-400 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Pending Action
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200/80 text-amber-800 shadow-2xs">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-800">{stats.pending}</p>
          <p className="mt-0.5 text-xs text-amber-700/80 font-medium">Due or needs redo</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('submitted')}
          className={`group rounded-2xl border p-4.5 text-left transition-all cursor-pointer ${
            statusFilter === 'submitted'
              ? 'border-blue-400 bg-linear-to-b from-blue-100/90 via-blue-50/60 to-white shadow-xs'
              : 'border-blue-300/80 bg-linear-to-b from-blue-50/60 to-white hover:border-blue-400 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Submitted
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-200/80 text-blue-800 shadow-2xs">
              <Upload className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-blue-800">{stats.submitted}</p>
          <p className="mt-0.5 text-xs text-blue-700/80 font-medium">Awaiting teacher review</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('verified')}
          className={`group rounded-2xl border p-4.5 text-left transition-all cursor-pointer ${
            statusFilter === 'verified'
              ? 'border-emerald-400 bg-linear-to-b from-emerald-100/90 via-emerald-50/60 to-white shadow-xs'
              : 'border-emerald-300/80 bg-linear-to-b from-emerald-50/60 to-white hover:border-emerald-400 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Verified
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-200/80 text-emerald-800 shadow-2xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-800">{stats.verified}</p>
          <p className="mt-0.5 text-xs text-emerald-700/80 font-medium">Completed & checked</p>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
            <p className="text-xs font-medium text-neutral-400">Loading assignments…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      ) : filteredHomeworks.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? 'No Homework Found' : `No ${statusFilter} assignments found`}
          description={
            statusFilter === 'all'
              ? 'You do not have any homework assignments yet.'
              : `You currently have no assignments with status "${statusFilter}".`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHomeworks.map((hw) => {
            const due = new Date(hw.dueDate);
            const now = new Date();
            const extension = hw.extensionRequest;
            const isExtensionApproved = extension?.status === 'approved';
            const isExtensionPending = extension?.status === 'pending';

            const effectiveDueDate =
              isExtensionApproved && extension?.extendedDueDate
                ? new Date(extension.extendedDueDate)
                : due;

            const isPast = effectiveDueDate < now;
            const canSubmit = (hw.status === 'pending' || hw.status === 'redo') && !isPast;

            // Distinct 4px left status accent border:
            const statusCardBorder =
              hw.status === 'verified'
                ? 'border-l-4 border-l-emerald-500 border-neutral-200/90'
                : hw.status === 'submitted'
                ? 'border-l-4 border-l-blue-500 border-neutral-200/90'
                : hw.status === 'redo'
                ? 'border-l-4 border-l-amber-500 border-neutral-200/90'
                : isPast
                ? 'border-l-4 border-l-rose-500 border-neutral-200/90'
                : isExtensionApproved
                ? 'border-l-4 border-l-emerald-500 border-neutral-200/90'
                : 'border-l-4 border-l-amber-500 border-neutral-200/90';

            return (
              <div
                key={hw.participantId}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 ${statusCardBorder}`}
              >
                <div className="space-y-3">
                  {/* Card Top: Subject & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 border border-neutral-200 mb-1.5">
                        {hw.subjectName}
                      </span>
                      <h3 className="text-base font-bold text-neutral-900 leading-snug">
                        {hw.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Assigned by {hw.teacherName || 'Teacher'}
                      </p>
                    </div>
                    <div>{getStatusBadge(hw.status)}</div>
                  </div>

                  {/* Description */}
                  {hw.description && (
                    <p className="text-xs text-neutral-600 line-clamp-3 bg-neutral-50/80 rounded-xl p-3 border border-neutral-100 leading-relaxed">
                      {hw.description}
                    </p>
                  )}

                  {/* Teacher Attachments */}
                  {hw.teacherAttachments && hw.teacherAttachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Study Materials & Attachments
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {hw.teacherAttachments.map((att, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openAttachment(att.fileUrl, att.fileName)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 transition cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5 text-neutral-500" />
                            <span className="truncate max-w-[140px]">{att.fileName}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-40" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Submitted Solution */}
                  {hw.submissionAttachments && hw.submissionAttachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                        My Submitted Solution
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {hw.submissionAttachments.map((att, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openAttachment(att.fileUrl, att.fileName)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 transition cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[140px]">{att.fileName}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback Remarks */}
                  {hw.remarks && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                        <span>Teacher Feedback</span>
                      </div>
                      <p className="italic text-neutral-800">“{hw.remarks}”</p>
                    </div>
                  )}

                  {/* Extension Request Info Block */}
                  {extension && (
                    <div
                      className={`rounded-xl border p-3 text-xs space-y-1 ${
                        isExtensionApproved
                          ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                          : isExtensionPending
                          ? 'border-amber-200 bg-amber-50/70 text-amber-900'
                          : 'border-rose-200 bg-rose-50/70 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Extension Request: {extension.status.toUpperCase()}
                        </span>
                        {isExtensionApproved && extension.extendedDueDate && (
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                            Extended to:{' '}
                            {new Date(extension.extendedDueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-700">
                        <span className="font-semibold text-neutral-800">Reason:</span> {extension.reason}
                        {extension.explanation && ` — “${extension.explanation}”`}
                      </p>
                      {extension.teacherRemarks && (
                        <p className="italic text-neutral-600 border-t border-neutral-200/60 pt-1 mt-1">
                          Teacher Note: “{extension.teacherRemarks}”
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom / Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        isPast && (hw.status === 'pending' || hw.status === 'redo')
                          ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                          : isExtensionApproved
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                          : 'text-neutral-500 font-medium'
                      }`}
                    >
                      {isExtensionApproved ? 'Extended Due: ' : 'Due: '}
                      {effectiveDueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {canSubmit ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedHomeworkForSubmit(hw);
                        setSolutionAttachments([]);
                        setSubmitError(null);
                      }}
                      className="text-xs"
                    >
                      {hw.status === 'redo' ? 'Resubmit Solution' : 'Submit Solution'}
                    </Button>
                  ) : (hw.status === 'pending' || hw.status === 'redo') && isPast ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> Deadline is over
                      </span>
                      {!extension && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedHomeworkForExtension(hw)}
                          className="text-xs"
                          leftIcon={<Clock className="h-3.5 w-3.5 text-amber-600" />}
                        >
                          Request Extension
                        </Button>
                      )}
                      {isExtensionPending && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                          <Clock className="h-3.5 w-3.5 text-amber-500" /> Request Pending
                        </span>
                      )}
                    </div>
                  ) : hw.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Graded & Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      <Clock className="h-3 w-3" /> Submitted on {hw.submittedAt ? new Date(hw.submittedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Submit Solution Modal */}
      {selectedHomeworkForSubmit && (
        <Modal
          isOpen={!!selectedHomeworkForSubmit}
          onClose={() => setSelectedHomeworkForSubmit(null)}
          title={`Submit — ${selectedHomeworkForSubmit.title}`}
          icon={<BookOpen className="h-5 w-5" />}
          size="md"
        >
          <form onSubmit={handleSubmitSolution} className="space-y-4 p-1">
            {submitError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="text-xs text-neutral-500">
              Upload your completed homework solution (PDF, image, or document).
            </div>

            <div>
              <label className="flex flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed border-neutral-300 hover:border-brand-500 p-6 text-center transition bg-neutral-50 hover:bg-brand-50/20">
                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                <span className="text-sm font-semibold text-neutral-700">
                  Click to browse solution files
                </span>
                <span className="text-xs text-neutral-400 mt-1">
                  Supported formats: PDF, PNG, JPG, DOCX
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {solutionAttachments.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {solutionAttachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-neutral-100/80 px-3 py-1.5 text-xs text-neutral-700"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate">{file.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-neutral-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedHomeworkForSubmit(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Submit Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Request Extension Modal */}
      {selectedHomeworkForExtension && (
        <RequestExtensionModal
          isOpen={!!selectedHomeworkForExtension}
          onClose={() => setSelectedHomeworkForExtension(null)}
          onSuccess={fetchHomeworks}
          homework={selectedHomeworkForExtension}
        />
      )}
    </div>
  );
};

export default StudentHomeworkPage;
