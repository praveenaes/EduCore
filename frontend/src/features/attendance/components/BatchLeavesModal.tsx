import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { EmptyState } from '../../../components/EmptyState';
import {
  CalendarX,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  getBatchLeavesApi,
  reviewStudentLeaveApi,
} from '../../../services/leaveService';
import type { LeaveRequest, LeaveStatus, LeaveType } from '../../../types/leave';
import type { TeacherInChargeBatch } from '../../../types/teacher';

interface BatchLeavesModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: TeacherInChargeBatch | null;
}

export const BatchLeavesModal: React.FC<BatchLeavesModalProps> = ({
  isOpen,
  onClose,
  batch,
}) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch] = useState('');

  // Active review state
  const [reviewingLeaveId, setReviewingLeaveId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    if (!batch) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBatchLeavesApi(batch.id);
      setLeaves(res.data.data.leaves || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load batch leave requests.');
    } finally {
      setIsLoading(false);
    }
  }, [batch]);

  useEffect(() => {
    if (isOpen && batch) {
      fetchLeaves();
      setActiveTab('pending');
      setSearch('');
      setReviewingLeaveId(null);
      setReviewRemarks('');
    }
  }, [isOpen, batch, fetchLeaves]);

  // Counts
  const counts = useMemo(() => {
    const pending = leaves.filter((l) => l.status === 'pending').length;
    const approved = leaves.filter((l) => l.status === 'approved').length;
    const rejected = leaves.filter((l) => l.status === 'rejected').length;
    return { pending, approved, rejected, total: leaves.length };
  }, [leaves]);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'pending' && leave.status === 'pending') ||
        (activeTab === 'approved' && leave.status === 'approved') ||
        (activeTab === 'rejected' && leave.status === 'rejected');

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        leave.studentName?.toLowerCase().includes(query) ||
        leave.admissionNumber?.toLowerCase().includes(query) ||
        leave.reason?.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [leaves, activeTab, search]);

  const handleStartReview = (leave: LeaveRequest, status: 'approved' | 'rejected') => {
    setReviewingLeaveId(leave.id);
    setReviewStatus(status);
    setReviewRemarks(leave.remarks || '');
    setActionError(null);
  };

  const handleCancelReview = () => {
    setReviewingLeaveId(null);
    setReviewRemarks('');
    setActionError(null);
  };

  const handleSaveReview = async (leaveId: string) => {
    setIsSavingReview(true);
    setActionError(null);
    try {
      await reviewStudentLeaveApi(leaveId, {
        status: reviewStatus,
        remarks: reviewRemarks.trim() || undefined,
      });

      setReviewingLeaveId(null);
      setReviewRemarks('');
      await fetchLeaves();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-0.5">
              <CheckCircle className="h-3.5 w-3.5" /> Approved
            </span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-0.5">
              <XCircle className="h-3.5 w-3.5" /> Rejected
            </span>
          </Badge>
        );
      default:
        return (
          <Badge variant="warning">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-0.5">
              <Clock className="h-3.5 w-3.5" /> Pending
            </span>
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'medical':
        return <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">Medical</span>;
      case 'casual':
        return <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">Casual</span>;
      case 'family':
        return <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">Family</span>;
      default:
        return <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700 border border-neutral-200">Other</span>;
    }
  };

  if (!isOpen || !batch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Leave Requests — ${batch.name}`}
      icon={<CalendarX className="h-5 w-5 text-brand-600" />}
      size="xl"
    >
      <div className="space-y-4">
        {/* Batch Sub-header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 text-sm text-neutral-500">
          <div>
            Course: <span className="font-semibold text-neutral-800">{batch.courseName}</span> • Center:{' '}
            <span className="font-semibold text-neutral-800">{batch.centerName}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200/60">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            Faculty Review
          </span>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 rounded-xl bg-neutral-100/80 p-1.5 border border-neutral-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-white text-neutral-800 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Pending
              {counts.pending > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
                  {counts.pending}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('approved')}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'approved'
                  ? 'bg-white text-neutral-800 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Approved
              <span className="text-xs text-neutral-400">({counts.approved})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'rejected'
                  ? 'bg-white text-neutral-800 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Rejected
              <span className="text-xs text-neutral-400">({counts.rejected})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-white text-neutral-800 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              All
              <span className="text-xs text-neutral-400">({counts.total})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or reason…"
              className="w-full sm:w-64 rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-3.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
              <p className="text-sm text-neutral-400 font-medium">Loading batch leave requests…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-center text-sm text-red-600">
            <p className="font-semibold">{error}</p>
            <button onClick={fetchLeaves} className="mt-1 font-semibold underline cursor-pointer">
              Retry
            </button>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <EmptyState
            title={activeTab === 'pending' ? 'No Pending Leave Requests' : 'No Leave Requests Found'}
            description={
              search
                ? `No requests match "${search}". Try a different keyword.`
                : activeTab === 'pending'
                ? 'All leave requests for this batch have been reviewed.'
                : 'There are no leave records under this category.'
            }
          />
        ) : (
          <div className="space-y-3.5">
            {filteredLeaves.map((leave) => {
              const isReviewingThis = reviewingLeaveId === leave.id;

              return (
                <div
                  key={leave.id}
                  className="rounded-xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all hover:border-neutral-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Student Info & Leave Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-neutral-900 text-base sm:text-lg">
                          {leave.studentName || 'Student'}
                        </span>
                        {leave.admissionNumber && (
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-mono font-semibold text-neutral-600">
                            {leave.admissionNumber}
                          </span>
                        )}
                        {getTypeBadge(leave.type)}
                        {leave.isHalfDay && (
                          <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                            {leave.halfDaySession === 'firstHalf' ? 'Half Day (Morning)' : 'Half Day (Afternoon)'}
                          </span>
                        )}
                        {getStatusBadge(leave.status)}
                      </div>

                      {/* Dates & Duration */}
                      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                        <span className="font-semibold text-neutral-800">
                          {leave.isHalfDay
                            ? `${leave.startDate} (${leave.halfDaySession === 'firstHalf' ? 'Morning Session' : 'Afternoon Session'})`
                            : `${leave.startDate} → ${leave.endDate}`}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-neutral-500">
                          Applied: {new Date(leave.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-neutral-700 bg-neutral-50/80 rounded-xl p-3.5 border border-neutral-200/60 mt-1.5 leading-relaxed">
                        <span className="font-semibold text-neutral-800">Reason:</span> {leave.reason}
                      </p>

                      {/* Teacher Remarks if already reviewed */}
                      {leave.status !== 'pending' && leave.remarks && (
                        <p className="text-sm text-brand-800 bg-brand-50/60 rounded-xl p-3 border border-brand-100/80 mt-1 leading-relaxed">
                          <span className="font-semibold">Review Remark:</span> {leave.remarks}
                          {leave.reviewerName && (
                            <span className="text-neutral-500 ml-1.5 font-normal">({leave.reviewerName})</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Action buttons (for pending leave) */}
                    {leave.status === 'pending' && !isReviewingThis && (
                      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Check className="h-4 w-4 text-emerald-600" />}
                          onClick={() => handleStartReview(leave, 'approved')}
                          className="hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 text-sm py-2 px-3.5 font-semibold"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<X className="h-4 w-4 text-rose-600" />}
                          onClick={() => handleStartReview(leave, 'rejected')}
                          className="hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-sm py-2 px-3.5 font-semibold"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Inline Review Drawer */}
                  {isReviewingThis && (
                    <div className="mt-3.5 border-t border-neutral-200/80 pt-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-brand-600" />
                          Faculty Decision & Remarks
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewStatus('approved')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              reviewStatus === 'approved'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewStatus('rejected')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              reviewStatus === 'rejected'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={reviewRemarks}
                          onChange={(e) => setReviewRemarks(e.target.value)}
                          placeholder="Optional remarks (e.g. Ensure homework is submitted on return)"
                          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {actionError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{actionError}</span>
                        </div>
                      )}

                      <div className="flex justify-end gap-2.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelReview}
                          disabled={isSavingReview}
                          className="text-sm py-2 px-3.5"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant={reviewStatus === 'approved' ? 'primary' : 'danger'}
                          isLoading={isSavingReview}
                          onClick={() => handleSaveReview(leave.id)}
                          className="text-sm py-2 px-4 font-semibold"
                        >
                          Confirm {reviewStatus === 'approved' ? 'Approval' : 'Rejection'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BatchLeavesModal;
