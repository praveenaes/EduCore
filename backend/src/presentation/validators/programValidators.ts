import { z } from "zod";

export const createProgramSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Program name must be at least 2 characters")
    .max(100, "Program name must be at most 100 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Program code must be at least 2 characters")
    .max(20, "Program code must be at most 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Code must be alphanumeric with optional hyphens only")
    .transform((val) => val.toUpperCase()),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

export const updateProgramSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Program name must be at least 2 characters")
    .max(100, "Program name must be at most 100 characters")
    .optional(),
  code: z
    .string()
    .trim()
    .min(2, "Program code must be at least 2 characters")
    .max(20, "Program code must be at most 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Code must be alphanumeric with optional hyphens only")
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});