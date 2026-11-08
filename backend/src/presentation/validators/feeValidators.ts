import { z } from 'zod';

export const createFeeAssignmentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),
    amount: z.coerce.number().min(0, 'Amount must be a positive number'),
    dueDate: z
      .string()
      .min(1, 'Due date is required')
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), { message: 'Invalid due date format' }),
    remarks: z.string().trim().max(500, 'Remarks cannot exceed 500 characters').optional(),
    audience: z.enum(['batch', 'center', 'course', 'student'], {
      errorMap: () => ({ message: 'Audience must be batch, center, course, or student' }),
    }),
    batchIds: z.array(z.string().trim()).optional(),
    centerIds: z.array(z.string().trim()).optional(),
    courseIds: z.array(z.string().trim()).optional(),
    studentIds: z.array(z.string().trim()).optional(),
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

export const confirmFeePaymentSchema = z.object({
  transactionId: z.string().trim().min(1, 'Transaction ID is required'),
  gatewayOrderId: z.string().trim().min(1, 'Gateway Order ID is required'),
  gatewayTransactionId: z.string().trim().min(1, 'Gateway Transaction ID is required'),
  gatewaySignature: z.string().trim().min(1, 'Gateway Signature is required'),
});
