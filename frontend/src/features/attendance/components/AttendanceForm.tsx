import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '../../../components/Button';
import { Calendar, CheckCircle2, XCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import {
  getBatchAttendanceApi,
  updateBatchAttendanceApi,
} from '../../../services/attendanceService';
import type { Attendance, AttendanceStatus } from '../../../types/attendance';

const FIRST_HALF_START_MINUTES = 11 * 60 + 30; 
const FIRST_HALF_END_MINUTES = 13 * 60 + 30;   
const SECOND_HALF_START_MINUTES = 15 * 60;      
const SECOND_HALF_END_MINUTES = 16 * 60 + 30;  

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');//with leading zero
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  const today = useMemo(() => getTodayDateString(), []);
  const [selectedDate] = useState(today);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate active window based on current local time
  const currentMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const isMorningOpen =
    currentMinutes >= FIRST_HALF_START_MINUTES && currentMinutes <= FIRST_HALF_END_MINUTES;
  const isAfternoonOpen =
    currentMinutes >= SECOND_HALF_START_MINUTES && currentMinutes <= SECOND_HALF_END_MINUTES;
  const isWindowClosed = !isMorningOpen && !isAfternoonOpen;

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

  // Mark all only applies to the currently active session window
  const handleMarkAll = (status: AttendanceStatus) => {
    if (isWindowClosed) return;
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        ...(isMorningOpen ? { firstHalf: status } : {}),
        ...(isAfternoonOpen ? { secondHalf: status } : {}),
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWindowClosed) {
      setError(
        'Attendance marking is closed. Allowed windows are: 11:30 AM – 01:30 PM (First Half) and 03:00 PM – 04:30 PM (Second Half).'
      );
      return;
    }

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

{/* Active Window Notification Banner */}
      {isMorningOpen && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-800">
          <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>First Half Open:</strong> Attendance can be marked for the morning session (11:30 AM – 01:30 PM). Second half is locked until 03:00 PM.
          </span>
        </div>
      )}

      {isAfternoonOpen && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200/80 p-3 text-xs text-blue-800">
          <Clock className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <strong>Second Half Open:</strong> Attendance can be marked for the afternoon session (03:00 PM – 04:30 PM). Morning session is locked.
          </span>
        </div>
      )}

      {isWindowClosed && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Attendance Window Closed:</strong> Attendance can only be marked between <strong>11:30 AM – 01:30 PM</strong> (First Half) and <strong>03:00 PM – 04:30 PM</strong> (Second Half).
          </span>
        </div>
      )}

{/* Date selector (locked to today) and quick controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/70">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-600 shrink-0" />
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Attendance Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            readOnly
            disabled
            className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 shadow-2xs cursor-not-allowed"
          />
          <span className="text-[11px] font-medium text-neutral-400">
            (Today only)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isWindowClosed}
            onClick={() => handleMarkAll('present')}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            All Present
          </button>
          <button
            type="button"
            disabled={isWindowClosed}
            onClick={() => handleMarkAll('absent')}
            className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <th className="px-4 py-3 text-center">
                First Half (Morning)
                <span className="block text-[10px] font-normal text-neutral-400 lowercase">
                  11:30 am – 1:30 pm
                </span>
              </th>
              <th className="px-4 py-3 text-center">
                Second Half (Evening)
                <span className="block text-[10px] font-normal text-neutral-400 lowercase">
                  3:00 pm – 4:30 pm
                </span>
              </th>
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
                      disabled={!isMorningOpen}
                      checked={record.firstHalf === 'present'}
                      onChange={(e) =>
                        handleToggleHalf(record.studentId, 'firstHalf', e.target.checked)
                      }
                      title={!isMorningOpen ? 'First half can only be marked between 11:30 AM and 01:30 PM' : ''}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      disabled={!isAfternoonOpen}
                      checked={record.secondHalf === 'present'}
                      onChange={(e) =>
                        handleToggleHalf(record.studentId, 'secondHalf', e.target.checked)
                      }
                      title={!isAfternoonOpen ? 'Second half can only be marked between 03:00 PM and 04:30 PM' : ''}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      disabled={isWindowClosed}
                      placeholder="Optional remarks..."
                      value={record.remarks ?? ''}
                      onChange={(e) =>
                        handleRemarksChange(record.studentId, e.target.value)
                      }
                      className="w-full rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 placeholder-neutral-400 focus:border-brand-500 focus:outline-hidden disabled:bg-neutral-100 disabled:cursor-not-allowed"
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
          disabled={isLoading || records.length === 0 || isWindowClosed}
        >
          Update Attendance
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
