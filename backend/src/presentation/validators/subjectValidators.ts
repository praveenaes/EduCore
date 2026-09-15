import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(100, "Subject name must be at most 100 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Subject code must be at least 2 characters")
    .max(20, "Subject code must be at most 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Code must be alphanumeric with optional hyphens only")
    .transform((val) => val.toUpperCase()),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must be at most 500 characters"),
});

export const updateSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(100, "Subject name must be at most 100 characters")
    .optional(),
  code: z
    .string()
    .trim()
    .min(2, "Subject code must be at least 2 characters")
    .max(20, "Subject code must be at most 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Code must be alphanumeric with optional hyphens only")
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must be at most 500 characters")
    .optional(),
});
