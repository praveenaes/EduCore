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
    isHalfDay: z.boolean().optional(),
    halfDaySession: z.enum(['firstHalf', 'secondHalf']).optional(),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      start.setHours(0, 0, 0, 0);
      return start >= today;
    },
    {
      message: 'Leave cannot be applied for past dates',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'Start date cannot be after end date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => !data.isHalfDay || (data.isHalfDay && Boolean(data.halfDaySession)),
    {
      message: 'Please select a session (first half or second half) for half-day leave',
      path: ['halfDaySession'],
    }
  )
  .refine(
    (data) => !data.isHalfDay || data.startDate === data.endDate,
    {
      message: 'Half-day leave can only be applied for a single day',
      path: ['endDate'],
    }
  );

export const reviewLeaveSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status must be approved or rejected' }),
  }),
  remarks: z.string().trim().max(255, 'Remarks must not exceed 255 characters').optional(),
});

export const updateLeaveSchema = z
  .object({
    startDate: z.string().trim().min(1, 'Start date is required').optional(),
    endDate: z.string().trim().min(1, 'End date is required').optional(),
    type: z.enum(['medical', 'casual', 'family', 'other'], {
      errorMap: () => ({ message: 'Invalid leave type' }),
    }).optional(),
    reason: z
      .string()
      .trim()
      .min(1, 'Reason is required')
      .max(500, 'Reason must not exceed 500 characters')
      .optional(),
    isHalfDay: z.boolean().optional(),
    halfDaySession: z.enum(['firstHalf', 'secondHalf']).optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      start.setHours(0, 0, 0, 0);
      return start >= today;
    },
    {
      message: 'Leave cannot be applied for past dates',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    {
      message: 'Start date cannot be after end date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => !data.isHalfDay || (data.isHalfDay && Boolean(data.halfDaySession)),
    {
      message: 'Please select a session (first half or second half) for half-day leave',
      path: ['halfDaySession'],
    }
  )
  .refine(
    (data) => !data.isHalfDay || !data.startDate || !data.endDate || data.startDate === data.endDate,
    {
      message: 'Half-day leave can only be applied for a single day',
      path: ['endDate'],
    }
  );

export const rescheduleLeaveSchema = z
  .object({
    startDate: z.string().trim().min(1, 'New start date is required'),
    endDate: z.string().trim().min(1, 'New end date is required'),
    reason: z
      .string()
      .trim()
      .min(1, 'Reason for rescheduling is required')
      .max(500, 'Reason must not exceed 500 characters'),
    isHalfDay: z.boolean().optional(),
    halfDaySession: z.enum(['firstHalf', 'secondHalf']).optional(),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      start.setHours(0, 0, 0, 0);
      return start >= today;
    },
    {
      message: 'Leave cannot be rescheduled to past dates',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'Start date cannot be after end date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => !data.isHalfDay || (data.isHalfDay && Boolean(data.halfDaySession)),
    {
      message: 'Please select a session (first half or second half) for half-day leave',
      path: ['halfDaySession'],
    }
  )
  .refine(
    (data) => !data.isHalfDay || data.startDate === data.endDate,
    {
      message: 'Half-day leave can only be applied for a single day',
      path: ['endDate'],
    }
  );


