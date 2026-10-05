import { z } from 'zod';

export const applyLeaveSchema = z
  .object({
    startDate: z.string().trim().min(1, 'Start date is required'),
    endDate: z.string().trim().min(1, 'End date is required'),
    type: z.enum(['medical', 'casual', 'family', 'other'], {
      errorMap: () => ({ message: 'Invalid leave type' }),
    }),
    reason: z
      .string()
      .trim()
      .min(1, 'Reason is required')
      .max(500, 'Reason must not exceed 500 characters'),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      start.setHours(0, 0, 0, 0);
      return start > today;
    },
    {
      message: 'Leave can only be applied for dates after today',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'Start date cannot be after end date',
      path: ['endDate'],
    }
  );

export const reviewLeaveSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status must be approved or rejected' }),
  }),
  remarks: z.string().trim().max(255, 'Remarks must not exceed 255 characters').optional(),
});
