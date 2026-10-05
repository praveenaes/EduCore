import React, { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { CalendarX, AlertCircle } from 'lucide-react';
import { applyStudentLeaveApi } from '../../../services/leaveService';
import type { LeaveType } from '../../../types/leave';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<LeaveType>('medical');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tomorrow's date string (YYYY-MM-DD) as the minimum allowed date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const minDate = getTomorrowDate();

  const resetForm = () => {
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

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (startDate < minDate) {
      setError('Leave can only be applied starting from tomorrow onwards.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the leave.');
      return;
    }

    setIsSubmitting(true);
    try {
      await applyStudentLeaveApi({
        startDate,
        endDate,
        type,
        reason: reason.trim(),
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to submit leave application.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Apply for Leave"
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            min={minDate}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            min={startDate || minDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Select
          label="Leave Type"
          value={type}
          options={LEAVE_TYPE_OPTIONS}
          onChange={(e) => setType(e.target.value as LeaveType)}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-600">
            Reason for Leave
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you are requesting leave…"
            className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500/20 transition-all duration-200"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyLeaveModal;
