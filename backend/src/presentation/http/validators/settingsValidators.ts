import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .regex(/^[a-zA-Z\s]+$/, "Organization name must contain only letters and spaces"),
  removeLogo: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmNewPassword: z.string().min(1, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "New password cannot be the same as the current password",
  path: ["newPassword"],
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address").toLowerCase(),
  confirmNewEmail: z.string().email("Invalid email address").toLowerCase(),
  emailChangeToken: z.string().min(1, "Email change token is required"),
}).refine((data) => data.newEmail === data.confirmNewEmail, {
  message: "Emails do not match",
  path: ["confirmNewEmail"],
});

export const verifyEmailChangeOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});
