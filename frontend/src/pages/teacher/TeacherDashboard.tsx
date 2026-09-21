import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Building2, 
  Calendar, 
  UserCheck, 
  BookMarked,
  Sparkles
} from 'lucide-react';
import { getTeacherCurriculumApi } from '../../services/teacherService';
import type { TeacherCurriculumResponse } from '../../types/teacher';

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<TeacherCurriculumResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeacherCurriculumApi()
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load faculty academic details.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-xs font-medium text-neutral-400">Loading your curriculum & assignments…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center text-red-600 shadow-xs">
        <p className="font-semibold">{error || 'Unable to load faculty curriculum details.'}</p>
        <p className="mt-1 text-xs text-red-400">Please try refreshing or contact your institution support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
              Faculty Academic Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              Academic Workspace
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your assigned teaching subjects, designated batches, and academic curriculum scope.
          </p>
        </div>

        {/* Status & Employee ID Pills */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Employee ID in Blue Circle / Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-mono font-bold text-blue-700 border border-blue-200 ring-2 ring-blue-500/15 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>ID: {data.employeeId}</span>
          </div>

          {/* Teacher Status in Green Circled Shape */}
          <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold border shadow-sm ${
            data.teacherStatus === 'Active' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-500/20' 
              : 'bg-red-50 text-red-700 border-red-200 ring-2 ring-red-500/20'
          }`}>
            <span className="relative flex h-2 w-2">
              {data.teacherStatus === 'Active' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                data.teacherStatus === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
            </span>
            <span>{data.teacherStatus}</span>
          </div>
        </div>
      </div>

      {/* Quick Stat Summary Cards with Top Color Accent Strips & Shadows */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Assigned Subjects */}
        <div className="rounded-xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subjects</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-800">{data.summary.totalSubjects}</p>
          <span className="text-xs font-medium text-slate-500">Assigned to Teach</span>
        </div>

        {/* Total In-Charge Batches */}
        <div className="rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Batches</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs">
              <BookMarked className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-800">{data.summary.totalBatches}</p>
          <span className="text-xs font-medium text-slate-500">Class In-Charge</span>
        </div>

        {/* Total Courses */}
        <div className="rounded-xl border border-slate-200 border-t-4 border-t-violet-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Courses</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 border border-violet-100 text-violet-600 shadow-xs">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-800">{data.summary.totalCourses}</p>
          <span className="text-xs font-medium text-slate-500">Course Curricula</span>
        </div>

        {/* Total Campuses */}
        <div className="rounded-xl border border-slate-200 border-t-4 border-t-teal-500 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campuses</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 border border-teal-100 text-teal-600 shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-800">{data.summary.totalCenters}</p>
          <span className="text-xs font-medium text-slate-500">Centers / Branches</span>
        </div>
      </div>

      {/* Curriculum Placement & Scope (The 7 Features Overview) */}
      <section className="rounded-2xl border border-slate-200 bg-slate-100/70 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Academic Curriculum Scope
            </h2>
            <p className="text-xs text-slate-500">Comprehensive footprint across the 7 curriculum features</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Programs Scope */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Programs</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                <GraduationCap className="h-3.5 w-3.5" />
              </div>
            </div>
            {data.scope.programs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No programs linked</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.scope.programs.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200 shadow-xs">
                    {p.name}
                    {p.code && <span className="font-mono text-[10px] font-bold text-indigo-600">({p.code})</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Courses Scope */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-violet-500 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Courses</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 border border-violet-100 text-violet-600 shadow-xs">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
            </div>
            {data.scope.courses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No courses linked</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.scope.courses.map((c, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 border border-violet-200 shadow-xs">
                    {c.name}
                    {c.code && <span className="font-mono text-[10px] font-bold text-violet-600">({c.code})</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Levels Scope */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Levels / Semesters</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 border border-sky-100 text-sky-600 shadow-xs">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>
            {data.scope.levels.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No levels linked</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.scope.levels.map((lvl, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-mono font-bold text-sky-700 border border-sky-200 shadow-xs">
                    {lvl.levelName || `Level ${lvl.levelNumber}`}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Centers Scope */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-teal-500 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Centers / Campuses</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-100 text-teal-600 shadow-xs">
                <Building2 className="h-3.5 w-3.5" />
              </div>
            </div>
            {data.scope.centers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No centers linked</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.scope.centers.map((cnt, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 border border-teal-200 shadow-xs">
                    {cnt.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Academic Years Scope */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Years</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600 shadow-xs">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
            {data.scope.academicYears.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active sessions</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.scope.academicYears.map((ay, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-mono font-bold text-rose-700 border border-rose-200 shadow-xs">
                    {ay.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Batch Supervision */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Batch Supervision</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600 shadow-xs">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {data.inChargeBatches.length > 0 
                ? `${data.inChargeBatches.length} Assigned Class ${data.inChargeBatches.length === 1 ? 'Batch' : 'Batches'}`
                : 'No Batch Class In-Charge assigned'}
            </p>
            <span className="text-xs text-slate-400">Serving as Class Homeroom Teacher</span>
          </div>
        </div>
      </section>

      {/* Section A: Assigned Teaching Subjects Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Assigned Curriculum Subjects</h2>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200 shadow-xs">
                {data.assignedSubjects.length} Subjects
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Subjects assigned to you across course curriculum levels.
            </p>
          </div>
        </div>

        {data.assignedSubjects.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No subjects assigned yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">Assigned subjects will be displayed once designated by administration.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Subject Code</th>
                  <th className="px-5 py-3.5">Course</th>
                  <th className="px-5 py-3.5">Level / Semester</th>
                  <th className="px-5 py-3.5">Program</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.assignedSubjects.map((subj) => (
                  <tr key={subj.id} className="transition-colors hover:bg-indigo-50/30">
                    {/* Subject Name with Icon Box */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-800">{subj.subjectName}</span>
                      </div>
                    </td>

                    {/* Highlighted Subject Code */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 border border-indigo-200 shadow-xs">
                        {subj.subjectCode}
                      </span>
                    </td>

                    {/* Course */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{subj.courseName}</span>
                        {subj.courseCode && (
                          <span className="text-[11px] font-mono text-slate-400">{subj.courseCode}</span>
                        )}
                      </div>
                    </td>

                    {/* Level / Semester */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-mono font-bold text-sky-700 border border-sky-200 shadow-xs">
                        {subj.levelName}
                      </span>
                    </td>

                    {/* Program */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-600">
                        {subj.programName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section B: In-Charge Batches (Class Teacher Role) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Designated In-Charge Batches</h2>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-xs">
                {data.inChargeBatches.length} Batches
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Batches where you are designated as the Class / Homeroom Teacher.
            </p>
          </div>
        </div>

        {data.inChargeBatches.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <BookMarked className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No batches currently assigned.</p>
            <p className="text-xs text-slate-400 mt-0.5">You will see batches listed here when assigned as class teacher.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Batch Name</th>
                  <th className="px-5 py-3.5">Course</th>
                  <th className="px-5 py-3.5">Level / Semester</th>
                  <th className="px-5 py-3.5">Center / Campus</th>
                  <th className="px-5 py-3.5">Academic Year</th>
                  <th className="px-5 py-3.5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.inChargeBatches.map((batch) => (
                  <tr key={batch.id} className="transition-colors hover:bg-emerald-50/30">
                    {/* Batch Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs">
                          <BookMarked className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-800">{batch.name}</span>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-800">{batch.courseName}</span>
                    </td>

                    {/* Level / Semester */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-mono font-bold text-sky-700 border border-sky-200 shadow-xs">
                        {batch.levelName}
                      </span>
                    </td>

                    {/* Center */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-700">{batch.centerName}</span>
                    </td>

                    {/* Academic Year */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-mono font-medium text-rose-700 border border-rose-200 shadow-xs">
                        {batch.academicYearName}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Batch In-Charge
                      </span>
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

export default TeacherDashboard;
