import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Loader2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { useAppSelector } from '../../../app/hooks';
import { calculateGrade } from '../../../utils/gradeHelper';
import {
  getMarkEntrySheetApi,
  saveAssessmentMarksApi,
  publishAssessmentResultsApi,
} from '../../../services/assessmentResultService';
import type {
  MarkEntrySheetData,
  MarkEntryStudentRow,
} from '../../../types/assessmentResult';

interface MarkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string | null;
  onSuccess?: () => void;
}

export const MarkEntryModal: React.FC<MarkEntryModalProps> = ({
  isOpen,
  onClose,
  scheduleId,
  onSuccess,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [data, setData] = useState<MarkEntrySheetData | null>(null);
  const [students, setStudents] = useState<MarkEntryStudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && scheduleId) {
      loadSheet(scheduleId);
    } else {
      setData(null);
      setStudents([]);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, scheduleId]);

  const loadSheet = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await getMarkEntrySheetApi(id);
      const sheet = res.data.data;
      setData(sheet);
      setStudents(sheet?.students || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load mark entry sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkChange = (index: number, val: string) => {
    const numVal = val === '' ? 0 : Number(val);
    const max = data?.maxMarks ?? 100;
    const clamped = Math.min(Math.max(0, numVal), max);

    setStudents((prev) => {
      const next = [...prev];
      const passMarks = data?.passMarks ?? 40;
      next[index] = {
        ...next[index],
        marksObtained: clamped,
        isPassed: clamped >= passMarks && !next[index].isAbsent,
      };
      return next;
    });
  };

  const handleCeMarkChange = (index: number, val: string) => {
    const numVal = val === '' ? 0 : Number(val);
    const clamped = Math.max(0, numVal);

    setStudents((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        ceMarksObtained: clamped,
      };
      return next;
    });
  };

  const handleAbsentToggle = (index: number) => {
    setStudents((prev) => {
      const next = [...prev];
      const isAbsent = !next[index].isAbsent;
      const passMarks = data?.passMarks ?? 40;
      next[index] = {
        ...next[index],
        isAbsent,
        isPassed: !isAbsent && (next[index].marksObtained ?? 0) >= passMarks,
      };
      return next;
    });
  };

  const handleRemarkChange = (index: number, remarks: string) => {
    setStudents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], remarks };
      return next;
    });
  };

  const handleSaveMarks = async () => {
    if (!scheduleId || !data) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await saveAssessmentMarksApi({
        scheduleId: data.scheduleId,
        assessmentId: data.assessmentId,
        batchId: data.batchId,
        criteriaId: data.criteriaId,
        marks: students.map((s) => ({
          studentId: s.studentId,
          marksObtained: s.marksObtained ?? 0,
          ceMarksObtained: s.ceMarksObtained ?? 0,
          isAbsent: Boolean(s.isAbsent),
          remarks: s.remarks,
        })),
      });
      setSuccessMsg('Marks saved successfully!');
      setData((prev) => (prev ? { ...prev, isCompleted: true } : null));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!scheduleId || !data) return;
    setIsPublishing(true);
    setError(null);
    try {
      const isCurrentlyPublished = Boolean(data.isPublished);
      const nextStatus = !isCurrentlyPublished;
      await publishAssessmentResultsApi({
        scheduleId: data.scheduleId,
        assessmentId: data.assessmentId,
        isPublished: nextStatus,
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              isPublished: nextStatus,
            }
          : null
      );
      setSuccessMsg(nextStatus ? 'Results published to students!' : 'Results unpublished.');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update publishing status');
    } finally {
      setIsPublishing(false);
    }
  };

  const isSheetPublished = Boolean(data?.isPublished);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={data?.assessmentName ? `Mark Entry - ${data.assessmentName}` : 'Mark Entry Sheet'}
      size="xl"
      icon={<FileSpreadsheet className="h-5 w-5 text-brand-600" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {isAdmin && data && (
              <Button
                variant={isSheetPublished ? 'secondary' : 'primary'}
                onClick={handleTogglePublish}
                disabled={isPublishing || isSaving || students.length === 0}
                className="text-xs flex items-center gap-1.5"
              >
                <Globe className="h-4 w-4" />
                {isSheetPublished ? 'Unpublish Results' : 'Publish to Students'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveMarks}
              disabled={isSaving || isLoading || students.length === 0}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Marks
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-2" />
            <p className="text-sm text-neutral-500">Loading student mark entry sheet...</p>
          </div>
        ) : !data ? (
          <p className="text-neutral-500 text-sm">No schedule selected.</p>
        ) : (
          <>
            {/* Exam & Schedule Header Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/70 text-xs">
              <div>
                <span className="text-neutral-400 block font-medium">Batch</span>
                <span className="font-semibold text-neutral-800">{data.batchName || 'General'}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Subject / Criteria</span>
                <span className="font-semibold text-neutral-800">
                  {data.subjectName || data.criteriaName || 'Exam'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Max / Pass Marks</span>
                <span className="font-semibold text-neutral-800">
                  {data.maxMarks ?? 100} / {data.passMarks ?? 40}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Status</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    data.isCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {data.isCompleted ? 'Graded' : 'Pending Grading'}
                </span>
              </div>
            </div>

            {/* Students Mark Entry Table */}
            {students.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">
                No active students found enrolled in this batch.
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-200 rounded-xl max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-100 text-neutral-600 font-semibold sticky top-0 z-10 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5">Admission #</th>
                      <th className="px-3 py-2.5">Student Name</th>
                      <th className="px-3 py-2.5 w-28">Marks (Max {data.maxMarks ?? 100})</th>
                      {data.hasCe && <th className="px-3 py-2.5 w-24">CE Marks</th>}
                      <th className="px-3 py-2.5 text-center">Absent?</th>
                      <th className="px-3 py-2.5 text-center">Grade</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                      <th className="px-3 py-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {students.map((student, idx) => (
                      <tr
                        key={student.studentId}
                        className={`hover:bg-neutral-50/80 transition-colors ${
                          student.isAbsent ? 'bg-red-50/40 text-neutral-400' : ''
                        }`}
                      >
                        <td className="px-3 py-2 font-mono text-[11px]">
                          {student.admissionNumber || 'N/A'}
                        </td>
                        <td className="px-3 py-2 font-medium text-neutral-900">
                          {student.studentName}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            max={data.maxMarks ?? 100}
                            disabled={student.isAbsent}
                            value={student.isAbsent ? 0 : (student.marksObtained ?? 0)}
                            onChange={(e) => handleMarkChange(idx, e.target.value)}
                            className="w-20 px-2 py-1 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400"
                          />
                        </td>
                        {data.hasCe && (
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              disabled={student.isAbsent}
                              value={student.ceMarksObtained ?? 0}
                              onChange={(e) => handleCeMarkChange(idx, e.target.value)}
                              className="w-20 px-2 py-1 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-neutral-800 disabled:bg-neutral-100"
                            />
                          </td>
                        )}
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleAbsentToggle(idx)}
                            className={`p-1 rounded-lg border transition-all ${
                              student.isAbsent
                                ? 'bg-red-500 border-red-600 text-white'
                                : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600'
                            }`}
                            title={student.isAbsent ? 'Marked Absent' : 'Mark Absent'}
                          >
                            {student.isAbsent ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {(() => {
                            const { grade, badgeClass } = calculateGrade(
                              student.marksObtained ?? 0,
                              data.maxMarks ?? 100,
                              Boolean(student.isAbsent),
                              data.passMarks ?? 40
                            );
                            return (
                              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-black border ${badgeClass}`}>
                                {grade}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {student.isAbsent ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-700">
                              ABSENT
                            </span>
                          ) : student.isPassed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                              PASS
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              FAIL
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={student.remarks || ''}
                            onChange={(e) => handleRemarkChange(idx, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
export default MarkEntryModal;
