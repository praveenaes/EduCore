import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  Home,
  Check,
  BookOpen,
  Calendar,
  Layers,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-900">
              Edu<span className="text-brand-500">Core</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-neutral-600 hover:text-brand-500 cursor-pointer transition-colors duration-200">
            <Home className="h-5 w-5" />
            <span className="text-sm font-semibold">Home</span>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:leading-[1.15]">
                Manage Your School <br />
                Smarter with <span className="text-brand-500">EduCore</span>
              </h1>
              <p className="text-base text-slate-500 leading-relaxed max-w-lg">
                A centralized platform for managing students, teachers, attendance, assessments, academic records, and
                communication — all in one place.
              </p>
            </div>

            {/* Portal Buttons */}
            <div className="space-y-4">
              {/* Admin Login */}
              <div
                onClick={() => navigate('/admin/login')}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-brand-500/30 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Admin Login</h3>
                    <p className="text-xs text-slate-400">Manage school operations</p>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>

              {/* Student Login */}
              <div
                onClick={() => navigate('/student/login')}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-brand-500/30 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Student Login</h3>
                    <p className="text-xs text-slate-400">Access your classes and progress</p>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>

              {/* Teacher Login */}
              <div
                onClick={() => navigate('/teacher/login')}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-brand-500/30 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Teacher Login</h3>
                    <p className="text-xs text-slate-400">Manage classes and track performance</p>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Dashboard Mockup */}
          <div className="lg:col-span-7 bg-[#0f172a] rounded-[24px] p-5 shadow-2xl border border-slate-800 overflow-hidden relative group">
            {/* Top Bar Mock */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold">EC</div>
                <span className="text-sm font-bold text-white">EduCore</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span>Dashboard</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300 font-semibold">Good morning, Admin</span>
              </div>
            </div>

            {/* Inner Content Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="hidden md:block md:col-span-1 space-y-2 border-r border-slate-800 pr-3">
                <div className="bg-brand-500/10 text-brand-400 px-3 py-1.5 rounded-lg text-xs font-semibold">Dashboard</div>
                <div className="text-slate-400 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/50">Students</div>
                <div className="text-slate-400 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/50">Teachers</div>
                <div className="text-slate-400 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/50">Attendance</div>
                <div className="text-slate-400 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/50">Exams</div>
                <div className="text-slate-400 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/50">Grades</div>
              </div>

              <div className="md:col-span-3 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Students</span>
                    <span className="text-lg font-bold text-white block mt-1">1,256</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">+12% this week</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Teachers</span>
                    <span className="text-lg font-bold text-white block mt-1">78</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">+5 this week</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Attendance</span>
                    <span className="text-lg font-bold text-white block mt-1">92.5%</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">+4.2%</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Exams</span>
                    <span className="text-lg font-bold text-white block mt-1">24</span>
                    <span className="text-[10px] text-slate-400">This Month</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl sm:col-span-2 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Attendance Overview</span>
                    <div className="h-28 w-full flex items-end justify-between gap-1 pt-4">
                      <div className="h-[30%] w-full bg-slate-800 rounded"></div>
                      <div className="h-[50%] w-full bg-slate-800 rounded"></div>
                      <div className="h-[45%] w-full bg-slate-800 rounded"></div>
                      <div className="h-[75%] w-full bg-brand-500 rounded"></div>
                      <div className="h-[60%] w-full bg-slate-800 rounded"></div>
                      <div className="h-[85%] w-full bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Performance</span>
                    <div className="flex items-center justify-center h-28">
                      <div className="relative h-20 w-20 rounded-full border-8 border-brand-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODULES GRID ─── */}
      <section className="bg-white border-t border-slate-200/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Everything You Need to Run Your School Smoothly
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              EduCore matches modern administrative tasks with responsive tools designed for schools of all scales.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-brand-500/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Student Management</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Complete student records including admission info, parents profile data, status configuration, and quick exporting tools.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-brand-500/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Teacher Management</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Configure teacher profiles, manage courses assigned, log experience statistics, and handle login status controls.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-brand-500/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Attendance Tracking</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Simplified daily attendance registration for classes. Track absences and view instant metrics directly.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-brand-500/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Assessments & Results</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Log marks, submit final reports, update evaluations, and coordinate exam timing dynamically.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-brand-500/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Communication Hub</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Instantly coordinate school announcements, alerts, reminders, and updates for staff and parents.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-brand-500/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Analytics & Reports</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Generate dynamic csv metrics, track overall billing reports, and monitor school progress trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS & BENEFITS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left - How it Works */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">How EduCore Works</h2>
              <p className="text-slate-500 text-sm mt-2">Get started and manage your school in four simple steps.</p>
            </div>

            <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
              <div className="relative">
                <div className="absolute -left-[41px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold ring-4 ring-slate-50">1</div>
                <h4 className="font-bold text-slate-900">Set up your profile</h4>
                <p className="text-slate-500 text-xs mt-1">Configure your organization information, logo branding, and default setups.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold ring-4 ring-slate-50">2</div>
                <h4 className="font-bold text-slate-900">Add students and teachers</h4>
                <p className="text-slate-500 text-xs mt-1">Easily populate teacher credentials and register students with formatted identification codes.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold ring-4 ring-slate-50">3</div>
                <h4 className="font-bold text-slate-900">Manage attendance and assessments</h4>
                <p className="text-slate-500 text-xs mt-1">Submit daily class registers, record marks, and communicate reports seamlessly.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold ring-4 ring-slate-50">4</div>
                <h4 className="font-bold text-slate-900">Monitor progress and generate reports</h4>
                <p className="text-slate-500 text-xs mt-1">Inspect performance metrics and export student list sheets cleanly.</p>
              </div>
            </div>
          </div>

          {/* Right - Benefits list */}
          <div className="bg-slate-950/95 text-white p-8 rounded-3xl relative overflow-hidden shadow-lg border border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Platform Benefits</h3>
              <ul className="space-y-4">
                {[
                  'Reduce administrative workload',
                  'Improve operational efficiency',
                  'Centralize academic information',
                  'Make informed decisions with real-time insights',
                  'Enhance communication across the school community',
                  'Secure and organized record management',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Organization Logo</span>
                  <span className="text-xs text-slate-500 block">Cloudinary Managed</span>
                </div>
              </div>
              <div className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-semibold">Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ROLE-BASED DASHBOARD LINK CARDS ─── */}
      <section className="bg-white border-t border-b border-slate-200/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">Role-Based Experience</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              Customized viewports for everyone in your organization, from operations to final evaluations.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900">Administrator Dashboard</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Oversee all operational entities. Manage student database codes, activate profiles, customize email SMTP, and view audits.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                Explore Admin Dashboard <ArrowRight className="h-3 w-3" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900">Teacher Dashboard</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Log in to record attendance. Update homework descriptions, evaluate results, write student review logs, and chat.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-purple-600 cursor-pointer hover:underline">
                Explore Teacher Dashboard <ArrowRight className="h-3 w-3" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900">Student Dashboard</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Check your monthly attendance scores. Review grades logs, verify status parameters, and change account emails.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 cursor-pointer hover:underline">
                Explore Student Dashboard <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EFFICIENCY SHOWCASE ─── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              Beautiful Dashboard <br /> Built for Efficiency
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              Get a complete overview of your school in real-time with intuitive dashboards and powerful insights.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Students</span>
                  <span className="text-xl font-bold text-slate-900 block mt-1">1,256</span>
                </div>
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Teachers</span>
                  <span className="text-xl font-bold text-slate-900 block mt-1">78</span>
                </div>
                <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Monthly Attendance</span>
                <span className="text-[10px] text-slate-400">Jan - Jun</span>
              </div>
              <div className="h-20 w-full flex items-end justify-between gap-3 pt-2">
                <div className="h-[40%] w-full bg-slate-100 rounded-t-sm"></div>
                <div className="h-[55%] w-full bg-slate-100 rounded-t-sm"></div>
                <div className="h-[80%] w-full bg-brand-500 rounded-t-sm"></div>
                <div className="h-[70%] w-full bg-slate-100 rounded-t-sm"></div>
                <div className="h-[85%] w-full bg-slate-100 rounded-t-sm"></div>
                <div className="h-[90%] w-full bg-slate-100 rounded-t-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLUE STATS BANNER ─── */}
      <section className="bg-brand-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-extrabold">5,250+</div>
              <div className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Students Managed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold">98,400+</div>
              <div className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Attendance Records</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold">12,850+</div>
              <div className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Assessments Completed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold">3,450+</div>
              <div className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Reports Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="h-6 w-6 text-brand-500" />
              <span className="font-bold text-lg">EduCore</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              EduCore is a comprehensive school management platform designed to simplify administrative tasks and enhance academic excellence.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-sm">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white cursor-pointer">Home</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-sm">Support</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white cursor-pointer">Help Center</li>
              <li className="hover:text-white cursor-pointer">Documentation</li>
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer">Terms of Service</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-sm">Connect</h5>
            <ul className="space-y-2 text-xs">
              <li>support@educore.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>&copy; 2024 EduCore. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
