import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .transform((val) => val.trim());

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");
