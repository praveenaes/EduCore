import React, { useEffect, useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { getMyResultsApi } from '../../services/assessmentResultService';
import { ReportCardModal } from '../../features/assessments/components/ReportCardModal';
import { calculateGrade } from '../../utils/gradeHelper';
import type { AssessmentResult } from '../../types/assessmentResult';

export const StudentResultsPage: React.FC = () => {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected assessment for Report Card modal
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyResultsApi();
      setResults(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load assessment results.');
    } finally {
      setLoading(false);
    }
  };

  // Group results by assessment event
  const groupedResults = useMemo(() => {
    const map = new Map<string, { assessmentName: string; results: AssessmentResult[] }>();

    for (const r of results) {
      const key = r.assessmentId;
      if (!map.has(key)) {
        map.set(key, {
          assessmentName: r.assessmentName || 'Assessment',
          results: [],
        });
      }
      map.get(key)!.results.push(r);
    }

    return Array.from(map.entries()).map(([assessmentId, group]) => {
      let totalObtained = 0;
      let totalMax = 0;
      let allPassed = true;

      for (const res of group.results) {
        totalObtained += (res.marksObtained || 0) + (res.ceMarksObtained || 0);
        totalMax += res.maxMarks || 100;
        if (!res.isPassed || res.isAbsent) {
          allPassed = false;
        }
      }

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      return {
        assessmentId,
        assessmentName: group.assessmentName,
        results: group.results,
        totalObtained,
        totalMax,
        percentage,
        isOverallPass: allPassed && group.results.length > 0,
      };
    });
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <Award className="h-6 w-6 text-brand-600" />
            My Assessment Results
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            View your verified examination marks, subject performance, and printable report cards.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-3" />
          <p className="text-sm text-neutral-500">Loading your academic results...</p>
        </div>
      ) : groupedResults.length === 0 ? (
        <EmptyState
          title="No Published Results Yet"
          description="Your assessment marks have not been published by your teachers yet. Check back soon!"
        />
      ) : (
        <div className="space-y-6">
          {groupedResults.map((group) => (
            <div
              key={group.assessmentId}
              className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden transition-all hover:shadow-md"
            >
              {/* Event card header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-50/70 border-b border-neutral-200/70 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">{group.assessmentName}</h2>
                    <p className="text-xs text-neutral-500">
                      {group.results.length} Subject{group.results.length === 1 ? '' : 's'} Evaluated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      group.isOverallPass
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {group.isOverallPass ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> NEEDS ATTENTION
                      </>
                    )}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedAssessmentId(group.assessmentId);
                      setShowReportCardModal(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Report Card
                  </Button>
                </div>
              </div>

              {/* Subject scores table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-100/70 font-semibold text-neutral-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Subject / Paper</th>
                      <th className="px-5 py-3 text-center">Marks Obtained</th>
                      <th className="px-5 py-3 text-center">CE Marks</th>
                      <th className="px-5 py-3 text-center">Max Marks</th>
                      <th className="px-5 py-3 text-center">Grade</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {group.results.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-neutral-900">
                          {r.subjectName || r.criteriaName}
                          {r.criteriaName && r.criteriaName !== r.subjectName && (
                            <span className="block text-[11px] text-neutral-400 font-normal">
                              {r.criteriaName}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-neutral-900">
                          {r.isAbsent ? '-' : r.marksObtained}
                        </td>
                        <td className="px-5 py-3 text-center text-neutral-600">
                          {r.ceMarksObtained ?? '-'}
                        </td>
                        <td className="px-5 py-3 text-center text-neutral-500 font-medium">
                          {r.maxMarks || 100}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {(() => {
                            const { grade, badgeClass } = calculateGrade(
                              r.marksObtained ?? 0,
                              r.maxMarks ?? 100,
                              Boolean(r.isAbsent),
                              r.passMarks ?? 40
                            );
                            return (
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-black border ${badgeClass}`}
                              >
                                {grade}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {r.isAbsent ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-700">
                              ABSENT
                            </span>
                          ) : r.isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3" /> PASS
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

              {/* Summary footer */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50/50 border-t border-neutral-100 text-xs">
                <span className="text-neutral-500">
                  Total Score: <strong className="text-neutral-800">{group.totalObtained}</strong> / {group.totalMax}
                </span>
                <span className="text-neutral-500">
                  Aggregate: <strong className="text-brand-600">{group.percentage.toFixed(1)}%</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Card Modal */}
      {showReportCardModal && (
        <ReportCardModal
          isOpen={showReportCardModal}
          onClose={() => {
            setShowReportCardModal(false);
            setSelectedAssessmentId(null);
          }}
          assessmentId={selectedAssessmentId}
        />
      )}
    </div>
  );
};
export default StudentResultsPage;
