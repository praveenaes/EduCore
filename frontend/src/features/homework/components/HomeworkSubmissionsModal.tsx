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
    }
  }, [isOpen, homework, fetchSubmissions]);

  const handleOpenReview = (sub: HomeworkParticipant) => {
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

  const getStatusBadge = (status: HomeworkStatus) => {
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
      accessor: (row) => getStatusBadge(row.status),
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
      accessor: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleOpenReview(row)}
          disabled={row.status === 'pending'}
          className="text-xs"
        >
          Review
        </Button>
      ),
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
