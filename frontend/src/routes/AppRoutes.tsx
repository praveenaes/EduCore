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
import StudentDashboard from '../pages/student/StudentDashboard';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { UserRoleEnum } from '../types/auth';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { StudentSettingsPage } from '../pages/settings/StudentSettingsPage';
import { TeacherSettingsPage } from '../pages/settings/TeacherSettingsPage';

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
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<div className="p-6 space-y-4"><h1 className="text-2xl font-bold tracking-tight text-neutral-800">Attendance</h1><p className="text-sm text-neutral-500">Attendance — coming soon</p></div>} />
        <Route path="results" element={<div className="p-6 space-y-4"><h1 className="text-2xl font-bold tracking-tight text-neutral-800">Results</h1><p className="text-sm text-neutral-500">Results — coming soon</p></div>} />
        <Route path="fees" element={<div className="p-6 space-y-4"><h1 className="text-2xl font-bold tracking-tight text-neutral-800">Fees</h1><p className="text-sm text-neutral-500">Fees — coming soon</p></div>} />
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
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="classes" element={<div className="p-6 space-y-4"><h1 className="text-2xl font-bold tracking-tight text-neutral-800">Classes</h1><p className="text-sm text-neutral-500">Classes — coming soon</p></div>} />
        <Route path="attendance" element={<div className="p-6 space-y-4"><h1 className="text-2xl font-bold tracking-tight text-neutral-800">Attendance</h1><p className="text-sm text-neutral-500">Attendance — coming soon</p></div>} />
        <Route path="marks" element={<div className="p-6 space-y-4"><h1 className="text-2xl font-bold tracking-tight text-neutral-800">Marks</h1><p className="text-sm text-neutral-500">Marks — coming soon</p></div>} />
        <Route path="homework" element={<div className="p-6 space-y-4"><h1 className="text-2xl font-bold tracking-tight text-neutral-800">Homework</h1><p className="text-sm text-neutral-500">Homework — coming soon</p></div>} />
        <Route path="settings" element={<TeacherSettingsPage />} />
        <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
