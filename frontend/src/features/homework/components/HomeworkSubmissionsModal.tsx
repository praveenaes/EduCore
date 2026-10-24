import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Table, type TableColumn } from '../../../components/Table';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  RotateCcw,
  FileText,
  AlertCircle,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import {
  getHomeworkSubmissionsApi,
  reviewSubmissionApi,
  reviewHomeworkExtensionApi,
} from '../../../services/homeworkService';
import { openAttachment } from '../../../utils/fileHelper';
import type { Homework, HomeworkParticipant, HomeworkStatus } from '../../../types/homework';

interface HomeworkSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: Homework | null;
}

export const HomeworkSubmissionsModal: React.FC<HomeworkSubmissionsModalProps> = ({
  isOpen,
  onClose,
  homework,
}) => {
  const [submissions, setSubmissions] = useState<HomeworkParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active student review state
  const [reviewingStudentId, setReviewingStudentId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'verified' | 'redo'>('verified');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Active extension review state
  const [reviewingExtensionSub, setReviewingExtensionSub] = useState<HomeworkParticipant | null>(null);
  const [extDecision, setExtDecision] = useState<'approved' | 'rejected'>('approved');
  const [extDueDate, setExtDueDate] = useState('');
  const [extRemarks, setExtRemarks] = useState('');
  const [isSavingExtension, setIsSavingExtension] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!homework) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getHomeworkSubmissionsApi(homework.id);
      setSubmissions(res.data.data.submissions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  }, [homework]);

  useEffect(() => {
    if (isOpen && homework) {
      fetchSubmissions();
    } else {
      setReviewingStudentId(null);
      setReviewRemarks('');
      setReviewingExtensionSub(null);
      setExtRemarks('');
    }
  }, [isOpen, homework, fetchSubmissions]);

  const handleOpenReview = (sub: HomeworkParticipant) => {
    setReviewingExtensionSub(null);
    setReviewingStudentId(sub.id);
    setReviewStatus(sub.status === 'redo' ? 'redo' : 'verified');
    setReviewRemarks(sub.remarks || '');
  };

  const handleSaveReview = async (participantId: string) => {
    if (!homework) return;
    setIsSavingReview(true);
    try {
      await reviewSubmissionApi(homework.id, participantId, {
        status: reviewStatus,
        remarks: reviewRemarks.trim(),
      });
      // Optimistically update status locally
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === participantId
            ? {
                ...s,
                status: reviewStatus,
                remarks: reviewRemarks.trim(),
                verifiedAt: new Date().toISOString(),
              }
            : s
        )
      );
      setReviewingStudentId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update review status.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleOpenExtensionReview = (sub: HomeworkParticipant) => {
    setReviewingStudentId(null);
    setReviewingExtensionSub(sub);
    setExtDecision(sub.extensionRequest?.status === 'rejected' ? 'rejected' : 'approved');

    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');

    setExtDueDate(
      sub.extensionRequest?.extendedDueDate
        ? new Date(sub.extensionRequest.extendedDueDate).toISOString().slice(0, 16)
        : `${y}-${m}-${day}T${hours}:${mins}`
    );
    setExtRemarks(sub.extensionRequest?.teacherRemarks || '');
  };

  const handleSaveExtensionReview = async () => {
    if (!homework || !reviewingExtensionSub) return;
    setIsSavingExtension(true);
    try {
      await reviewHomeworkExtensionApi(homework.id, reviewingExtensionSub.studentId, {
        status: extDecision,
        extendedDueDate: extDecision === 'approved' && extDueDate ? new Date(extDueDate).toISOString() : undefined,
        teacherRemarks: extRemarks.trim(),
      });
      await fetchSubmissions();
      setReviewingExtensionSub(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review extension request.');
    } finally {
      setIsSavingExtension(false);
    }
  };

  const getStatusBadge = (status: HomeworkStatus, ext?: HomeworkParticipant['extensionRequest']) => {
    if (ext && ext.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-300">
          <Clock className="h-3 w-3 text-amber-600" /> Extension Requested
        </span>
      );
    }
    if (ext && ext.status === 'approved' && status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300">
          <CheckCircle className="h-3 w-3 text-emerald-600" /> Extension Approved
        </span>
      );
    }
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3" /> Verified
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Clock className="h-3 w-3" /> Submitted
          </span>
        );
      case 'redo':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <RotateCcw className="h-3 w-3" /> Needs Redo
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            Late
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 border border-neutral-200">
            Pending
          </span>
        );
    }
  };

  const columns: TableColumn<HomeworkParticipant>[] = [
    {
      header: 'Student',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-neutral-900">{row.studentName || 'Student'}</div>
          <div className="text-xs text-neutral-400">{row.admissionNumber || 'No ID'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status, row.extensionRequest),
    },
    {
      header: 'Submitted At',
      accessor: (row) =>
        row.submittedAt ? (
          <span className="text-xs text-neutral-600">
            {new Date(row.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
    {
      header: 'Attachments',
      accessor: (row) =>
        row.submissionAttachments && row.submissionAttachments.length > 0 ? (
          <div className="flex flex-col gap-1">
            {row.submissionAttachments.map((att, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openAttachment(att.fileUrl, att.fileName)}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 hover:underline truncate max-w-[150px] cursor-pointer text-left"
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate">{att.fileName}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-neutral-400">None</span>
        ),
    },
    {
      header: 'Action',
      accessor: (row) => {
        // Once the student has submitted, show the standard homework Review button
        if (row.status !== 'pending') {
          return (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenReview(row)}
              className="text-xs"
            >
              Review
            </Button>
          );
        }

        // If the student has not submitted yet and has a pending extension request, show Review Request
        if (row.extensionRequest?.status === 'pending') {
          return (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenExtensionReview(row)}
              className="text-xs"
            >
              Review Request
            </Button>
          );
        }

        return <span className="text-xs text-neutral-400">—</span>;
      },
    },
  ];

  if (!isOpen || !homework) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submissions — ${homework.title}`}
      icon={<ClipboardList className="h-5 w-5" />}
      size="xl"
    >
      <div className="space-y-4 p-1">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-50 px-4 py-3 border border-neutral-200/60 text-xs text-neutral-600">
          <div>
            Batch: <span className="font-semibold text-neutral-800">{homework.batchName || 'Class'}</span>
          </div>
          <div>
            Due Date:{' '}
            <span className="font-semibold text-neutral-800">
              {new Date(homework.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div>
            Total Assigned:{' '}
            <span className="font-semibold text-neutral-800">{submissions.length}</span>
          </div>
        </div>

        {/* Inline Review Drawer / Panel if review button was clicked */}
        {reviewingStudentId && (
          <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-3 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                Reviewing Submission
              </span>
              <button
                type="button"
                onClick={() => setReviewingStudentId(null)}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Evaluation Verdict
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('verified')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold border transition ${
                      reviewStatus === 'verified'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    ✓ Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('redo')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold border transition ${
                      reviewStatus === 'redo'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    ↺ Redo Needed
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Teacher Remarks & Feedback
                </label>
                <input
                  type="text"
                  placeholder="e.g. Good work! / Recheck question 3"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSaveReview(reviewingStudentId)}
                isLoading={isSavingReview}
              >
                Save Evaluation
              </Button>
            </div>
          </div>
        )}

        {/* Inline Extension Request Review Drawer */}
        {reviewingExtensionSub && reviewingExtensionSub.extensionRequest && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-3 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" />
                Reviewing Extension Request — {reviewingExtensionSub.studentName} ({reviewingExtensionSub.admissionNumber || 'Student'})
              </span>
              <button
                type="button"
                onClick={() => setReviewingExtensionSub(null)}
                className="text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="rounded-lg bg-white p-3 border border-amber-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">Reason:</span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {reviewingExtensionSub.extensionRequest.reason}
                </span>
              </div>
              {reviewingExtensionSub.extensionRequest.explanation && (
                <div>
                  <span className="font-semibold text-neutral-700">Explanation:</span>
                  <p className="italic text-neutral-800 mt-0.5">“{reviewingExtensionSub.extensionRequest.explanation}”</p>
                </div>
              )}
              {reviewingExtensionSub.extensionRequest.attachment && (
                <div className="pt-1">
                  <span className="font-semibold text-neutral-700">Attached Proof: </span>
                  <button
                    type="button"
                    onClick={() =>
                      openAttachment(
                        reviewingExtensionSub.extensionRequest!.attachment!.fileUrl,
                        reviewingExtensionSub.extensionRequest!.attachment!.fileName
                      )
                    }
                    className="inline-flex items-center gap-1 text-brand-600 hover:underline font-semibold cursor-pointer ml-1"
                  >
                    <FileText className="h-3 w-3" />
                    {reviewingExtensionSub.extensionRequest.attachment.fileName}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Decision <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800">
                    <input
                      type="radio"
                      name="extDecision"
                      value="approved"
                      checked={extDecision === 'approved'}
                      onChange={() => setExtDecision('approved')}
                    />
                    Approve Extension
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-rose-800">
                    <input
                      type="radio"
                      name="extDecision"
                      value="rejected"
                      checked={extDecision === 'rejected'}
                      onChange={() => setExtDecision('rejected')}
                    />
                    Reject Request
                  </label>
                </div>
              </div>

              {extDecision === 'approved' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    New Extended Due Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={extDueDate}
                    onChange={(e) => setExtDueDate(e.target.value)}
                    className="w-full sm:w-72 rounded-xl border border-neutral-300 px-3 py-1.5 text-xs text-neutral-800 outline-none bg-white focus:border-brand-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Teacher Remarks / Feedback
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approved due to illness. Please submit as soon as possible."
                  value={extRemarks}
                  onChange={(e) => setExtRemarks(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-800 outline-none bg-white focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReviewingExtensionSub(null)}
                  disabled={isSavingExtension}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveExtensionReview}
                  isLoading={isSavingExtension}
                  className="text-xs"
                >
                  Save Decision
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto">
          <Table
            columns={columns}
            data={submissions}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default HomeworkSubmissionsModal;
