import { z } from 'zod';

const assessmentTypes = ['exam', 'viva', 'assignment', 'project', 'quiz', 'other'] as const;

export const createAssessmentCriteriaSchema = z
  .object({
    name: z
      .string({ required_error: 'Criteria name is required' })
      .trim()
      .min(1, 'Criteria name is required')
      .max(100, 'Criteria name cannot exceed 100 characters')
      .regex(
        /^[a-zA-Z\s-]+$/,
        'Criteria name can only contain letters, spaces, and hyphens'
      )
      .refine(
        (val) => /[a-zA-Z]/.test(val),
        'Criteria name must contain at least one letter'
      ),
    courseId: z
      .string({ required_error: 'Course is required' })
      .trim()
      .min(1, 'Course is required'),
    levelNumber: z.coerce
      .number({ required_error: 'Course level is required' })
      .min(1, 'Course level must be at least 1'),
    subjectId: z
      .string({ required_error: 'Subject is required' })
      .trim()
      .min(1, 'Subject is required'),
    assessmentType: z.enum(assessmentTypes, {
      required_error: 'Assessment type is required',
    }),
    maxMarks: z.coerce
      .number({ required_error: 'Maximum marks is required' })
      .min(1, 'Maximum marks must be at least 1')
      .max(1000, 'Maximum marks cannot exceed 1000'),
    passMarks: z.coerce
      .number({ required_error: 'Passing marks is required' })
      .min(0, 'Passing marks cannot be negative'),
    hasCe: z.boolean().default(false),
  })
  .refine((data) => data.passMarks <= data.maxMarks, {
    message: 'Passing marks cannot exceed maximum marks',
    path: ['passMarks'],
  });

export const updateAssessmentCriteriaSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Criteria name is required')
      .max(100, 'Criteria name cannot exceed 100 characters')
      .regex(
        /^[a-zA-Z\s-]+$/,
        'Criteria name can only contain letters, spaces, and hyphens'
      )
      .refine(
        (val) => /[a-zA-Z]/.test(val),
        'Criteria name must contain at least one letter'
      )
      .optional(),
    courseId: z.string().trim().min(1).optional(),
    levelNumber: z.coerce.number().min(1).optional(),
    subjectId: z.string().trim().min(1).optional(),
    assessmentType: z.enum(assessmentTypes).optional(),
    maxMarks: z.coerce.number().min(1).max(1000).optional(),
    passMarks: z.coerce.number().min(0).optional(),
    hasCe: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.passMarks !== undefined && data.maxMarks !== undefined) {
        return data.passMarks <= data.maxMarks;
      }
      return true;
    },
    {
      message: 'Passing marks cannot exceed maximum marks',
      path: ['passMarks'],
    }
  );

export const assessmentCriteriaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  levelNumber: z.coerce.number().min(1).optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
