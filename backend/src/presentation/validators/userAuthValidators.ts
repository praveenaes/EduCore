import { z } from "zod";
import { emailSchema, passwordSchema } from "./baseValidators";
import { UserRole } from "@/domain/enums/UserRole";

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Invalid user role" }),
  }),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Invalid user role" }),
  }).optional(),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
  role: z.nativeEnum(UserRole).optional(),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  resetToken: z.string(),
  role: z.nativeEnum(UserRole).optional(),
});
