import { useEffect, useMemo, useState, forwardRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import {
  assessmentScheduleSchema,
  type AssessmentScheduleFormValues,
} from '../../../validators/assessmentScheduleValidator';
import { getAssessmentsApi } from '../../../services/assessmentService';
import { getCoursesApi } from '../../../services/courseService';
import { getBatchesApi } from '../../../services/batchService';
import { getCentersApi } from '../../../services/centerService';
import { getAssessmentCriteriaApi } from '../../../services/assessmentCriteriaService';
import type { Assessment } from '../../../types/assessment';
import type { Course } from '../../../types/course';
import type { Batch } from '../../../types/batch';
import type { Center } from '../../../types/center';
import type { AssessmentCriteria } from '../../../types/assessmentCriteria';
import type {
  AssessmentSchedule,
  CreateAssessmentSchedulePayload,
  UpdateAssessmentSchedulePayload,
} from '../../../types/assessmentSchedule';

interface AssessmentScheduleFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<AssessmentSchedule>;
  isLoading?: boolean;
  onSubmit: (data: CreateAssessmentSchedulePayload | UpdateAssessmentSchedulePayload) => Promise<void>;
  onCancel: () => void;
}

export const AssessmentScheduleForm = forwardRef<HTMLFormElement, AssessmentScheduleFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [criteriaList, setCriteriaList] = useState<AssessmentCriteria[]>([]);

    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);
    const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
    const [initialError, setInitialError] = useState<string | null>(null);
    const [dependentError, setDependentError] = useState<string | null>(null);

    const {
      register,
      handleSubmit,
      reset,
      control,
      setValue,
      formState: { errors },
    } = useForm<AssessmentScheduleFormValues>({
      resolver: zodResolver(assessmentScheduleSchema),
      defaultValues: {
        assessmentId: defaultValues?.assessmentId ?? '',
        courseId: defaultValues?.courseId ?? '',
        levelNumber: defaultValues?.levelNumber ? String(defaultValues.levelNumber) : '1',
        criteriaId: defaultValues?.criteriaId ?? '',
        batchId: defaultValues?.batchId ?? '',
        centerId: defaultValues?.centerId ?? '',
        examDate: defaultValues?.examDate ?? '',
        startTime: defaultValues?.startTime ?? '09:30',
        endTime: defaultValues?.endTime ?? '12:30',
      },
    });

    const watchedCourseId = useWatch({ control, name: 'courseId' });
    const watchedLevelNumber = useWatch({ control, name: 'levelNumber' });
    const watchedAssessmentId = useWatch({ control, name: 'assessmentId' });
    const watchedBatchId = useWatch({ control, name: 'batchId' });

    // Automatically synchronize Center / Venue with the selected Batch's assigned academy
    useEffect(() => {
      if (watchedBatchId) {
        const chosen = batches.find((b) => b.id === watchedBatchId);
        if (chosen?.centerId) {
          setValue('centerId', chosen.centerId, { shouldValidate: true });
        }
      }
    }, [watchedBatchId, batches, setValue]);

    // 1. Load initial static options (Assessments, Courses, Centers)
    useEffect(() => {
      const loadInitial = async () => {
        setIsLoadingInitial(true);
        setInitialError(null);
        try {
          const [assessmentsRes, coursesRes, centersRes] = await Promise.all([
            getAssessmentsApi({ limit: 100 }),
            getCoursesApi({ limit: 100 }),
            getCentersApi({ limit: 100 }),
          ]);
          setAssessments(assessmentsRes.data.data.assessments || []);
          setCourses(coursesRes.data.data.courses || []);
          setCenters(centersRes.data.data.centers || []);
        } catch (err: any) {
          setInitialError(
            err?.response?.data?.message || 'Failed to load options for scheduling.'
          );
        } finally {
          setIsLoadingInitial(false);
        }
      };
      loadInitial();
    }, []);

    // 2. Derive Level options based on selected Course
    const selectedCourse = useMemo(
      () => courses.find((c) => c.id === watchedCourseId),
      [courses, watchedCourseId]
    );

    const levelOptions = useMemo(() => {
      if (!selectedCourse) return [{ value: '', label: 'Select course first' }];
      return [
        { value: '', label: `Select ${selectedCourse.levelName || 'Level'}` },
        ...selectedCourse.levels.map((lvl) => ({
          value: String(lvl.levelNumber),
          label: lvl.name || `${selectedCourse.levelName || 'Level'} ${lvl.levelNumber}`,
        })),
      ];
    }, [selectedCourse]);

    // 3. Load Batches and Criteria when Course and Level are selected
    useEffect(() => {
      if (!watchedCourseId || !watchedLevelNumber) {
        setBatches([]);
        setCriteriaList([]);
        setDependentError(null);
        return;
      }

      const loadDependentData = async () => {
        setIsLoadingBatches(true);
        setIsLoadingCriteria(true);
        setDependentError(null);
        try {
          const [batchesRes, criteriaRes] = await Promise.all([
            getBatchesApi({
              courseId: watchedCourseId,
              levelNumber: Number(watchedLevelNumber),
              limit: 100,
            }),
            getAssessmentCriteriaApi({
              courseId: watchedCourseId,
              levelNumber: Number(watchedLevelNumber),
              limit: 100,
            }),
          ]);
          setBatches(batchesRes.data.data.batches || []);
          setCriteriaList(criteriaRes.data.data.criteria || []);
        } catch (err: any) {
          setBatches([]);
          setCriteriaList([]);
          setDependentError(
            err?.response?.data?.message || 'Failed to load batches or criteria for the selected level.'
          );
        } finally {
          setIsLoadingBatches(false);
          setIsLoadingCriteria(false);
        }
      };

      loadDependentData();
    }, [watchedCourseId, watchedLevelNumber]);

    // 4. Populate default edit values
    useEffect(() => {
      if (defaultValues) {
        reset({
          assessmentId: defaultValues.assessmentId ?? '',
          courseId: defaultValues.courseId ?? '',
          levelNumber: defaultValues.levelNumber ? String(defaultValues.levelNumber) : '1',
          criteriaId: defaultValues.criteriaId ?? '',
          batchId: defaultValues.batchId ?? '',
          centerId: defaultValues.centerId ?? '',
          examDate: defaultValues.examDate ?? '',
          startTime: defaultValues.startTime ?? '09:30',
          endTime: defaultValues.endTime ?? '12:30',
        });
      }
    }, [defaultValues, reset]);

    const handleFormSubmit = async (values: AssessmentScheduleFormValues) => {
      await onSubmit({
        assessmentId: values.assessmentId,
        courseId: values.courseId,
        levelNumber: Number(values.levelNumber),
        criteriaId: values.criteriaId,
        batchId: values.batchId,
        centerId: values.centerId,
        examDate: values.examDate,
        startTime: values.startTime,
        endTime: values.endTime,
      });
    };

    const selectedAssessment = useMemo(
      () => assessments.find((a) => a.id === watchedAssessmentId),
      [assessments, watchedAssessmentId]
    );

    const assessmentOptions = [
      { value: '', label: isLoadingInitial ? 'Loading events...' : 'Select Assessment Event' },
      ...assessments.map((a) => ({
        value: a.id,
        label: `${a.name} (${new Date(a.startDate).toLocaleDateString()} - ${new Date(a.endDate).toLocaleDateString()})`,
      })),
    ];

    const courseOptions = [
      { value: '', label: isLoadingInitial ? 'Loading courses...' : 'Select Course' },
      ...courses.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
      })),
    ];

    const criteriaOptions = [
      {
        value: '',
        label: isLoadingCriteria
          ? 'Loading criteria...'
          : criteriaList.length === 0
          ? 'No criteria configured for this course/level'
          : 'Select Assessment Criteria / Subject',
      },
      ...criteriaList.map((cr) => ({
        value: cr.id,
        label: `${cr.name} (${cr.subjectName || 'Subject'}) - Max: ${cr.maxMarks}m`,
      })),
    ];

    const batchOptions = [
      {
        value: '',
        label: isLoadingBatches
          ? 'Loading batches...'
          : batches.length === 0
          ? 'No batches found for this course/level'
          : 'Select Batch',
      },
      ...batches.map((b) => ({
        value: b.id,
        label: `${b.name} (${b.centerName || 'Center'})`,
      })),
    ];

    const centerOptions = [
      { value: '', label: isLoadingInitial ? 'Loading centers...' : 'Select Exam Center' },
      ...centers.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
      })),
    ];

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        {/* Assessment Event */}
        <Select
          label="Assessment Event"
          options={assessmentOptions}
          {...register('assessmentId')}
          error={errors.assessmentId?.message || initialError || undefined}
          disabled={isLoadingInitial}
        />

        {selectedAssessment && (
          <p className="text-xs text-neutral-500 -mt-2">
            Event Window: {new Date(selectedAssessment.startDate).toLocaleDateString()} to{' '}
            {new Date(selectedAssessment.endDate).toLocaleDateString()}
          </p>
        )}

        {/* Course & Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Course"
            options={courseOptions}
            {...register('courseId', {
              onChange: () => {
                setValue('levelNumber', '1');
                setValue('criteriaId', '');
                setValue('batchId', '');
              },
            })}
            error={errors.courseId?.message}
            disabled={isLoadingInitial}
          />

          <Select
            label="Course Level"
            options={levelOptions}
            {...register('levelNumber', {
              onChange: () => {
                setValue('criteriaId', '');
                setValue('batchId', '');
              },
            })}
            error={errors.levelNumber?.message}
            disabled={!watchedCourseId}
          />
        </div>

        {/* Assessment Criteria / Subject */}
        <Select
          label="Assessment Criteria / Subject"
          options={criteriaOptions}
          {...register('criteriaId')}
          error={errors.criteriaId?.message || dependentError || undefined}
          disabled={!watchedCourseId || isLoadingCriteria}
        />

        {/* Batch & Exam Center */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Batch"
            options={batchOptions}
            {...register('batchId')}
            error={errors.batchId?.message || dependentError || undefined}
            disabled={!watchedCourseId || isLoadingBatches}
          />

          <div>
            <Select
              label="Exam Center / Venue"
              options={centerOptions}
              {...register('centerId')}
              error={errors.centerId?.message}
              disabled={isLoadingInitial || Boolean(watchedBatchId)}
            />
            {watchedBatchId && (
              <p className="text-[11px] text-neutral-500 mt-1">
                Locked to the batch&apos;s assigned academy.
              </p>
            )}
          </div>
        </div>

        {/* Date, Start Time & End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Exam Date"
            type="date"
            {...register('examDate')}
            error={errors.examDate?.message}
          />

          <Input
            label="Start Time"
            type="time"
            {...register('startTime')}
            error={errors.startTime?.message}
          />

          <Input
            label="End Time"
            type="time"
            {...register('endTime')}
            error={errors.endTime?.message}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === 'create'
                ? 'Scheduling...'
                : 'Saving...'
              : mode === 'create'
              ? 'Schedule Assessment'
              : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }
);

AssessmentScheduleForm.displayName = 'AssessmentScheduleForm';

export default AssessmentScheduleForm;
