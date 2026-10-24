import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { CalendarX, AlertCircle, Sun, Moon, Calendar, ArrowRight } from 'lucide-react';
import {
  applyStudentLeaveApi,
  updateStudentLeaveApi,
  rescheduleStudentLeaveApi,
} from '../../../services/leaveService';
import type { LeaveType, HalfDaySession, LeaveRequest } from '../../../types/leave';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leave?: LeaveRequest | null;
  mode?: 'apply' | 'edit' | 'reschedule';
}

const LEAVE_TYPE_OPTIONS = [
  { value: 'medical', label: 'Medical / Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'family', label: 'Family Event / Emergency' },
  { value: 'other', label: 'Other' },
];

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  leave,
  mode = leave ? 'edit' : 'apply',
}) => {
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<HalfDaySession>('firstHalf');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<LeaveType>('medical');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Today's date string (YYYY-MM-DD) as the minimum allowed date
  const getTodayDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const minDate = getTodayDate();

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (leave) {
        setIsHalfDay(Boolean(leave.isHalfDay));
        setHalfDaySession(leave.halfDaySession || 'firstHalf');
        setStartDate(leave.startDate);
        setEndDate(leave.endDate);
        setType(leave.type);
        setReason(mode === 'reschedule' ? '' : leave.reason);
      } else {
        setIsHalfDay(false);
        setHalfDaySession('firstHalf');
        setStartDate('');
        setEndDate('');
        setType('medical');
        setReason('');
      }
    }
  }, [isOpen, leave, mode]);

  const resetForm = () => {
    setIsHalfDay(false);
    setHalfDaySession('firstHalf');
    setStartDate('');
    setEndDate('');
    setType('medical');
    setReason('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isHalfDay) {
      if (!startDate) {
        setError('Please select a date for the half-day leave.');
        return;
      }
      if (startDate < minDate) {
        setError('Leave cannot be applied for past dates.');
        return;
      }
    } else {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return;
      }
      if (startDate < minDate) {
        setError('Leave cannot be applied for past dates.');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setError('Start date cannot be after end date.');
        return;
      }
    }

    if (!reason.trim()) {
      setError(
        mode === 'reschedule'
          ? 'Please provide a reason for rescheduling the leave.'
          : 'Please provide a reason for the leave.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        type,
        reason: reason.trim(),
        isHalfDay,
        halfDaySession: isHalfDay ? halfDaySession : undefined,
      };

      if (mode === 'reschedule' && leave) {
        await rescheduleStudentLeaveApi(leave.id, {
          startDate,
          endDate: isHalfDay ? startDate : endDate,
          isHalfDay,
          halfDaySession: isHalfDay ? halfDaySession : undefined,
          reason: reason.trim(),
        });
      } else if (leave) {
        await updateStudentLeaveApi(leave.id, payload);
      } else {
        await applyStudentLeaveApi(payload);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (mode === 'reschedule'
          ? 'Failed to submit reschedule request.'
          : leave
          ? 'Failed to update leave application.'
          : 'Failed to submit leave application.');
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    mode === 'reschedule'
      ? 'Reschedule Leave'
      : leave
      ? 'Update Leave Application'
      : 'Apply for Leave';

  const submitButtonText =
    mode === 'reschedule'
      ? 'Submit Reschedule Request'
      : leave
      ? 'Save Changes'
      : 'Submit Application';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      icon={<CalendarX className="h-5 w-5" />}
      size="md"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Approved Dates info banner when rescheduling */}
        {mode === 'reschedule' && leave && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 space-y-1">
            <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-800">
              Current Approved Dates
            </span>
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <Calendar className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{leave.startDate}</span>
              {!leave.isHalfDay && (
                <>
                  <ArrowRight className="h-3 w-3 shrink-0 opacity-70" />
                  <span>{leave.endDate}</span>
                </>
              )}
              <span className="ml-auto rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                {leave.isHalfDay ? 'Half Day' : 'Full Day'}
              </span>
            </div>
          </div>
        )}

        {/* Duration Mode Switcher (Full Day vs Half Day) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            {mode === 'reschedule' ? 'New Leave Duration' : 'Leave Duration'}
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100/90 rounded-xl border border-neutral-200/70">
            <button
              type="button"
              onClick={() => {
                setIsHalfDay(false);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isHalfDay
                  ? 'bg-white text-neutral-800 shadow-2xs border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Full Day(s)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsHalfDay(true);
                if (startDate) setEndDate(startDate);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isHalfDay
                  ? 'bg-white text-brand-700 shadow-2xs border border-brand-200'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Half Day
            </button>
          </div>
        </div>

        {/* Date inputs adapt to full-day or half-day */}
        {!isHalfDay ? (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={mode === 'reschedule' ? 'New Start Date' : 'Start Date'}
              type="date"
              min={minDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label={mode === 'reschedule' ? 'New End Date' : 'End Date'}
              type="date"
              min={startDate || minDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label={mode === 'reschedule' ? 'New Date' : 'Date'}
              type="date"
              min={minDate}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setEndDate(e.target.value);
              }}
            />

            {/* Half-day session selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Select Session
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHalfDaySession('firstHalf')}
                  className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    halfDaySession === 'firstHalf'
                      ? 'border-amber-400 bg-linear-to-br from-amber-50/80 via-white to-amber-50/30 ring-2 ring-amber-400/30 shadow-xs'
                      : 'border-neutral-200/90 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                      halfDaySession === 'firstHalf'
                        ? 'border-amber-300 bg-amber-100/90 text-amber-600 shadow-2xs'
                        : 'border-neutral-200/80 bg-neutral-100 text-neutral-400 group-hover:text-amber-500 group-hover:bg-amber-50/60'
                    }`}
                  >
                    <Sun className="h-5 w-5 transition-transform group-hover:rotate-45" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-neutral-800">First Half</p>
                    <p className="text-[11px] text-neutral-400">Morning Session</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setHalfDaySession('secondHalf')}
                  className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    halfDaySession === 'secondHalf'
                      ? 'border-indigo-400 bg-linear-to-br from-indigo-50/80 via-white to-indigo-50/30 ring-2 ring-indigo-400/30 shadow-xs'
                      : 'border-neutral-200/90 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                      halfDaySession === 'secondHalf'
                        ? 'border-indigo-300 bg-indigo-100/90 text-indigo-600 shadow-2xs'
                        : 'border-neutral-200/80 bg-neutral-100 text-neutral-400 group-hover:text-indigo-500 group-hover:bg-indigo-50/60'
                    }`}
                  >
                    <Moon className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-neutral-800">Second Half</p>
                    <p className="text-[11px] text-neutral-400">Afternoon Session</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Type (only shown when applying/editing; in reschedule it defaults to original leave type) */}
        {mode !== 'reschedule' && (
          <Select
            label="Leave Type"
            value={type}
            options={LEAVE_TYPE_OPTIONS}
            onChange={(e) => setType(e.target.value as LeaveType)}
          />
        )}

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-600">
            {mode === 'reschedule' ? 'Reason for Rescheduling' : 'Reason for Leave'}
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              mode === 'reschedule'
                ? 'Explain why the leave needs to be rescheduled (preponed, postponed, or extended)…'
                : 'Explain why you are requesting leave…'
            }
            className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500/20 transition-all duration-200"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyLeaveModal;
