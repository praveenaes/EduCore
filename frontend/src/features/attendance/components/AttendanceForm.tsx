import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '../../../components/Button';
import { Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  getBatchAttendanceApi,
  updateBatchAttendanceApi,
} from '../../../services/attendanceService';
import type { Attendance, AttendanceStatus } from '../../../types/attendance';

interface AttendanceFormProps {
  batchId: string;
  batchName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  batchId,
  batchName,
  onCancel,
  onSuccess,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBatchAttendanceApi({
        batchId,
        date: selectedDate,
      });
      setRecords(res.data.data.records || []);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ?? 'Failed to load attendance records.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [batchId, selectedDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleToggleHalf = (
    studentId: string,
    half: 'firstHalf' | 'secondHalf',
    checked: boolean
  ) => {
    const status: AttendanceStatus = checked ? 'present' : 'absent';
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, [half]: status } : r))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        firstHalf: status,
        secondHalf: status,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await updateBatchAttendanceApi({
        batchId,
        date: selectedDate,
        attendances: records.map((r) => ({
          studentId: r.studentId,
          firstHalf: r.firstHalf,
          secondHalf: r.secondHalf,
          remarks: r.remarks,
        })),
      });
      onSuccess();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ?? 'Failed to update attendance records.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Date selector and quick controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/70">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-600 shrink-0" />
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Attendance Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-2xs focus:border-brand-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleMarkAll('present')}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200/60"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('absent')}
            className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200/60"
          >
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            All Absent
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200/80 shadow-2xs">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200/80 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Admission No</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3 text-center">First Half (Morning)</th>
              <th className="px-4 py-3 text-center">Second Half (Evening)</th>
              <th className="px-4 py-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-neutral-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500 mb-2" />
                  Loading students for {batchName}...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-neutral-400">
                  No students enrolled in this batch.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.studentId} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-neutral-600 whitespace-nowrap">
                    {record.admissionNumber || '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-800 whitespace-nowrap">
                    {record.studentName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={record.firstHalf === 'present'}
                      onChange={(e) =>
                        handleToggleHalf(record.studentId, 'firstHalf', e.target.checked)
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={record.secondHalf === 'present'}
                      onChange={(e) =>
                        handleToggleHalf(record.studentId, 'secondHalf', e.target.checked)
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Optional remarks..."
                      value={record.remarks ?? ''}
                      onChange={(e) =>
                        handleRemarksChange(record.studentId, e.target.value)
                      }
                      className="w-full rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 placeholder-neutral-400 focus:border-brand-500 focus:outline-hidden"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
        <Button variant="outline" size="sm" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          isLoading={isSaving}
          disabled={isLoading || records.length === 0}
        >
          Update Attendance
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
