import React from "react";
import { useNavigate } from "react-router-dom";

export const PortalSelection: React.FC = () => {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Admin Portal",
      description: "Manage users, seed settings, and configure the core system statistics.",
      icon: "🔑",
      path: "/admin/login",
    },
    {
      title: "Teacher Portal",
      description: "Manage classes, track student progress, and organize course structures.",
      icon: "📚",
      path: "/teacher/login",
    },
    {
      title: "Student Portal",
      description: "View dashboard results, check attendance, and interact with course materials.",
      icon: "🎓",
      path: "/student/login",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white font-extrabold text-3xl shadow-sm">
            E
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-neutral-800 sm:text-5xl">
            EduCore Portal
          </h1>
          <p className="mt-3 text-lg text-neutral-500 max-w-md mx-auto">
            Choose your gateway to log in and access your personalized educational workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {portals.map((portal) => (
            <button
              key={portal.title}
              onClick={() => navigate(portal.path)}
              className="flex flex-col text-left h-full p-8 rounded-3xl bg-white border border-neutral-200/60 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-transparent group focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 text-2xl group-hover:scale-110 transition-transform duration-300">
                {portal.icon}
              </div>
              <h3 className="mt-6 text-xl font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors duration-200">
                {portal.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-500 leading-relaxed flex-grow">
                {portal.description}
              </p>
              <div className="mt-6 flex items-center text-xs font-semibold uppercase tracking-wider text-indigo-600 group-hover:translate-x-1.5 transition-transform duration-300">
                <span>Enter Portal</span>
                <svg
                  className="ml-1.5 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
