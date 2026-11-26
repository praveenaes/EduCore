import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Receipt,
  RotateCw,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import { getFeesApi, initFeePaymentApi, confirmFeePaymentApi, requestFeeRefundApi } from '../../services/feeService';
import type { FeeAssignment, FeeFilterParams } from '../../types/fee';
import { useRazorpay } from '../../hooks/useRazorpay';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { FeeReceiptModal } from '../../features/fees/components/FeeReceiptModal';
import { Modal } from '../../components/Modal';

export const StudentFeesPage: React.FC = () => {
  const { displayRazorpay } = useRazorpay();
  const [fees, setFees] = useState<FeeAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);
  const [selectedReceiptFee, setSelectedReceiptFee] = useState<FeeAssignment | null>(null);
  const [selectedRefundFee, setSelectedRefundFee] = useState<FeeAssignment | null>(null);
  const [refundReasonInput, setRefundReasonInput] = useState<string>('');
  const [submittingRefund, setSubmittingRefund] = useState<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const limit = 6;

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: FeeFilterParams = {
        page: currentPage,
        limit,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await getFeesApi(params);
      setFees(res.data.data.feeAssignments);
      setTotalPages(res.data.data.totalPages || 1);
      setTotalItems(res.data.data.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch fee assignments.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleStatusChange = (status: 'all' | 'pending' | 'completed' | 'overdue') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleStudentRefundRequest = async () => {
    if (!selectedRefundFee) return;
    if (!refundReasonInput.trim()) {
      setError('Please provide a reason for the refund request.');
      return;
    }
    setSubmittingRefund(true);
    try {
      const res = await requestFeeRefundApi(selectedRefundFee.id, {
        reason: refundReasonInput.trim(),
      });
      setSuccessMessage(res.data.message || 'Refund request submitted successfully!');
      setSelectedRefundFee(null);
      fetchFees();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit refund request.');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const getStatusBadge = (status: string, dueDate: string, refundStatus?: string) => {
    if (status === 'refunded' || refundStatus === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-purple-600 text-white shadow-xs">
          <RotateCcw className="w-3.5 h-3.5 text-white" />
          Refunded
        </span>
      );
    }
    if (refundStatus === 'requested') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-violet-600 text-white shadow-xs">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Refund Requested
        </span>
      );
    }
    const isPastDue = new Date(dueDate) < new Date() && status === 'pending';
    const displayStatus = isPastDue ? 'overdue' : status;

    switch (displayStatus) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-rose-600 text-white shadow-xs">
            <AlertCircle className="w-3.5 h-3.5 text-white" />
            Overdue
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-amber-500 text-white shadow-xs">
            <Clock className="w-3.5 h-3.5 text-white" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-neutral-700 text-white shadow-xs">
            {displayStatus}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePayNow = async (fee: FeeAssignment) => {
    if (payingFeeId) return;
    setPayingFeeId(fee.id);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await initFeePaymentApi(fee.id);
      const paymentData = res.data.data;

      await displayRazorpay(
        {
          keyId: paymentData.keyId,
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          title: fee.title,
          payerName: paymentData.payerName,
          payerEmail: paymentData.payerEmail,
          payerPhone: paymentData.payerPhone,
        },
        async (razorpayResponse) => {
          try {
            setPayingFeeId(fee.id);
            await confirmFeePaymentApi(fee.id, {
              transactionId: paymentData.transactionId,
              gatewayOrderId: razorpayResponse.razorpay_order_id,
              gatewayTransactionId: razorpayResponse.razorpay_payment_id,
              gatewaySignature: razorpayResponse.razorpay_signature,
            });
            setSuccessMessage(`Payment for "${fee.title}" completed successfully!`);
            await fetchFees();
          } catch (confirmErr: any) {
            setError(
              confirmErr?.response?.data?.message ||
                'Payment verification failed. Please contact support.'
            );
          } finally {
            setPayingFeeId(null);
          }
        },
        (paymentError) => {
          if (paymentError?.message) {
            setError(paymentError.message);
          }
        }
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setPayingFeeId(null);
    }
  };

  const pendingCount = fees.filter((f) => f.status === 'pending').length;
  const completedCount = fees.filter((f) => f.status === 'completed').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800">My Fee Dues</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Review your fee assignments, upcoming deadlines, and payment statuses.
          </p>
        </div>
        <button
          onClick={fetchFees}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 border-l-4 border-l-brand-600 shadow-xs flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Records</p>
            <p className="mt-1 text-2xl font-bold text-neutral-800">{totalItems}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-brand-600 shadow-xs">
            <Receipt className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 border-l-4 border-l-amber-500 shadow-xs flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Pending Dues</p>
            <p className="mt-1 text-2xl font-bold text-neutral-800">{pendingCount}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600 shadow-xs">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 border-l-4 border-l-emerald-500 shadow-xs flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Settled & Paid</p>
            <p className="mt-1 text-2xl font-bold text-neutral-800">{completedCount}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        {(['all', 'pending', 'completed', 'overdue'] as const).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
              statusFilter === status
                ? status === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : status === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : status === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-rose-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800 text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-neutral-200 animate-pulse space-y-3"
            >
              <div className="h-5 bg-neutral-100 rounded w-2/3" />
              <div className="h-8 bg-neutral-100 rounded w-1/3" />
              <div className="h-4 bg-neutral-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : fees.length === 0 ? (
        <EmptyState
          title="No fee records"
          description={
            statusFilter === 'all'
              ? 'You do not have any fee dues assigned currently.'
              : `No fee records found with status '${statusFilter}'.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fees.map((fee) => {
            const isPending = fee.status === 'pending';
            return (
              <div
                key={fee.id}
                className="bg-white rounded-xl border border-neutral-200/90 hover:border-neutral-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-neutral-800 text-base leading-snug">
                      {fee.title}
                    </h3>
                    {getStatusBadge(fee.status, fee.dueDate, fee.refundStatus)}
                  </div>

                  <div className="mt-4">
                    <span className="text-2xl font-bold text-neutral-900">
                      {formatCurrency(fee.amount)}
                    </span>
                  </div>

                  <div className="mt-4 bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-200/60 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span>Due Date: {formatDate(fee.dueDate)}</span>
                    </div>
                    {fee.remarks && (
                      <p className="text-neutral-500 italic pt-1 border-t border-neutral-200/60 line-clamp-2">
                        {fee.remarks}
                      </p>
                    )}
                    {fee.refundStatus === 'requested' && fee.refundReason && (
                      <div className="pt-2 border-t border-violet-200 text-violet-900">
                        <span className="font-semibold block text-[11px] uppercase tracking-wider text-violet-700">Refund Reason</span>
                        <p className="italic mt-0.5 text-xs text-violet-800">"{fee.refundReason}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  {isPending ? (
                    <button
                      disabled={payingFeeId !== null}
                      onClick={() => handlePayNow(fee)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>{payingFeeId === fee.id ? 'Processing...' : 'Pay Now'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {fee.status === 'refunded' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                            Refunded
                          </span>
                        ) : fee.refundStatus === 'requested' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
                            <Clock className="w-3.5 h-3.5 text-violet-600" />
                            Refund Under Review
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Paid</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {fee.status === 'completed' && fee.refundStatus !== 'requested' && fee.refundStatus !== 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedRefundFee(fee);
                              setRefundReasonInput('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-white" />
                            Request Refund
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReceiptFee(fee)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-white" />
                          Receipt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <FeeReceiptModal
        isOpen={selectedReceiptFee !== null}
        onClose={() => setSelectedReceiptFee(null)}
        fee={selectedReceiptFee}
      />

      {selectedRefundFee && (
        <Modal
          isOpen={!!selectedRefundFee}
          onClose={() => !submittingRefund && setSelectedRefundFee(null)}
          title="Request Fee Refund"
          icon={<RotateCcw className="w-5 h-5 text-neutral-700" />}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRefundFee(null)}
                disabled={submittingRefund}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStudentRefundRequest}
                isLoading={submittingRefund}
              >
                Submit Request
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Please provide the reason for your refund request. The administration will review your request and process eligible refunds directly to your original payment method.
            </p>

            <div className="bg-neutral-50 rounded-xl p-3 text-xs space-y-1.5 border border-neutral-200/60">
              <div className="flex justify-between">
                <span className="text-neutral-500">Fee Title:</span>
                <span className="font-semibold text-neutral-800">{selectedRefundFee.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Paid Amount:</span>
                <span className="font-bold text-neutral-900">{formatCurrency(selectedRefundFee.amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <textarea
                value={refundReasonInput}
                onChange={(e) => setRefundReasonInput(e.target.value)}
                placeholder="Please describe why you are requesting a refund (e.g. accidental double payment, course withdrawal)..."
                rows={3}
                className="w-full text-xs rounded-xl border border-neutral-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentFeesPage;
