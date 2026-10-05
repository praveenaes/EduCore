import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  CalendarX,
  FileText,
  MessageSquare,
  ArrowRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { getStudentAttendanceApi } from '../../services/attendanceService';
import { getStudentLeavesApi } from '../../services/leaveService';
import type {
  StudentAttendanceRecord,
  DayAttendanceStatus,
} from '../../types/attendance';
import type { LeaveRequest } from '../../types/leave';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { ApplyLeaveModal } from '../../features/attendance/components/ApplyLeaveModal';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const StudentAttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'leaves'>('calendar');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [leaveViewMode, setLeaveViewMode] = useState<'cards' | 'table'>('cards');

  const today = new Date();
  const [displayedDate, setDisplayedDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayRecord, setSelectedDayRecord] = useState<{
    dateStr: string;
    record?: StudentAttendanceRecord;
    status: DayAttendanceStatus;
  } | null>(null);

  const currentMonth = displayedDate.getMonth() + 1; // 1-12
  const currentYear = displayedDate.getFullYear();

  const fetchMonthlyAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentAttendanceApi({
        month: currentMonth,
        year: currentYear,
      });
      setRecords(res.data.data.records || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load attendance records.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [fetchMonthlyAttendance]);

 //leave 
  const fetchLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    setLeaveError(null);
    try {
      const res = await getStudentLeavesApi();
      setLeaves(res.data.data.leaves || []);
    } catch (err: any) {
      setLeaveError(
        err.response?.data?.message || 'Failed to load leave records.'
      );
    } finally {
      setLoadingLeaves(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handlePrevMonth = () => {
    setDisplayedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayRecord(null);
  };

  const handleNextMonth = () => {
    setDisplayedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayRecord(null);
  };

  const handleJumpToToday = () => {
    setDisplayedDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDayRecord(null);
  };

  const getAttendanceForDate = useCallback(
    (dateStr: string): { status: DayAttendanceStatus; record?: StudentAttendanceRecord } => {
      const match = records.find((r) => r.date === dateStr || r.date?.startsWith(dateStr));
      if (!match) return { status: 'none' };
      if (match.firstHalf === 'present' && match.secondHalf === 'present') {
        return { status: 'present', record: match };
      }
      if (match.firstHalf === 'absent' && match.secondHalf === 'absent') {
        return { status: 'absent', record: match };
      }
      return { status: 'partial', record: match };
    },
    [records]
  );

  const { daysInMonth, startPadding } = useMemo(() => {
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Date[] = [];
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return {
      daysInMonth: days,
      startPadding: firstDayIndex,
    };
  }, [displayedDate]);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let partial = 0;

    for (const r of records) {
      if (r.firstHalf === 'present' && r.secondHalf === 'present') present++;
      else if (r.firstHalf === 'absent' && r.secondHalf === 'absent') absent++;
      else partial++;
    }

    const total = records.length;
    const percentage = total > 0 ? Math.round(((present + partial * 0.5) / total) * 100) : 0;

    return { total, present, absent, partial, percentage };
  }, [records]);

  const monthName = displayedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const filteredLeaves = useMemo(() => {
    if (leaveFilter === 'all') return leaves;
    return leaves.filter((l) => l.status === leaveFilter);
  }, [leaves, leaveFilter]);

  const formatDateDisplay = (dateStr?: string | Date | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  const calculateDays = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, isNaN(diff) ? 1 : diff);
    } catch {
      return 1;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medical':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Medical / Sick
          </span>
        );
      case 'casual':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Casual Leave
          </span>
        );
      case 'family':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Family Event / Emergency
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 border border-neutral-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800">
              {activeTab === 'calendar' ? 'Attendance Calendar' : 'Leave Applications'}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200/80">
              <Sparkles className="h-3 w-3 text-brand-500" />
              Student Portal
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {activeTab === 'calendar'
              ? 'View your daily roll call, monthly attendance percentage, and session remarks.'
              : 'Track your submitted leave requests and check whether leave is granted by your faculty.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {activeTab === 'calendar' && (
            <button
              type="button"
              onClick={handleJumpToToday}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 border border-neutral-200/90 shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-brand-600" />
              Jump to Current Month
            </button>
          )}
{/* leave apply button */}
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply for Leave
          </Button>
        </div>
      </div>

 {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-neutral-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <CalendarIcon className="h-4 w-4" />
          Attendance Calendar
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('leaves');
            fetchLeaves();
          }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'leaves'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <CalendarX className="h-4 w-4" />
          Leave Applications
          {leaves.length > 0 && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 font-medium">
              {leaves.length}
            </span>
          )}
        </button>
      </div>
{/* leave  */}
      {activeTab === 'leaves' ? (
        <div className="space-y-6">
          {/* Leaves Summary Stat Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="group rounded-2xl border border-neutral-200/80 bg-white p-4.5 shadow-2xs hover:border-neutral-300 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Total Applied
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-neutral-800">{leaves.length}</p>
              <p className="mt-0.5 text-xs text-neutral-400">All student submissions</p>
            </div>

            <div className="group rounded-2xl border border-amber-300/90 bg-linear-to-b from-amber-100/80 via-amber-50/50 to-white p-4.5 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Pending Review
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200/80 text-amber-800 shadow-2xs">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-amber-800">
                {leaves.filter((l) => l.status === 'pending').length}
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80 font-medium">Awaiting faculty action</p>
            </div>

            <div className="group rounded-2xl border border-emerald-300/90 bg-linear-to-b from-emerald-100/80 via-emerald-50/50 to-white p-4.5 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Approved
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-200/80 text-emerald-800 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-emerald-800">
                {leaves.filter((l) => l.status === 'approved').length}
              </p>
              <p className="mt-0.5 text-xs text-emerald-700/80 font-medium">Granted requests</p>
            </div>

            <div className="group rounded-2xl border border-rose-300/90 bg-linear-to-b from-rose-100/80 via-rose-50/50 to-white p-4.5 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Rejected
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-200/80 text-rose-800 shadow-2xs">
                  <XCircle className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-rose-800">
                {leaves.filter((l) => l.status === 'rejected').length}
              </p>
              <p className="mt-0.5 text-xs text-rose-700/80 font-medium">Declined requests</p>
            </div>
          </div>

          {/* Filter Bar & View Toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
            <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 w-fit">
              {(
                [
                  { id: 'all', label: 'All', count: leaves.length },
                  {
                    id: 'pending',
                    label: 'Pending',
                    count: leaves.filter((l) => l.status === 'pending').length,
                  },
                  {
                    id: 'approved',
                    label: 'Approved',
                    count: leaves.filter((l) => l.status === 'approved').length,
                  },
                  {
                    id: 'rejected',
                    label: 'Rejected',
                    count: leaves.filter((l) => l.status === 'rejected').length,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLeaveFilter(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    leaveFilter === tab.id
                      ? tab.id === 'pending'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                        : tab.id === 'approved'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                        : tab.id === 'rejected'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs'
                        : 'bg-white text-neutral-800 shadow-2xs border border-neutral-200'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      leaveFilter === tab.id
                        ? tab.id === 'pending'
                          ? 'bg-amber-200/90 text-amber-900 font-bold'
                          : tab.id === 'approved'
                          ? 'bg-emerald-200/90 text-emerald-900 font-bold'
                          : tab.id === 'rejected'
                          ? 'bg-rose-200/90 text-rose-900 font-bold'
                          : 'bg-neutral-100 text-neutral-700 font-bold'
                        : 'bg-neutral-200/60 text-neutral-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-neutral-100 p-1 border border-neutral-200/80">
                <button
                  type="button"
                  title="Grid View"
                  onClick={() => setLeaveViewMode('cards')}
                  className={`rounded-lg p-1.5 text-xs transition cursor-pointer ${
                    leaveViewMode === 'cards'
                      ? 'bg-white text-brand-600 shadow-2xs'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Table View"
                  onClick={() => setLeaveViewMode('table')}
                  className={`rounded-lg p-1.5 text-xs transition cursor-pointer ${
                    leaveViewMode === 'table'
                      ? 'bg-white text-brand-600 shadow-2xs'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Leaves List */}
          {leaveError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
              <p className="font-semibold">{leaveError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchLeaves}
              >
                Try Again
              </Button>
            </div>
          ) : loadingLeaves ? (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
                <p className="text-xs font-medium text-neutral-400">Loading your leave requests…</p>
              </div>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <EmptyState
              title={leaveFilter === 'all' ? 'No Leave Applications Yet' : `No ${leaveFilter} leaves found`}
              description={
                leaveFilter === 'all'
                  ? 'You have not submitted any leave applications. Click "Apply for Leave" to request time off.'
                  : `You currently have no leave requests with status "${leaveFilter}".`
              }
              action={
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsApplyModalOpen(true)}>
                  Apply for Leave
                </Button>
              }
            />
          ) : leaveViewMode === 'cards' ? (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeaves.map((leave) => {
                const days = calculateDays(leave.startDate, leave.endDate);
                const cardColorStyle =
                  leave.status === 'approved'
                    ? 'border-emerald-300/80 bg-linear-to-br from-emerald-50/70 via-white to-emerald-50/30 hover:border-emerald-400'
                    : leave.status === 'pending'
                    ? 'border-amber-300/80 bg-linear-to-br from-amber-50/70 via-white to-amber-50/30 hover:border-amber-400'
                    : 'border-rose-300/80 bg-linear-to-br from-rose-50/70 via-white to-rose-50/30 hover:border-rose-400';

                const dateBannerStyle =
                  leave.status === 'approved'
                    ? 'bg-emerald-100/60 border-emerald-200 text-emerald-950'
                    : leave.status === 'pending'
                    ? 'bg-amber-100/60 border-amber-200 text-amber-950'
                    : 'bg-rose-100/60 border-rose-200 text-rose-950';

                const daysBadgeStyle =
                  leave.status === 'approved'
                    ? 'bg-emerald-200/90 text-emerald-900 border border-emerald-300/80'
                    : leave.status === 'pending'
                    ? 'bg-amber-200/90 text-amber-900 border border-amber-300/80'
                    : 'bg-rose-200/90 text-rose-900 border border-rose-300/80';

                return (
                  <div
                    key={leave.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 shadow-2xs hover:shadow-xs transition space-y-4 ${cardColorStyle}`}
                  >
                    <div className="space-y-3.5">
                      {/* Top: Leave Category & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        {getLeaveTypeBadge(leave.type)}
                        <div>
                          {leave.status === 'approved' && (
                            <Badge variant="success">Approved</Badge>
                          )}
                          {leave.status === 'pending' && (
                            <Badge variant="warning">Pending Review</Badge>
                          )}
                          {leave.status === 'rejected' && (
                            <Badge variant="danger">Rejected</Badge>
                          )}
                        </div>
                      </div>

                      {/* Date Highlight Box */}
                      <div className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs ${dateBannerStyle}`}>
                        <div className="flex items-center gap-2 font-semibold">
                          <CalendarIcon className="h-4 w-4 shrink-0 opacity-80" />
                          <span>{formatDateDisplay(leave.startDate)}</span>
                          <ArrowRight className="h-3 w-3 opacity-60 shrink-0" />
                          <span>{formatDateDisplay(leave.endDate)}</span>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${daysBadgeStyle}`}>
                          {days} {days === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>

                      {/* Reason Description */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                          Reason
                        </p>
                        <p className="text-xs text-neutral-700 bg-neutral-50/60 rounded-xl p-3 border border-neutral-100 leading-relaxed">
                          {leave.reason}
                        </p>
                      </div>

                      {/* Teacher Feedback / Remarks */}
                      {leave.remarks && (
                        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                            <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                            <span>Faculty Remarks</span>
                          </div>
                          <p className="text-neutral-700 italic">“{leave.remarks}”</p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-400">
                      <span>Applied on {formatDateDisplay(leave.appliedAt)}</span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        #{leave.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-neutral-200/80 bg-neutral-50/70 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Dates</th>
                      <th className="px-4 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Reason</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Teacher Note</th>
                      <th className="px-4 py-3.5">Applied On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {filteredLeaves.map((leave) => {
                      const days = calculateDays(leave.startDate, leave.endDate);

                      return (
                        <tr key={leave.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="font-semibold text-neutral-800">
                              {formatDateDisplay(leave.startDate)} → {formatDateDisplay(leave.endDate)}
                            </div>
                            <span className="text-xs text-neutral-400 font-medium">
                              {days} day{days !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getLeaveTypeBadge(leave.type)}
                          </td>
                          <td className="px-5 py-4 max-w-xs truncate text-neutral-600">
                            {leave.reason}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {leave.status === 'approved' && (
                              <Badge variant="success">Approved</Badge>
                            )}
                            {leave.status === 'pending' && (
                              <Badge variant="warning">Pending Review</Badge>
                            )}
                            {leave.status === 'rejected' && (
                              <Badge variant="danger">Rejected</Badge>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-neutral-500 max-w-xs">
                            {leave.remarks ? (
                              <span className="text-neutral-700 italic">“{leave.remarks}”</span>
                            ) : (
                              <span className="text-neutral-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-neutral-400">
                            {formatDateDisplay(leave.appliedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
{/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-neutral-500">Recorded Days</p>
          <p className="mt-1 text-2xl font-extrabold text-neutral-800">{stats.total}</p>
          <span className="text-[11px] text-neutral-400">Total sessions</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <p className="text-xs font-semibold">Full Present</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-emerald-700">{stats.present}</p>
          <span className="text-[11px] text-emerald-600">Both halves present</span>
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-neutral-900 text-white p-4 shadow-2xs">
          <div className="flex items-center gap-1 text-neutral-300">
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            <p className="text-xs font-semibold">Full Absent</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-white">{stats.absent}</p>
          <span className="text-[11px] text-neutral-400">Both halves absent</span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-2xs">
          <div className="flex items-center gap-1 text-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <p className="text-xs font-semibold">Half Day</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-amber-800">{stats.partial}</p>
          <span className="text-[11px] text-amber-600">One half attended</span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-brand-200/80 bg-brand-50/50 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-brand-800">Attendance Rate</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-700">
            {stats.percentage}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-200">
            <div
              className="h-full bg-brand-600 transition-all duration-300 rounded-full"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

{/* Main Calendar Card */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-2xs">
        {/* Month Navigation Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-brand-600" />
            <span className="text-base font-bold text-neutral-800">{monthName}</span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

 {/* Loading Spinner */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="text-xs font-medium text-neutral-400">Loading attendance…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-6 text-center text-red-600">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchMonthlyAttendance}
              className="mt-2 text-xs font-semibold text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
   {/* Weekday Labels */}
            <div className="mb-2 grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold uppercase tracking-wider text-neutral-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2 place-items-stretch">
              {Array(startPadding)
                .fill(null)
                .map((_, idx) => (
                  <div key={`padding-${idx}`} className="h-14 sm:h-16 rounded-xl bg-neutral-50/40" />
                ))}

              {daysInMonth.map((day) => {
                const year = day.getFullYear();
                const month = String(day.getMonth() + 1).padStart(2, '0');
                const dateNum = String(day.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${dateNum}`;

                const { status, record } = getAttendanceForDate(dateStr);
                const isCurrentCalendarDay = day.toDateString() === today.toDateString();

                let bgStyle = 'bg-neutral-100 text-neutral-400 border border-neutral-200/60';
                if (status === 'present') {
                  bgStyle = 'bg-emerald-500 text-white font-bold shadow-xs hover:bg-emerald-600';
                } else if (status === 'absent') {
                  bgStyle = 'bg-neutral-800 text-white font-bold shadow-xs hover:bg-neutral-900';
                } else if (status === 'partial') {
                  bgStyle = 'bg-amber-400 text-white font-bold shadow-xs hover:bg-amber-500';
                }

                const ringStyle = isCurrentCalendarDay
                  ? 'ring-2 ring-brand-500 ring-offset-2'
                  : '';

                const isSelected = selectedDayRecord?.dateStr === dateStr;
                const selectedStyle = isSelected ? 'scale-105 shadow-md' : '';

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDayRecord({ dateStr, record, status })}
                    className={`group relative flex flex-col items-center justify-center h-14 sm:h-16 rounded-xl transition-all cursor-pointer ${bgStyle} ${ringStyle} ${selectedStyle}`}
                  >
                    <span className="text-sm sm:text-base">{day.getDate()}</span>
                    {status !== 'none' && (
                      <span className="text-[10px] opacity-90 capitalize font-medium">
                        {status === 'partial' ? 'Half Day' : status}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

   {/* Selected Date Detail Drawer */}
            {selectedDayRecord && (
              <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 p-4 border border-neutral-200/80">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Selected Day:{' '}
                    <span className="font-bold text-neutral-800">
                      {selectedDayRecord.dateStr}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                    <span>
                      Morning:{' '}
                      <strong className="capitalize text-neutral-800">
                        {selectedDayRecord.record?.firstHalf ?? 'No session'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Afternoon:{' '}
                      <strong className="capitalize text-neutral-800">
                        {selectedDayRecord.record?.secondHalf ?? 'No session'}
                      </strong>
                    </span>
                    {selectedDayRecord.record?.remarks && (
                      <>
                        <span>•</span>
                        <span className="italic text-neutral-500">
                          Remarks: "{selectedDayRecord.record.remarks}"
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDayRecord(null)}
                  className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

  {/* Bottom Color Legend  */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-4 text-xs font-medium text-neutral-600">
              <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[11px]">
                Legend:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-emerald-500 shrink-0" />
                <span>Present (Full Day)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-neutral-800 shrink-0" />
                <span>Absent (Full Day)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-amber-400 shrink-0" />
                <span>Partial (Half Day)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-neutral-100 border border-neutral-200 shrink-0" />
                <span>No Session / Weekend</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          fetchLeaves();
        }}
      />
    </div>
  );
};

export default StudentAttendancePage;
