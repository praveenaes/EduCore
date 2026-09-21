import { z } from "zod";

export const createCourseSchema = z.object({
  programId: z
    .string()
    .trim()
    .min(1, "Program ID is required"),
  name: z
    .string()
    .trim()
    .min(2, "Course name must be at least 2 characters")
    .max(100, "Course name must be at most 100 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must be at most 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Code must be alphanumeric with optional hyphens only")
    .transform((val) => val.toUpperCase()),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .default(""),
  durationMonths: z.coerce
    .number()
    .int("Duration must be a whole number of months")
    .min(1, "Duration must be at least 1 month")
    .max(60, "Duration cannot exceed 60 months")
    .optional(),
  levelName: z
    .string()
    .trim()
    .min(1, "Level name is required")
    .max(30, "Level name must be at most 30 characters"),
  levelCount: z.coerce
    .number()
    .int("Level count must be a whole number")
    .min(1, "Course must have at least 1 level")
    .max(10, "Level count cannot exceed 10"),
});

export const updateCourseSchema = z.object({
  programId: z
    .string()
    .trim()
    .min(1, "Program ID is required")
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, "Course name must be at least 2 characters")
    .max(100, "Course name must be at most 100 characters")
    .optional(),
  code: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must be at most 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Code must be alphanumeric with optional hyphens only")
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  durationMonths: z.coerce
    .number()
    .int("Duration must be a whole number of months")
    .min(1, "Duration must be at least 1 month")
    .max(60, "Duration cannot exceed 60 months")
    .optional(),
  levelName: z
    .string()
    .trim()
    .min(1, "Level name is required")
    .max(30, "Level name must be at most 30 characters")
    .optional(),
  levelCount: z.coerce
    .number()
    .int("Level count must be a whole number")
    .min(1, "Course must have at least 1 level")
    .max(10, "Level count cannot exceed 10")
    .optional(),
});
