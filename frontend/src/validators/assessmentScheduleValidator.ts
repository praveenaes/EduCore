import { z } from 'zod';

export const assessmentScheduleSchema = z
  .object({
    assessmentId: z.string().trim().min(1, 'Please select an assessment event'),
    courseId: z.string().trim().min(1, 'Please select a course'),
    levelNumber: z.string().trim().min(1, 'Please select a course level'),
    criteriaId: z.string().trim().min(1, 'Please select assessment criteria / subject'),
    batchId: z.string().trim().min(1, 'Please select a batch'),
    centerId: z.string().trim().min(1, 'Please select an exam center'),
    examDate: z.string().min(1, 'Exam date is required'),
    startTime: z
      .string()
      .min(1, 'Start time is required')
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time (HH:mm)'),
    endTime: z
      .string()
      .min(1, 'End time is required')
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time (HH:mm)'),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export type AssessmentScheduleFormValues = z.infer<typeof assessmentScheduleSchema>;
