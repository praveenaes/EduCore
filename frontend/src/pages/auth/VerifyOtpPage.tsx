import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyOtpValidationSchema } from "../../validators/authValidator";
import { verifyOtpApi, forgotPasswordApi } from "../../api/authApi";
import { ArrowLeft } from "lucide-react";
import { UserRoleEnum } from "../../types/auth";

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || UserRoleEnum.ADMIN;
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Timer states (60 seconds = 1 minute)
  const [timeLeft, setTimeLeft] = useState(60);
  const canResend = timeLeft <= 0;

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const validate = (): boolean => {
    try {
      verifyOtpValidationSchema.validateSync({ otp }, { abortEarly: false });
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
    setSuccessMessage(null);

    try {
      const response = await verifyOtpApi(email, otp);
      if (response.success && response.data?.resetToken) {
        navigate(`/auth/reset-password?email=${encodeURIComponent(email)}&token=${response.data.resetToken}&role=${role}`);
      } else {
        setError(response.message || "Failed to verify OTP");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid or expired OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPasswordApi(email);
      if (response.success) {
        setSuccessMessage("A new OTP has been generated and sent.");
        setTimeLeft(60);
        setOtp(""); // Clear previous input
      } else {
        setError(response.message || "Failed to resend OTP");
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string; message?: string } } };
      const message =
        errorObj.response?.data?.error ||
        errorObj.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      setError(message);
    } finally {
      setResending(false);
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
            Verify OTP
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            We sent a 6-digit verification code to <span className="font-semibold text-neutral-700">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger border border-danger/20">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-success/10 p-3 text-sm text-success border border-success/20">
              {successMessage}
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-neutral-600">
              Verification Code (OTP)
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // Allow only digits
                setOtp(val);
                if (fieldError) setFieldError(null);
              }}
              placeholder="000000"
              disabled={loading}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-center text-lg font-bold tracking-widest text-neutral-800 placeholder-neutral-350 focus:outline-none focus:ring-2 transition-all duration-200 ${
                fieldError
                  ? "border-danger focus:border-danger focus:ring-danger/20"
                  : "border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
              }`}
            />
            {fieldError && (
              <p className="mt-1 text-xs text-danger font-medium text-center">{fieldError}</p>
            )}

            {/* Timer and Resend Action */}
            <div className="flex flex-col items-center justify-center space-y-2 mt-4 pt-2 border-t border-neutral-100">
              {timeLeft > 0 ? (
                <p className="text-xs text-neutral-500">
                  OTP expires in <span className="font-semibold text-brand-600">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-xs text-danger font-semibold">
                  OTP expired
                </p>
              )}

              <button
                type="button"
                disabled={!canResend || resending}
                onClick={handleResendOtp}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 disabled:text-neutral-400 disabled:font-medium disabled:cursor-not-allowed transition-all duration-150"
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || timeLeft <= 0}
              className="group relative flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/auth/forgot-password?role=${role}`)}
              className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-700 py-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Email Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default VerifyOtpPage;
