import React, { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  GraduationCap,
  Calendar,
  Clock,
  Building2,
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
      setError(err?.response?.data?.message || 'Failed to load assessment schedules and results.');
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
          assessmentName: r.assessmentName || 'Assessment Event',
          results: [],
        });
      }
      map.get(key)!.results.push(r);
    }

    return Array.from(map.entries()).map(([assessmentId, group]) => {
      let totalObtained = 0;
      let totalMax = 0;
      let allPassed = true;

      const hasPublishedResults = group.results.some((r) => r.isPublished);

      for (const res of group.results) {
        if (res.isPublished) {
          totalObtained += (res.marksObtained || 0) + (res.ceMarksObtained || 0);
          totalMax += res.maxMarks || 100;
          if (!res.isPassed || res.isAbsent) {
            allPassed = false;
          }
        }
      }

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const firstRes = group.results[0];
      const totalExams = firstRes?.totalExamsInEvent ?? group.results.length;

      // Determine parent event status from items
      const isAllExamsPublished =
        group.results.length > 0 &&
        group.results.every((r) => r.scheduleStatus === 'PUBLISHED');
      const isEventPublished = isAllExamsPublished;
      const isEventCompleted = group.results.some(
        (r) => r.scheduleStatus === 'COMPLETED' || r.scheduleStatus === 'PUBLISHED'
      );
      const isEventCancelled = group.results.every((r) => r.scheduleStatus === 'CANCELLED');
      const eventStatus: 'SCHEDULED' | 'COMPLETED' | 'PUBLISHED' | 'CANCELLED' =
        isEventPublished
          ? 'PUBLISHED'
          : isEventCompleted
          ? 'COMPLETED'
          : isEventCancelled
          ? 'CANCELLED'
          : 'SCHEDULED';

      return {
        assessmentId,
        assessmentName: group.assessmentName,
        results: group.results,
        totalObtained,
        totalMax,
        percentage,
        isOverallPass: allPassed && hasPublishedResults,
        totalExams,
        isAllExamsCompleted: isAllExamsPublished || Boolean(firstRes?.allExamsCompleted),
        hasPublishedResults,
        eventStatus,
      };
    });
  }, [results]);

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-brand-600" />
            Exams & Results
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            View your exam timetables, track assessment statuses, and view published marks and progress cards.
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
          <p className="text-sm text-neutral-500">Loading your exam timetables and results...</p>
        </div>
      ) : groupedResults.length === 0 ? (
        <EmptyState
          title="No Scheduled Exams or Results Yet"
          description="There are currently no examination schedules or published results for your batch."
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
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base font-bold text-neutral-900">{group.assessmentName}</h2>
                      {renderStatusBadge(group.eventStatus)}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {group.results.length} Exam Paper{group.results.length === 1 ? '' : 's'} Scheduled
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {group.hasPublishedResults && (
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
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!group.isAllExamsCompleted}
                    onClick={() => {
                      setSelectedAssessmentId(group.assessmentId);
                      setShowReportCardModal(true);
                    }}
                    className="flex items-center gap-1.5"
                    title={
                      group.isAllExamsCompleted
                        ? 'Download / Generate Progress Card'
                        : group.eventStatus === 'SCHEDULED'
                        ? 'Progress card will be generated after all exams are completed and published.'
                        : group.eventStatus === 'COMPLETED'
                        ? 'Exams completed. Progress card will be ready once marks are published.'
                        : 'Progress card will be generated after all papers in this event are published.'
                    }
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Generate Progress Card
                  </Button>
                </div>
              </div>

              {/* Subject scores & Timetable table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-100/70 font-semibold text-neutral-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Subject & Paper</th>
                      <th className="px-5 py-3">Date & Time</th>
                      <th className="px-5 py-3">Exam Center</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-center">Marks Obtained</th>
                      <th className="px-5 py-3 text-center">Max Marks</th>
                      <th className="px-5 py-3 text-center">Grade</th>
                      <th className="px-5 py-3 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {group.results.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50/50 transition-colors">
                        {/* Subject */}
                        <td className="px-5 py-3 font-medium text-neutral-900">
                          <span>{r.subjectName || r.criteriaName}</span>
                          {r.criteriaName && r.criteriaName !== r.subjectName && (
                            <span className="block text-[11px] text-neutral-400 font-normal">
                              {r.criteriaName} {r.subjectCode ? `(${r.subjectCode})` : ''}
                            </span>
                          )}
                        </td>

                        {/* Timetable */}
                        <td className="px-5 py-3 text-neutral-600">
                          {r.examDate ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 font-medium text-neutral-800">
                                <Calendar className="h-3 w-3 text-neutral-400" />
                                <span>
                                  {new Date(r.examDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              {r.startTime && (
                                <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                                  <Clock className="h-3 w-3 text-neutral-400" />
                                  <span>
                                    {r.startTime} – {r.endTime || ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>

                        {/* Center */}
                        <td className="px-5 py-3 text-neutral-600">
                          {r.centerName ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                              <span>{r.centerName}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3 text-center">
                          {renderStatusBadge(r.scheduleStatus)}
                        </td>

                        {/* Marks Obtained */}
                        <td className="px-5 py-3 text-center font-bold text-neutral-900">
                          {r.isPublished ? (
                            r.isAbsent ? (
                              <span className="text-neutral-400 font-normal">Absent</span>
                            ) : (
                              <span>
                                {r.marksObtained}
                                {r.ceMarksObtained !== undefined && r.ceMarksObtained > 0 && (
                                  <span className="text-[10px] text-neutral-400 font-normal ml-1">
                                    (+{r.ceMarksObtained} CE)
                                  </span>
                                )}
                              </span>
                            )
                          ) : r.scheduleStatus === 'COMPLETED' ? (
                            <span className="text-[11px] font-normal text-neutral-400 italic">
                              Evaluating
                            </span>
                          ) : (
                            <span className="text-[11px] font-normal text-neutral-400 italic">
                              Upcoming
                            </span>
                          )}
                        </td>

                        {/* Max Marks */}
                        <td className="px-5 py-3 text-center text-neutral-500 font-medium">
                          {r.maxMarks || 100}
                        </td>

                        {/* Grade */}
                        <td className="px-5 py-3 text-center">
                          {r.isPublished ? (
                            (() => {
                              const { grade, badgeClass } = calculateGrade(
                                r.marksObtained ?? 0,
                                r.maxMarks ?? 100,
                                Boolean(r.isAbsent),
                                r.passMarks ?? 40
                              );
                              return (
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[11px] font-black border ${badgeClass}`}
                                >
                                  {grade}
                                </span>
                              );
                            })()
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>

                        {/* Result Status */}
                        <td className="px-5 py-3 text-center">
                          {r.isPublished ? (
                            r.isAbsent ? (
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
                            )
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary / Message footer */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50/50 border-t border-neutral-100 text-xs">
                {group.hasPublishedResults ? (
                  <>
                    <span className="text-neutral-500">
                      Total Score: <strong className="text-neutral-800">{group.totalObtained}</strong> /{' '}
                      {group.totalMax}
                    </span>
                    <span className="text-neutral-500">
                      Aggregate: <strong className="text-brand-600">{group.percentage.toFixed(1)}%</strong>
                    </span>
                  </>
                ) : group.eventStatus === 'COMPLETED' ? (
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                    Examinations have concluded. Subject marks are under evaluation and will be published soon.
                  </span>
                ) : (
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    Upcoming examination schedule for your batch. Please review your exam timings and center above.
                  </span>
                )}
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
