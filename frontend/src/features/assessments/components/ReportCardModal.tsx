import React, { useEffect, useState } from 'react';
import {
  Printer,
  Award,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  GraduationCap,
} from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { calculateGrade } from '../../../utils/gradeHelper';
import {
  getMyReportCardApi,
  getStudentReportCardApi,
} from '../../../services/assessmentResultService';
import type { StudentReportCardData } from '../../../types/assessmentResult';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string | null;
  studentId?: string | null; // optional: if provided, fetches specific student (for admin/teacher); otherwise fetches logged-in student
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  assessmentId,
  studentId,
}) => {
  const [data, setData] = useState<StudentReportCardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && assessmentId) {
      loadReportCard(assessmentId, studentId);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, assessmentId, studentId]);

  const loadReportCard = async (assessId: string, studId?: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = studId
        ? await getStudentReportCardApi(assessId, studId)
        : await getMyReportCardApi(assessId);
      setData(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load report card');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const studentName = (data as any)?.student?.name || (data as any)?.studentName || 'Student';
  const admissionNumber = (data as any)?.student?.admissionNumber || (data as any)?.admissionNumber || 'N/A';
  const assessmentName = (data as any)?.assessment?.name || (data as any)?.assessmentName || 'Assessment';
  const batchName = (data as any)?.student?.batchName || (data as any)?.batchName || 'General';
  const totalMarks = data?.totalMarks ?? (data as any)?.totalMarksObtained ?? 0;
  const totalMaxMarks = data?.totalMaxMarks ?? 100;
  const percentage = data?.percentage ?? 0;
  const overallStatus = data?.overallStatus ?? 'PASSED';
  const subjects = data?.subjects || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Academic Report Card"
      size="xl"
      icon={<Award className="h-5 w-5 text-brand-600" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={isLoading || !data}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report Card
          </Button>
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-2" />
            <p className="text-sm text-neutral-500">Generating report card...</p>
          </div>
        ) : !data ? (
          <p className="text-neutral-500 text-sm">No report card data found.</p>
        ) : (
          <div id="printable-report-card" className="bg-white p-4 rounded-xl border border-neutral-200">
            {/* Institution Brand Header */}
            <div className="border-b-2 border-neutral-800 pb-4 mb-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <GraduationCap className="h-7 w-7 text-brand-600" />
                <h1 className="text-xl font-black tracking-tight text-neutral-900 uppercase">
                  EduCore Academy
                </h1>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                Official Student Assessment & Performance Report
              </p>
            </div>

            {/* Student & Exam Details Grid */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs mb-5">
              <div>
                <div className="mb-1">
                  <span className="text-neutral-500 font-medium">Student Name: </span>
                  <span className="font-bold text-neutral-900">{studentName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-medium">Admission No: </span>
                  <span className="font-mono font-bold text-neutral-900">
                    {admissionNumber}
                  </span>
                </div>
              </div>
              <div>
                <div className="mb-1">
                  <span className="text-neutral-500 font-medium">Assessment: </span>
                  <span className="font-bold text-neutral-900">{assessmentName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-medium">Batch: </span>
                  <span className="font-bold text-neutral-900">{batchName}</span>
                </div>
              </div>
            </div>

            {/* Subject-Wise Performance Table */}
            <div className="overflow-x-auto border border-neutral-200 rounded-lg mb-5">
              <table className="w-full text-left text-xs text-neutral-800">
                <thead className="bg-neutral-100 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="px-3 py-2">Subject / Exam</th>
                    <th className="px-3 py-2 text-center">Max Marks</th>
                    <th className="px-3 py-2 text-center">Pass Marks</th>
                    <th className="px-3 py-2 text-center">Obtained</th>
                    <th className="px-3 py-2 text-center">CE Marks</th>
                    <th className="px-3 py-2 text-center">Grade</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="px-3 py-2.5 font-medium">
                        {sub.subjectName}
                        {sub.criteriaName && sub.criteriaName !== sub.subjectName && (
                          <span className="block text-[11px] text-neutral-400 font-normal">
                            {sub.criteriaName}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold">{sub.maxMarks}</td>
                      <td className="px-3 py-2.5 text-center text-neutral-500">{sub.passMarks}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-neutral-900">
                        {sub.isAbsent ? '-' : sub.marksObtained}
                      </td>
                      <td className="px-3 py-2.5 text-center text-neutral-600">
                        {sub.ceMarksObtained ?? '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {(() => {
                          const gradeInfo = calculateGrade(
                            sub.marksObtained ?? 0,
                            sub.maxMarks ?? 100,
                            Boolean(sub.isAbsent),
                            sub.passMarks ?? 40
                          );
                          return (
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-black border ${gradeInfo.badgeClass}`}>
                              {sub.grade || gradeInfo.grade}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {sub.isAbsent ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-700">
                            ABSENT
                          </span>
                        ) : sub.isPassed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3" /> FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-center text-xs">
              <div>
                <span className="text-neutral-500 font-medium block">Total Marks</span>
                <span className="text-base font-black text-neutral-900">
                  {totalMarks} / {totalMaxMarks}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 font-medium block">Percentage</span>
                <span className="text-base font-black text-brand-600">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-neutral-500 font-medium block">Overall Grade</span>
                <span className="text-base font-black text-neutral-900">
                  {(data as any)?.overallGrade ||
                    calculateGrade(totalMarks, totalMaxMarks, overallStatus !== 'PASSED', 0).grade}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 font-medium block">Final Result</span>
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                    overallStatus === 'PASSED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {overallStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default ReportCardModal;
