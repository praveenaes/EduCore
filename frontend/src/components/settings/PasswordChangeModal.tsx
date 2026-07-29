import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { Input } from "../Input";
import { Shield, CheckCircle2 } from "lucide-react";
import { changePasswordApi } from "../../api/settingsApi";

const changePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password cannot be the same as the current password.",
    path: ["newPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      await changePasswordApi({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setApiSuccess("Password changed successfully.");
      reset();
      setTimeout(() => {
        setApiSuccess(null);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setApiError(
        axiosError.response?.data?.message ?? "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setApiError(null);
    setApiSuccess(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      icon={<Shield className="h-5 w-5" />}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {apiSuccess && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{apiSuccess}</span>
          </div>
        )}

        {apiError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {apiError}
          </div>
        )}

        <Input
          label="Current Password"
          type="password"
          {...register("oldPassword")}
          disabled={loading}
          error={errors.oldPassword?.message}
          placeholder="Enter your current password"
        />

        <Input
          label="New Password"
          type="password"
          {...register("newPassword")}
          disabled={loading}
          error={errors.newPassword?.message}
          placeholder="Enter a strong password"
        />

        <Input
          label="Confirm New Password"
          type="password"
          {...register("confirmPassword")}
          disabled={loading}
          error={errors.confirmPassword?.message}
          placeholder="Re-enter your new password"
        />

        <p className="text-xs text-neutral-400">
          After changing your password, you will be logged out of all sessions and redirected to the
          login page.
        </p>
      </form>
    </Modal>
  );
};
