import { z } from 'zod';

export const feeAssignmentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    amount: z
      .string()
      .trim()
      .min(1, 'Amount is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be greater than 0',
      }),
    dueDate: z.string().min(1, 'Due date is required'),
    remarks: z.string().trim().max(500, 'Remarks cannot exceed 500 characters').optional(),
    audience: z.enum(['batch', 'center', 'course', 'student']),
    batchIds: z.array(z.string()).optional(),
    centerIds: z.array(z.string()).optional(),
    courseIds: z.array(z.string()).optional(),
    studentIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.audience === 'batch' && (!data.batchIds || data.batchIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one batch',
        path: ['batchIds'],
      });
    }
    if (data.audience === 'center' && (!data.centerIds || data.centerIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one center',
        path: ['centerIds'],
      });
    }
    if (data.audience === 'course' && (!data.courseIds || data.courseIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one course',
        path: ['courseIds'],
      });
    }
    if (data.audience === 'student' && (!data.studentIds || data.studentIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one student',
        path: ['studentIds'],
      });
    }
  });

export type FeeAssignmentFormValues = z.infer<typeof feeAssignmentSchema>;
