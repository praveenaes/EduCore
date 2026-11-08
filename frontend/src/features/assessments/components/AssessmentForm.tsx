import { useEffect, useState, useMemo, forwardRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import {
  getAssessmentSchema,
  type AssessmentFormValues,
} from '../../../validators/assessmentValidator';
import { getAcademicYearsApi } from '../../../services/academicYearService';
import { getCoursesApi } from '../../../services/courseService';
import type { AcademicYear } from '../../../types/academicYear';
import type { Course } from '../../../types/course';
import type {
  Assessment,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from '../../../types/assessment';
import { STANDARD_EXAM_PRESETS } from '../../../types/assessment';

interface AssessmentFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Assessment>;
  isLoading?: boolean;
  onSubmit: (data: CreateAssessmentPayload | UpdateAssessmentPayload) => Promise<void>;
  onCancel: () => void;
}

export const AssessmentForm = forwardRef<HTMLFormElement, AssessmentFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDateForInput = (dateStr?: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };

    const todayStr = (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })();

    const {
      register,
      handleSubmit,
      reset,
      setValue,
      control,
      watch,
      formState: { errors },
    } = useForm<AssessmentFormValues>({
      resolver: zodResolver(getAssessmentSchema(mode)),
      defaultValues: {
        name: defaultValues?.name ?? '',
        academicYearId: defaultValues?.academicYearId ?? '',
        courseId: defaultValues?.courseId ?? '',
        levelNumber: defaultValues?.levelNumber ? String(defaultValues.levelNumber) : '',
        startDate: formatDateForInput(defaultValues?.startDate),
        endDate: formatDateForInput(defaultValues?.endDate),
        status: defaultValues?.status ?? 'SCHEDULED',
      },
    });

    const watchedStartDate = watch('startDate');
    const watchedCourseId = useWatch({ control, name: 'courseId' });
    const watchedAcademicYearId = useWatch({ control, name: 'academicYearId' });
    const watchedLevelNumber = useWatch({ control, name: 'levelNumber' });
    const watchedStatus = useWatch({ control, name: 'status' });
    const watchedName = useWatch({ control, name: 'name' });

    const [presetChoice, setPresetChoice] = useState<string>(() => defaultValues?.name || '');

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setPresetChoice(val);
      setValue('name', val, { shouldValidate: true });
    };

    useEffect(() => {
      const loadData = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          const [yearsRes, coursesRes] = await Promise.all([
            getAcademicYearsApi({ limit: 100 }),
            getCoursesApi({ limit: 100 }),
          ]);
          setAcademicYears(yearsRes.data.data.academicYears || []);
          setCourses(coursesRes.data.data.courses || []);
        } catch (err: any) {
          setError(err?.response?.data?.message || 'Failed to load form options.');
        } finally {
          setIsLoadingData(false);
        }
      };
      loadData();
    }, []);

    useEffect(() => {
      if (defaultValues && !isLoadingData) {
        const nameVal = defaultValues.name || '';
        const yearVal = defaultValues.academicYearId || '';
        const courseVal = defaultValues.courseId || '';
        const levelVal =
          defaultValues.levelNumber !== undefined && defaultValues.levelNumber !== null
            ? String(defaultValues.levelNumber)
            : '';
        const startVal = formatDateForInput(defaultValues.startDate);
        const endVal = formatDateForInput(defaultValues.endDate);
        const statusVal = defaultValues.status || 'SCHEDULED';

        setPresetChoice(nameVal);
        reset({
          name: nameVal,
          academicYearId: yearVal,
          courseId: courseVal,
          levelNumber: levelVal,
          startDate: startVal,
          endDate: endVal,
          status: statusVal,
        });
      }
    }, [defaultValues, isLoadingData, reset]);

    const selectedCourse = courses.find((c) => c.id === watchedCourseId);
    const availableLevels = useMemo(() => selectedCourse?.levels || [], [selectedCourse]);

    // Ensure levelNumber is selected once course levels are available
    useEffect(() => {
      if (defaultValues?.levelNumber !== undefined && defaultValues?.levelNumber !== null && availableLevels.length > 0) {
        const lvlStr = String(defaultValues.levelNumber);
        if (availableLevels.some((l) => String(l.levelNumber) === lvlStr)) {
          setValue('levelNumber', lvlStr, { shouldValidate: true });
        }
      }
    }, [defaultValues?.levelNumber, availableLevels, setValue]);

    const academicYearOptions = [
      {
        value: '',
        label: isLoadingData ? 'Loading academic years...' : 'Select Academic Year',
      },
      ...academicYears.map((ay) => ({
        value: ay.id,
        label: `${ay.name} (${ay.code})${ay.current ? ' - Current' : ''}`,
      })),
    ];

    const courseOptions = [
      {
        value: '',
        label: isLoadingData ? 'Loading courses...' : 'Select Course',
      },
      ...courses.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
      })),
    ];

    const levelOptions = [
      {
        value: '',
        label: !watchedCourseId
          ? 'Select a course first'
          : availableLevels.length === 0
          ? 'No levels configured'
          : 'Select Course Level / Semester',
      },
      ...availableLevels.map((lvl) => ({
        value: String(lvl.levelNumber),
        label: lvl.name || `Level ${lvl.levelNumber}`,
      })),
    ];

    const examPresetOptions = useMemo(() => {
      const presets = [...STANDARD_EXAM_PRESETS];
      if (defaultValues?.name && !presets.includes(defaultValues.name as any)) {
        presets.unshift(defaultValues.name as any);
      }
      return [
        { value: '', label: 'Select standard exam...' },
        ...presets.map((p) => ({ value: p, label: p })),
      ];
    }, [defaultValues?.name]);

    const statusOptions = [
      { value: 'SCHEDULED', label: 'Scheduled (Upcoming exam event)' },
      { value: 'COMPLETED', label: 'Completed (Exams finished / Mark entry open)' },
      ...(defaultValues?.status === 'PUBLISHED'
        ? [{ value: 'PUBLISHED', label: 'Published (Results released to students)' }]
        : []),
      { value: 'CANCELLED', label: 'Cancelled (Called off)' },
    ];

    const handleFormSubmit = async (values: AssessmentFormValues) => {
      await onSubmit({
        name: values.name.trim(),
        academicYearId: values.academicYearId,
        courseId: values.courseId,
        levelNumber: Number(values.levelNumber),
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        ...(values.status ? { status: values.status as any } : {}),
      });
    };

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        <Select
          label="Assessment Event Name *"
          options={examPresetOptions}
          {...register('name')}
          value={presetChoice || watchedName || ''}
          onChange={handlePresetChange}
          error={errors.name?.message}
        />

        {mode === 'edit' && (
          <Select
            label="Assessment Status"
            options={statusOptions}
            {...register('status')}
            value={watchedStatus || 'SCHEDULED'}
            error={errors.status?.message}
          />
        )}

        <Select
          label="Academic Year"
          options={academicYearOptions}
          {...register('academicYearId')}
          value={watchedAcademicYearId || ''}
          error={errors.academicYearId?.message || error || undefined}
          disabled={isLoadingData}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Course"
            options={courseOptions}
            {...register('courseId')}
            value={watchedCourseId || ''}
            error={errors.courseId?.message}
            disabled={isLoadingData}
          />

          <Select
            label="Course Level / Semester"
            options={levelOptions}
            {...register('levelNumber')}
            value={watchedLevelNumber || ''}
            error={errors.levelNumber?.message}
            disabled={isLoadingData || !watchedCourseId}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            min={mode === 'create' ? todayStr : undefined}
            {...register('startDate')}
            error={errors.startDate?.message}
          />

          <Input
            label="End Date"
            type="date"
            min={watchedStartDate || (mode === 'create' ? todayStr : undefined)}
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {mode === 'edit' ? 'Update Assessment' : 'Create Assessment'}
          </Button>
        </div>
      </form>
    );
  }
);

AssessmentForm.displayName = 'AssessmentForm';
export default AssessmentForm;
