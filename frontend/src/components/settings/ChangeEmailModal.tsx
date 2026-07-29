import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { Input } from "../Input";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  sendEmailChangeOtpApi,
  verifyEmailChangeOtpApi,
  changeEmailApi,
} from "../../api/settingsApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updateUserEmail } from "../../app/slices/authSlice";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const step2Schema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

const step3Schema = z
  .object({
    newEmail: z
      .string()
      .trim()
      .min(1, "New email is required")
      .email("Invalid email address")
      .toLowerCase(),
    confirmNewEmail: z
      .string()
      .trim()
      .min(1, "Confirm email is required")
      .email("Invalid email address")
      .toLowerCase(),
  })
  .refine((data) => data.newEmail === data.confirmNewEmail, {
    message: "Email addresses do not match.",
    path: ["confirmNewEmail"],
  });

type Step2FormValues = z.infer<typeof step2Schema>;
type Step3FormValues = z.infer<typeof step3Schema>;

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const currentEmail = user?.email || "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [emailChangeToken, setEmailChangeToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Form for Step 2
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    reset: resetStep2,
    formState: { errors: errorsStep2 },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: "" },
    mode: "onTouched",
  });

  // Form for Step 3
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    reset: resetStep3,
    formState: { errors: errorsStep3 },
  } = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: { newEmail: "", confirmNewEmail: "" },
    mode: "onTouched",
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleClose = () => {
    setStep(1);
    setLoading(false);
    setApiError(null);
    setApiSuccess(null);
    setEmailChangeToken(null);
    setCountdown(0);
    resetStep2();
    resetStep3();
    onClose();
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      await sendEmailChangeOtpApi();
      setApiSuccess("OTP has been sent to your current email address.");
      setCountdown(60);
      setStep(2);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setApiError(axiosError.response?.data?.message ?? "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      await sendEmailChangeOtpApi();
      setApiSuccess("A fresh OTP has been sent to your current email address.");
      setCountdown(60);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setApiError(axiosError.response?.data?.message ?? "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtpSubmit = async (data: Step2FormValues) => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const response = await verifyEmailChangeOtpApi(data.otp);
      setEmailChangeToken(response.data.emailChangeToken);
      setStep(3);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setApiError(axiosError.response?.data?.message ?? "Incorrect OTP code or expired.");
    } finally {
      setLoading(false);
    }
  };

  const onChangeEmailSubmit = async (data: Step3FormValues) => {
    if (!emailChangeToken) {
      setApiError("Verification token missing. Please restart the process.");
      return;
    }

    if (data.newEmail === currentEmail) {
      setApiError("New email must be different from your current email.");
      return;
    }

    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      await changeEmailApi({
        newEmail: data.newEmail,
        confirmNewEmail: data.confirmNewEmail,
        emailChangeToken,
      });
      // Update Redux state immediately
      dispatch(updateUserEmail(data.newEmail));
      setApiSuccess("Email address updated successfully.");
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setApiError(
        axiosError.response?.data?.message ?? "Failed to update email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Email Address"
      icon={<Mail className="h-5 w-5" />}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {step === 1 && (
            <Button variant="primary" size="sm" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          )}
          {step === 2 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitStep2(onVerifyOtpSubmit)}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          )}
          {step === 3 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitStep3(onChangeEmailSubmit)}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Email"}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between border-b pb-3 text-xs font-semibold text-neutral-400">
          <div className={`flex items-center gap-1 ${step >= 1 ? "text-brand-600" : ""}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 border text-[10px]">
              1
            </span>
            <span>Verify Current</span>
          </div>
          <ArrowRight className="h-3 w-3" />
          <div className={`flex items-center gap-1 ${step >= 2 ? "text-brand-600" : ""}`}>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${step >= 2 ? "bg-brand-50" : ""}`}
            >
              2
            </span>
            <span>Enter OTP</span>
          </div>
          <ArrowRight className="h-3 w-3" />
          <div className={`flex items-center gap-1 ${step >= 3 ? "text-brand-600" : ""}`}>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${step >= 3 ? "bg-brand-50" : ""}`}
            >
              3
            </span>
            <span>New Email</span>
          </div>
        </div>

        {apiError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {apiError}
          </div>
        )}

        {apiSuccess && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{apiSuccess}</span>
          </div>
        )}

        {/* STEP 1: Current Email Display */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">
              To change your email address, we must first verify your identity by sending a 6-digit
              OTP code to your currently registered email address.
            </p>
            <div className="rounded-lg bg-neutral-50 border p-4">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Current Email Address
              </label>
              <p className="mt-1 text-sm font-semibold text-neutral-700">{currentEmail}</p>
            </div>
          </div>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleSubmitStep2(onVerifyOtpSubmit)} className="space-y-4">
            <p className="text-sm text-neutral-500">
              Please enter the 6-digit OTP code sent to{" "}
              <span className="font-semibold text-neutral-700">{currentEmail}</span>.
            </p>
            <Input
              label="Verification Code (OTP)"
              type="text"
              maxLength={6}
              placeholder="e.g. 123456"
              disabled={loading}
              error={errorsStep2.otp?.message}
              {...registerStep2("otp")}
              className="text-center tracking-[0.5em] text-lg font-bold placeholder:tracking-normal placeholder:font-normal"
            />
            <div className="flex items-center justify-center text-sm">
              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleResendOtp}
                className={`font-semibold transition-colors ${
                  countdown > 0
                    ? "text-neutral-400 cursor-not-allowed"
                    : "text-brand-600 hover:text-brand-700"
                }`}
              >
                {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend OTP Code"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Change Email */}
        {step === 3 && (
          <form onSubmit={handleSubmitStep3(onChangeEmailSubmit)} className="space-y-4">
            <Input
              label="New Email Address"
              type="email"
              placeholder="e.g. newemail@example.com"
              disabled={loading}
              error={errorsStep3.newEmail?.message}
              {...registerStep3("newEmail")}
            />
            <Input
              label="Confirm New Email Address"
              type="email"
              placeholder="Confirm your new email address"
              disabled={loading}
              error={errorsStep3.confirmNewEmail?.message}
              {...registerStep3("confirmNewEmail")}
            />
          </form>
        )}
      </div>
    </Modal>
  );
};
