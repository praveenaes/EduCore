import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  CreditCard,
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  X,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { usePagination } from '../../hooks/usePagination';
import { getFeesApi, getPaymentLedgerApi, refundFeePaymentApi, rejectFeeRefundApi } from '../../services/feeService';
import type {
  FeeAssignment,
  PaymentTransaction,
  PaymentLedgerStats,
} from '../../types/fee';
import FeeAssignmentModal from '../../features/fees/components/FeeAssignmentModal';

const PAGE_LIMIT = 10;

const FeesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'ledger'>('assignments');

  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>([]);
  const pagination = usePagination({ initialLimit: PAGE_LIMIT });
  const { page, limit, resetPage, setPaginationData, totalPages, setPage } = pagination;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [ledgerStats, setLedgerStats] = useState<PaymentLedgerStats>({
    totalCollections: 0,
    totalAttempts: 0,
    successfulPayments: 0,
    failedPayments: 0,
    successRate: 0,
  });
  const ledgerPagination = usePagination({ initialLimit: PAGE_LIMIT });
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [debouncedLedgerSearch, setDebouncedLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');
  const [ledgerMethodFilter, setLedgerMethodFilter] = useState<string>('all');
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const [refundModal, setRefundModal] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const [rejectModal, setRejectModal] = useState<PaymentTransaction | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLedgerSearch(ledgerSearch);
      ledgerPagination.resetPage();
    }, 350);
    return () => clearTimeout(timer);
  }, [ledgerSearch, ledgerPagination.resetPage]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    resetPage();
  };

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getFeesApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder,
      });
      setFeeAssignments(res.data.data.feeAssignments);
      setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load fee assignments.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, sortBy, sortOrder, setPaginationData]);

  const fetchLedger = useCallback(async () => {
    setIsLedgerLoading(true);
    setLedgerError(null);
    try {
      const res = await getPaymentLedgerApi({
        page: ledgerPagination.page,
        limit: ledgerPagination.limit,
        search: debouncedLedgerSearch || undefined,
        status: ledgerStatusFilter !== 'all' ? ledgerStatusFilter : undefined,
        paymentMethod: ledgerMethodFilter !== 'all' ? ledgerMethodFilter : undefined,
      });
      setTransactions(res.data.data.transactions);
      setLedgerStats(res.data.data.stats);
      ledgerPagination.setPaginationData(res.data.data.total, res.data.data.totalPages);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load payment ledger.';
      setLedgerError(errorMsg);
    } finally {
      setIsLedgerLoading(false);
    }
  }, [
    ledgerPagination.page,
    ledgerPagination.limit,
    debouncedLedgerSearch,
    ledgerStatusFilter,
    ledgerMethodFilter,
    ledgerPagination.setPaginationData,
  ]);

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchFees();
    } else {
      fetchLedger();
    }
  }, [activeTab, fetchFees, fetchLedger]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSuccess = () => {
    setToast({ message: 'Fees assigned successfully!', type: 'success' });
    fetchFees();
  };

  const handleRefundSubmit = async () => {
    if (!refundModal) return;
    setIsRefunding(true);
    try {
      await refundFeePaymentApi(refundModal.id, {
        reason: refundReason.trim() || undefined,
      });
      setToast({ message: 'Refund processed successfully via Razorpay!', type: 'success' });
      setRefundModal(null);
      fetchLedger();
      fetchFees();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to process refund.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsRefunding(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    setIsRejecting(true);
    try {
      await rejectFeeRefundApi(rejectModal.id, {
        remarks: rejectRemarks.trim() || undefined,
      });
      setToast({ message: 'Refund request rejected.', type: 'success' });
      setRejectModal(null);
      fetchLedger();
      fetchFees();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to reject refund.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = (status: string, refundStatus?: string) => {
    if (refundStatus === 'requested') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
          Refund Requested
        </span>
      );
    }
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
            Completed
          </span>
        );
      case 'overdue':
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            {status}
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            Pending
          </span>
        );
    }
  };

  const assignmentColumns: TableColumn<FeeAssignment>[] = [
    {
      header: 'Student',
      accessor: (item) => (
        <div>
          <p className="font-semibold text-neutral-800">
            {item.studentName || '—'}
          </p>
          <p className="text-xs text-neutral-500">
            {item.admissionNumber ? `(${item.admissionNumber})` : ''} {item.batchName ? `• ${item.batchName}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Fee Title',
      sortField: 'title',
      accessor: (item) => (
        <span className="font-medium text-neutral-700">{item.title}</span>
      ),
    },
    {
      header: 'Amount',
      sortField: 'amount',
      accessor: (item) => (
        <span className="font-semibold text-neutral-900">
          ₹{Number(item.amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Due Date',
      sortField: 'dueDate',
      accessor: (item) => (
        <span className="text-xs text-neutral-600">
          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => getStatusBadge(item.status, item.refundStatus),
    },
    {
      header: 'Remarks',
      accessor: (item) => (
        <span className="text-xs text-neutral-500 line-clamp-1 max-w-xs">
          {item.remarks || '—'}
        </span>
      ),
    },
  ];

  const ledgerColumns: TableColumn<PaymentTransaction>[] = [
    {
      header: 'Student',
      accessor: (item) => (
        <div>
          <p className="font-semibold text-neutral-800">{item.studentName || '—'}</p>
          <p className="text-xs text-neutral-500">{item.admissionNumber || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Fee Item & Amount',
      accessor: (item) => (
        <div>
          <p className="font-medium text-neutral-800">{item.feeTitle || 'Fee Payment'}</p>
          <p className="text-xs font-semibold text-emerald-700">
            ₹{Number(item.amount).toLocaleString('en-IN')}
          </p>
        </div>
      ),
    },
    {
      header: 'Payment Mode',
      accessor: (item) => (
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase bg-neutral-100 text-neutral-700">
            {item.paymentMethod || 'Online'}
          </span>
          {item.bank && (
            <p className="text-xs text-neutral-500 mt-0.5">Bank: {item.bank}</p>
          )}
          {item.vpa && (
            <p className="text-xs text-neutral-500 mt-0.5">VPA: {item.vpa}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Gateway Ref / RRN',
      accessor: (item) => (
        <div className="text-xs font-mono text-neutral-600">
          {item.gatewayRrn ? (
            <span className="text-indigo-600 font-semibold">RRN: {item.gatewayRrn}</span>
          ) : (
            <span>Txn: {item.gatewayTransactionId || item.transactionId}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Date & Time',
      accessor: (item) => (
        <span className="text-xs text-neutral-600">
          {item.paidAt ? new Date(item.paidAt).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => (
        <div>
          {getStatusBadge(item.status, item.refundStatus)}
          {item.refundReason && (
            <p className="text-[11px] text-neutral-500 mt-1 max-w-xs truncate" title={item.refundReason}>
              Reason: {item.refundReason}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <div className="flex items-center gap-1.5">
          {item.refundStatus === 'requested' ? (
            <>
              <button
                onClick={() => {
                  setRefundModal(item);
                  setRefundReason(item.refundReason || '');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => {
                  setRejectModal(item);
                  setRejectRemarks('');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          ) : item.status.toLowerCase() === 'completed' ? (
            <button
              onClick={() => {
                setRefundModal(item);
                setRefundReason('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refund
            </button>
          ) : (
            <span className="text-xs text-neutral-400">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-800">Fee Management</h1>
            <p className="text-xs text-neutral-500">
              Manage student fee assignments, track transactions, and audit gateway collections.
            </p>
          </div>
          {activeTab === 'assignments' && (
            <div>
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowModal(true)}
              >
                Assign Fees
              </Button>
            </div>
          )}
        </div>

        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'assignments'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Fee Assignments
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payment Ledger & Audit
          </button>
        </div>

        {activeTab === 'assignments' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBox
                  value={search}
                  onChange={(v) => setSearch(v)}
                  placeholder="Search by fee title…"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg text-xs font-medium">
                {(['all', 'pending', 'completed', 'overdue'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      resetPage();
                    }}
                    className={`px-3 py-1.5 rounded-md capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-neutral-800 shadow-sm font-semibold'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <ErrorState message={error} onRetry={fetchFees} />
            ) : feeAssignments.length === 0 && !isLoading ? (
              <EmptyState
                title="No Fee Assignments Found"
                description={
                  debouncedSearch || statusFilter !== 'all'
                    ? 'No fee assignments match your current search or filter criteria.'
                    : 'Get started by assigning your first batch or student fee.'
                }
                action={
                  !debouncedSearch && statusFilter === 'all' && (
                    <Button
                      size="sm"
                      leftIcon={<CreditCard className="h-4 w-4" />}
                      onClick={() => setShowModal(true)}
                    >
                      Assign First Fee
                    </Button>
                  )
                }
              />
            ) : (
              <Table
                columns={assignmentColumns}
                data={feeAssignments}
                keyExtractor={(f) => f.id}
                isLoading={isLoading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            )}
          </>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Total Collections</p>
                  <p className="text-lg font-bold text-neutral-900">
                    ₹{ledgerStats.totalCollections.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Success Rate</p>
                  <p className="text-lg font-bold text-neutral-900">
                    {ledgerStats.successRate}%
                  </p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Successful Payments</p>
                  <p className="text-lg font-bold text-neutral-900">
                    {ledgerStats.successfulPayments}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Failed Attempts</p>
                  <p className="text-lg font-bold text-neutral-900">
                    {ledgerStats.failedPayments}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBox
                  value={ledgerSearch}
                  onChange={(v) => setLedgerSearch(v)}
                  placeholder="Search by student, admission no, or RRN…"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={ledgerMethodFilter}
                  onChange={(e) => {
                    setLedgerMethodFilter(e.target.value);
                    ledgerPagination.resetPage();
                  }}
                  className="text-xs bg-neutral-100 border-none rounded-lg px-3 py-2 text-neutral-700 font-medium cursor-pointer"
                >
                  <option value="all">All Methods</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Netbanking</option>
                </select>

                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-medium">
                  {(['all', 'completed', 'failed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setLedgerStatusFilter(st);
                        ledgerPagination.resetPage();
                      }}
                      className={`px-3 py-1 rounded-md capitalize transition-all cursor-pointer ${
                        ledgerStatusFilter === st
                          ? 'bg-white text-neutral-800 shadow-sm font-semibold'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {ledgerError ? (
              <ErrorState message={ledgerError} onRetry={fetchLedger} />
            ) : transactions.length === 0 && !isLedgerLoading ? (
              <EmptyState
                title="No Transactions Found"
                description={
                  debouncedLedgerSearch || ledgerStatusFilter !== 'all' || ledgerMethodFilter !== 'all'
                    ? 'No transaction records match the selected filter criteria.'
                    : 'Payment attempts and completed transactions will appear here in real-time.'
                }
              />
            ) : (
              <Table
                columns={ledgerColumns}
                data={transactions}
                keyExtractor={(tx) => tx.id}
                isLoading={isLedgerLoading}
              />
            )}
          </div>
        )}
      </div>

      {activeTab === 'assignments' && feeAssignments.length > 0 && !isLoading && (
        <div className="mt-auto pt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {activeTab === 'ledger' && transactions.length > 0 && !isLedgerLoading && (
        <div className="mt-auto pt-6">
          <Pagination
            currentPage={ledgerPagination.page}
            totalPages={ledgerPagination.totalPages}
            onPageChange={ledgerPagination.setPage}
          />
        </div>
      )}

      {showModal && (
        <FeeAssignmentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {refundModal && (
        <Modal
          isOpen={!!refundModal}
          onClose={() => !isRefunding && setRefundModal(null)}
          title="Refund Fee Payment"
          icon={<RotateCcw className="w-5 h-5 text-red-600" />}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefundModal(null)}
                disabled={isRefunding}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRefundSubmit}
                isLoading={isRefunding}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                {isRefunding ? 'Processing Refund...' : 'Confirm Refund'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <div className="bg-red-50/60 border border-red-200/60 rounded-xl p-4 text-xs text-red-800 space-y-1">
              <p className="font-semibold text-sm text-red-900">Are you sure you want to refund this payment?</p>
              <p>
                This will trigger a refund through Razorpay directly back to the student's original payment source (UPI / Card / Bank).
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-3.5 space-y-2 text-xs border border-neutral-200/60">
              <div className="flex justify-between">
                <span className="text-neutral-500">Student:</span>
                <span className="font-medium text-neutral-800">
                  {refundModal.studentName || '—'} ({refundModal.admissionNumber || '—'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fee Item:</span>
                <span className="font-medium text-neutral-800">{refundModal.feeTitle || 'Fee Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount to Refund:</span>
                <span className="font-bold text-red-600 text-sm">
                  ₹{Number(refundModal.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Gateway Ref:</span>
                <span className="font-mono text-neutral-700">{refundModal.gatewayTransactionId || refundModal.transactionId}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Reason for Refund (Optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Student requested batch cancellation, accidental double payment..."
                rows={3}
                className="w-full text-xs rounded-xl border border-neutral-300 p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>
        </Modal>
      )}

      {rejectModal && (
        <Modal
          isOpen={!!rejectModal}
          onClose={() => !isRejecting && setRejectModal(null)}
          title="Reject Refund Request"
          icon={<X className="w-5 h-5 text-red-600" />}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModal(null)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRejectSubmit}
                isLoading={isRejecting}
                leftIcon={<X className="w-4 h-4" />}
              >
                {isRejecting ? 'Rejecting...' : 'Reject Refund'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <div className="bg-neutral-50 rounded-xl p-3.5 space-y-2 text-xs border border-neutral-200/60">
              <div className="flex justify-between">
                <span className="text-neutral-500">Student:</span>
                <span className="font-medium text-neutral-800">
                  {rejectModal.studentName || '—'} ({rejectModal.admissionNumber || '—'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fee Item:</span>
                <span className="font-medium text-neutral-800">{rejectModal.feeTitle || 'Fee Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount:</span>
                <span className="font-bold text-neutral-900">
                  ₹{Number(rejectModal.amount).toLocaleString('en-IN')}
                </span>
              </div>
              {rejectModal.refundReason && (
                <div className="pt-2 border-t border-neutral-200/60">
                  <span className="text-neutral-500 block mb-1">Student's Request Reason:</span>
                  <p className="p-2 rounded bg-white border border-neutral-200 text-neutral-700 italic">
                    "{rejectModal.refundReason}"
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Rejection Remarks (Optional)
              </label>
              <textarea
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="e.g. Request does not meet refund policy criteria..."
                rows={3}
                className="w-full text-xs rounded-xl border border-neutral-300 p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FeesPage;
