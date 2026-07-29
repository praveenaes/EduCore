import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { UserRoleEnum } from "../types/auth";

interface PublicRouteProps {
  children: React.ReactNode;//Any valid thing that React can render.
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  //This component accepts props matching PublicRouteProps
  //PublicRoute has the type React.FC<PublicRouteProps>
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  // spin
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
  switch (user.role) {
    case UserRoleEnum.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;

    case UserRoleEnum.TEACHER:
      return <Navigate to="/teacher/dashboard" replace />;

    case UserRoleEnum.STUDENT:
      return <Navigate to="/student/dashboard" replace />;

    default:
      return <Navigate to="/" replace />;
  }
}

  return <>{children}</>;
};
export default PublicRoute;

//In React Router, replace is a prop used with <Navigate /> that controls the browser's history.
//This replaces the current history entry instead of adding a new one.
//Now if the user clicks Back, they won't go back to /admin/login because it was replaced