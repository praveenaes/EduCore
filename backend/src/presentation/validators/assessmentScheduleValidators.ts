import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createAssessmentScheduleSchema = z
  .object({
    assessmentId: z
      .string({ required_error: 'Assessment event is required' })
      .trim()
      .min(1, 'Assessment event is required'),
    courseId: z
      .string({ required_error: 'Course is required' })
      .trim()
      .min(1, 'Course is required'),
    levelNumber: z.coerce
      .number({ required_error: 'Course level is required' })
      .min(1, 'Course level must be at least 1'),
    criteriaId: z
      .string({ required_error: 'Assessment criteria is required' })
      .trim()
      .min(1, 'Assessment criteria is required'),
    batchId: z
      .string({ required_error: 'Batch is required' })
      .trim()
      .min(1, 'Batch is required'),
    centerId: z
      .string({ required_error: 'Exam center is required' })
      .trim()
      .min(1, 'Exam center is required'),
    examDate: z.coerce.date({
      required_error: 'Exam date is required',
      invalid_type_error: 'Valid exam date is required',
    }),
    startTime: z
      .string({ required_error: 'Start time is required' })
      .trim()
      .regex(timeRegex, 'Start time must be in HH:mm format (e.g. 09:30)'),
    endTime: z
      .string({ required_error: 'End time is required' })
      .trim()
      .regex(timeRegex, 'End time must be in HH:mm format (e.g. 11:30)'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const updateAssessmentScheduleSchema = createAssessmentScheduleSchema;

export const assessmentScheduleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  assessmentId: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  levelNumber: z.coerce.number().min(1).optional(),
  criteriaId: z.string().trim().optional(),
  batchId: z.string().trim().optional(),
  centerId: z.string().trim().optional(),
  isCompleted: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'boolean' ? val : val === 'true'))
    .optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const requestDelegationSchema = z.object({
  reason: z
    .string({ required_error: 'Reason for delegation is required' })
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export const reviewDelegationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    required_error: 'Status must be APPROVED or REJECTED',
  }),
  reviewNotes: z.string().trim().max(500).optional(),
});
