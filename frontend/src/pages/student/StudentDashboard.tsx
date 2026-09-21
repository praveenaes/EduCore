import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Building2, 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  BookMarked,
  User,
  Sparkles
} from 'lucide-react';
import { getStudentCurriculumApi } from '../../services/studentService';
import type { StudentCurriculumResponse } from '../../types/student';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentCurriculumResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudentCurriculumApi()
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load academic details.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-xs font-medium text-neutral-400">Loading your curriculum…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center text-red-600 shadow-xs">
        <p className="font-semibold">{error || 'Unable to load academic placement.'}</p>
        <p className="mt-1 text-xs text-red-400">Please try refreshing or contact your institution support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800">
              Academic Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200/80">
              <Sparkles className="h-3 w-3 text-brand-500" />
              Active Term
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Overview of your academic enrollment, curriculum level, and assigned faculty.
          </p>
        </div>

        {/* Quick Batch/Status Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 border border-neutral-200/90 shadow-xs">
            <span className="text-neutral-400">Batch:</span>
            <span className="font-bold text-neutral-800">{data.batch.name}</span>
          </div>
        </div>
      </div>

      {/* Academic Placement Overview (The 7 Features) */}
      <section className="rounded-2xl border border-slate-200 bg-slate-100/70 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Academic Placement Overview
            </h2>
            <p className="text-xs text-slate-400">Your core curriculum structure and current enrollment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Program */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Program</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">{data.program.name}</p>
            </div>
            {data.program.code && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Code</span>
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-700 border border-indigo-200 shadow-xs">
                  {data.program.code}
                </span>
              </div>
            )}
          </div>

          {/* Course */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-violet-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Course</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 border border-violet-100 text-violet-600 shadow-xs">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">{data.course.name}</p>
            </div>
            {data.course.code && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Code</span>
                <span className="inline-flex items-center rounded-md bg-violet-50 px-2.5 py-0.5 text-xs font-mono font-bold text-violet-700 border border-violet-200 shadow-xs">
                  {data.course.code}
                </span>
              </div>
            )}
          </div>

          {/* Level / Semester */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Level / Semester</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 border border-sky-100 text-sky-600 shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">{data.level.levelName}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Position</span>
              <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-mono font-bold text-sky-700 border border-sky-200 shadow-xs">
                Level {data.level.levelNumber}
              </span>
            </div>
          </div>

          {/* Batch */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Batch</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600 shadow-xs">
                  <BookMarked className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">{data.batch.name}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Division</span>
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200 shadow-xs">
                Enrolled Batch
              </span>
            </div>
          </div>

          {/* Center / Campus */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-teal-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Center / Campus</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 border border-teal-100 text-teal-600 shadow-xs">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">{data.center.name}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Campus</span>
              <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200 shadow-xs">
                Active Branch
              </span>
            </div>
          </div>

          {/* Academic Year */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Year</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600 shadow-xs">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">{data.academicYear.name}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Cycle</span>
              <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-mono font-medium text-rose-700 border border-rose-200 shadow-xs">
                Session
              </span>
            </div>
          </div>

          {/* Batch Teacher */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Batch Teacher</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600 shadow-xs">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">{data.batchTeacher.name}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Faculty ID</span>
              {data.batchTeacher.employeeId ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-700 border border-blue-200 ring-1 ring-blue-500/10 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {data.batchTeacher.employeeId}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">Unassigned</span>
              )}
            </div>
          </div>

          {/* Student Status */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Status</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-800 leading-snug">Enrollment Status</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Current</span>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-0.5 text-xs font-bold border shadow-xs ${
                data.studentStatus === 'Active' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20' 
                  : 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20'
              }`}>
                <span className="relative flex h-2 w-2">
                  {data.studentStatus === 'Active' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    data.studentStatus === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                </span>
                <span>{data.studentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assigned Subjects & Faculty Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Assigned Subjects & Faculty</h2>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200 shadow-xs">
                {data.subjects.length} Subjects
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Curriculum subjects taught in your current level ({data.level.levelName}).
            </p>
          </div>
        </div>

        {data.subjects.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No subjects assigned to this level yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">Assigned subjects will appear once scheduled by administration.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Subject Code</th>
                  <th className="px-5 py-3.5">Assigned Teacher</th>
                  <th className="px-5 py-3.5">Employee ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.subjects.map((subj) => (
                  <tr key={subj.id} className="transition-colors hover:bg-indigo-50/30">
                    {/* Subject Name with Icon Box */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-800">{subj.name}</span>
                      </div>
                    </td>

                    {/* Highlighted Subject Code */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 border border-indigo-200 shadow-xs">
                        {subj.code}
                      </span>
                    </td>

                    {/* Teacher Name with Avatar Icon */}
                    <td className="px-5 py-4">
                      {subj.teacherName ? (
                        <div className="flex items-center gap-2 text-slate-800">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-600 shadow-xs">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium">{subj.teacherName}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Unassigned</span>
                      )}
                    </td>

                    {/* Employee ID in Blue Circle / Pill */}
                    <td className="px-5 py-4">
                      {subj.teacherEmployeeId ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-mono font-bold text-blue-700 border border-blue-200 ring-1 ring-blue-500/10 shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {subj.teacherEmployeeId}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;

