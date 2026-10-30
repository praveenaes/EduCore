import { z } from 'zod';

const studentMarkItemSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .trim()
    .min(1, 'Student ID is required'),
  marksObtained: z.coerce
    .number({ required_error: 'Marks obtained is required' })
    .min(0, 'Marks obtained cannot be negative'),
  ceMarksObtained: z.coerce.number().min(0).optional().default(0),
  isAbsent: z.boolean().optional().default(false),
  remarks: z.string().trim().optional(),
});

export const saveAssessmentMarksSchema = z.object({
  scheduleId: z
    .string({ required_error: 'Assessment schedule is required' })
    .trim()
    .min(1, 'Assessment schedule is required'),
  assessmentId: z.string().trim().optional(),
  batchId: z.string().trim().optional(),
  criteriaId: z.string().trim().optional(),
  marks: z
    .array(studentMarkItemSchema, { required_error: 'Marks array is required' })
    .min(1, 'At least one student mark entry is required'),
});

export const assessmentResultQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  assessmentId: z.string().trim().optional(),
  scheduleId: z.string().trim().optional(),
  criteriaId: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  batchId: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  isAbsent: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'boolean' ? val : val === 'true'))
    .optional(),
  isPassed: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'boolean' ? val : val === 'true'))
    .optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const publishResultsSchema = z
  .object({
    assessmentId: z.string().trim().optional(),
    scheduleId: z.string().trim().optional(),
    isPublished: z.boolean().default(true),
  })
  .refine((data) => Boolean(data.assessmentId || data.scheduleId), {
    message: 'Either assessmentId or scheduleId is required',
  });
