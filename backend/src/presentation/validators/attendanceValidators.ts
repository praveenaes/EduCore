import { z } from 'zod';

export const createBatchAttendanceSchema = z.object({
  batchId: z.string().trim().min(1, 'Batch ID is required'),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  attendances: z
    .array(
      z.object({
        studentId: z.string().trim().min(1, 'Student ID is required'),
        firstHalf: z.enum(['present', 'absent']),
        secondHalf: z.enum(['present', 'absent']),
        remarks: z.string().trim().max(255).optional(),
      })
    )
    .min(1, 'At least one student attendance record is required'),
});

export const updateBatchAttendanceSchema = z.object({
  batchId: z.string().trim().min(1, 'Batch ID is required'),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  attendances: z
    .array(
      z.object({
        studentId: z.string().trim().min(1, 'Student ID is required'),
        firstHalf: z.enum(['present', 'absent']),
        secondHalf: z.enum(['present', 'absent']),
        remarks: z.string().trim().max(255).optional(),
      })
    )
    .min(1, 'At least one student attendance record is required'),
});
