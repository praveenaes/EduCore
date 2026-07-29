import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { forgotPasswordValidationSchema } from "../../utils/validators";
import { forgotPasswordApi } from "../../api/authApi";
import { UserRoleEnum } from "../../types/auth";

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || UserRoleEnum.ADMIN;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const validate = (): boolean => {
    try {
      forgotPasswordValidationSchema.validateSync({ email }, { abortEarly: false });
      setFieldError(null);
      return true;
    } catch (err: any) {
      if (err.name === "ValidationError") {
        setFieldError(err.errors[0]);
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
      const response = await forgotPasswordApi(email);
      if (response.success) {
        navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}&role=${role}`);
      } else {
        setError(response.message || "Failed to initiate password reset");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to initiate password reset. Please try again.";
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
            Forgot Password
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your email to receive a password reset OTP
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-600">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError(null);
              }}
              placeholder={`your-email@educore.com`}
              disabled={loading}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                fieldError
                  ? "border-danger focus:border-danger focus:ring-danger/20"
                  : "border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
              }`}
            />
            {fieldError && (
              <p className="mt-1 text-xs text-danger font-medium">{fieldError}</p>
            )}
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
                  <span>Sending OTP...</span>
                </div>
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
