import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { resetPasswordValidationSchema } from "../../utils/validators";
import { resetPasswordApi } from "../../api/authApi";
import { tokenService } from "../../utils/tokenService";
import { loadUser } from "../../app/authThunk";
import { setOrganization } from "../../app/slices/organizationSlice";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { UserRoleEnum } from "../../types/auth";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const role = searchParams.get("role") || UserRoleEnum.ADMIN;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = (): boolean => {
    try {
      resetPasswordValidationSchema.validateSync(
        { password, confirmPassword },
        { abortEarly: false }
      );
      setFieldErrors({});
      return true;
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const tempErrors: { password?: string; confirmPassword?: string } = {};
        err.inner.forEach((validationError: any) => {
          if (validationError.path) {
            tempErrors[validationError.path as "password" | "confirmPassword"] = validationError.message;
          }
        });
        setFieldErrors(tempErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Submit reset password request
      const response = await resetPasswordApi(email, password, token);

      if (response.success && response.data?.accessToken) {
        // 2. Save new token
        tokenService.setToken(response.data.accessToken);

        // 3. Auto-login by loading the authenticated user details
        const resultAction = await dispatch(loadUser());

        if (loadUser.fulfilled.match(resultAction)) {
          // Initialize school organization details
          dispatch(
            setOrganization({
              name: "EduCore School",
            })
          );
          // 4. Redirect directly to the dashboard
          navigate(`/${role}/dashboard`);
        } else {
          // Fallback to login page if token load fails
          navigate(`/${role}/login`);
        }
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to reset password. Please request a new OTP.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-neutral-200/50 hover:shadow-md transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-2xl shadow-sm">
            E
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-neutral-800 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Set a new secure password for <span className="font-semibold text-neutral-700">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger border border-danger/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-600">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.password
                      ? "border-danger focus:border-danger focus:ring-danger/20"
                      : "border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-600">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.confirmPassword
                      ? "border-danger focus:border-danger focus:ring-danger/20"
                      : "border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/auth/forgot-password?role=${role}`)}
              className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-700 py-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Start</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
