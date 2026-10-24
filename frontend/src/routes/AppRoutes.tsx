import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/landing/LandingPage';
import { AdminLogin } from '../pages/admin/AdminLogin';
import { TeacherLogin } from '../pages/teacher/TeacherLogin';
import { StudentLogin } from '../pages/student/StudentLogin';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from '../pages/auth/VerifyOtpPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { Dashboard } from '../pages/admin/Dashboard';
import { AdminLayout } from '../layouts/AdminLayout';
import StudentsPage from '../pages/admin/StudentsPage';
import TeachersPage from '../pages/admin/TeachersPage';
import { StudentLayout } from '../layouts/StudentLayout';
import { TeacherLayout } from '../layouts/TeacherLayout';
// import StudentDashboard from '../pages/student/StudentDashboard';
// import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { UserRoleEnum } from '../types/auth';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { StudentSettingsPage } from '../pages/settings/StudentSettingsPage';
import { TeacherSettingsPage } from '../pages/settings/TeacherSettingsPage';
import ProgramsPage from '../pages/admin/ProgramsPage';
import CoursesPage from '../pages/admin/CoursesPage';
import SubjectsPage from '../pages/admin/SubjectsPage';
import CentersPage from '../pages/admin/CentersPage';
import AcademicYearsPage from '../pages/admin/AcademicYearsPage';
import SubjectAssignmentsPage from '../pages/admin/SubjectAssignmentsPage';
import BatchesPage from '../pages/admin/BatchesPage';
import AssessmentsPage from '../pages/admin/AssessmentsPage';
import AssessmentCriteriaPage from '../pages/admin/AssessmentCriteriaPage';
import AssessmentSchedulesPage from '../pages/admin/AssessmentSchedulesPage';
import TeacherBatchesPage from '../pages/teacher/TeacherBatchesPage';
import TeacherSubjectsPage from '../pages/teacher/TeacherSubjectsPage';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage';
import TeacherHomeworkPage from '../pages/teacher/TeacherHomeworkPage';
import StudentHomeworkPage from '../pages/student/StudentHomeworkPage';
import StudentResultsPage from '../pages/student/StudentResultsPage';
import TeacherMarkEntryPage from '../pages/teacher/TeacherMarkEntryPage';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6 space-y-4">
    <h1 className="text-2xl font-bold tracking-tight text-neutral-800">{title}</h1>
    <p className="text-sm text-neutral-500">{title} — coming soon</p>
  </div>
);

export const AppRoutes: React.FC = () => {//Creates a React Functional Component.returns JSX.
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/teacher/login"
        element={
          <PublicRoute>
            <TeacherLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/student/login"
        element={
          <PublicRoute>
            <StudentLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/verify-otp"
        element={
          <PublicRoute>
            <VerifyOtpPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role={UserRoleEnum.ADMIN}>
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="batches" element={<BatchesPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="assessments/results" element={<TeacherMarkEntryPage />} />
        <Route path="assessments/schedules" element={<AssessmentSchedulesPage />} />
        <Route path="assessments/criteria" element={<AssessmentCriteriaPage />} />
        <Route path="subject-assignments" element={<SubjectAssignmentsPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="academic-years" element={<AcademicYearsPage />} />
        <Route path="centers" element={<CentersPage />} />
        <Route path="fees" element={<PlaceholderPage title="Fees" />} />
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Protected Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role={UserRoleEnum.STUDENT}>
              <StudentLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="homework" element={<StudentHomeworkPage />} />
        <Route path="attendance" element={<StudentAttendancePage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="chat" element={<PlaceholderPage title="Chat" />} />
        <Route path="fees" element={<PlaceholderPage title="Fees" />} />
        <Route path="settings" element={<StudentSettingsPage />} />
        <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      {/* Protected Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role={UserRoleEnum.TEACHER}>
              <TeacherLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="homework" element={<TeacherHomeworkPage />} />
        <Route path="batches" element={<TeacherBatchesPage />} />
        <Route path="subjects" element={<TeacherSubjectsPage />} />
        <Route path="mark-entry" element={<TeacherMarkEntryPage />} />
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="chat" element={<PlaceholderPage title="Chat" />} />
        <Route path="settings" element={<TeacherSettingsPage />} />
        <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
