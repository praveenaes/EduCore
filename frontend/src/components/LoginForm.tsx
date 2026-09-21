import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { UserRole } from "../domain/enums/UserRole";
import { API_ROUTES } from "../api/apiRoutes";

interface LoginFormProps {
  role: UserRole;
  emailPlaceholder: string;
  onLoginSuccess: (userInfo: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  emailPlaceholder,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(API_ROUTES.AUTH.LOGIN, {
        email,
        password,
        role,
      });

      if (response.data.success) {
        onLoginSuccess(response.data.user);
      } else {
        setError(response.data.error || "Login failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        "Something went wrong. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-600">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailPlaceholder}
              className="mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-600">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-[0.98]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
};
