import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { batchSchema, type BatchFormValues } from '../../../validators/batchValidator';
import { getCoursesApi } from '../../../services/courseService';
import { getCentersApi } from '../../../services/centerService';
import { getAcademicYearsApi } from '../../../services/academicYearService';
import { getTeachersApi } from '../../../services/teacherService';
import type { Course } from '../../../types/course';
import type { Center } from '../../../types/center';
import type { AcademicYear } from '../../../types/academicYear';
import type { Teacher } from '../../../types/teacher';
import type { Batch, CreateBatchPayload, UpdateBatchPayload } from '../../../types/batch';

interface BatchFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Batch>;
  isLoading?: boolean;
  onSubmit: (data: CreateBatchPayload | UpdateBatchPayload) => Promise<void>;
  onCancel: () => void;
}

const BatchForm = forwardRef<HTMLFormElement, BatchFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const {
      register,
      handleSubmit,
      control,
      setValue,
      setError,
      reset,
      formState: { errors },
    } = useForm<BatchFormValues>({
      resolver: zodResolver(batchSchema),
      defaultValues: {
        name: defaultValues?.name ?? '',
        courseId: defaultValues?.courseId ?? '',
        levelNumber: defaultValues?.levelNumber ? String(defaultValues.levelNumber) : '',
        centerId: defaultValues?.centerId ?? '',
        academicYearId: defaultValues?.academicYearId ?? '',
        teacherId: defaultValues?.teacherId ?? '',
        isActive: defaultValues?.isActive ?? true,
      },
    });

    const watchedCourseId = useWatch({ control, name: 'courseId' });

    useEffect(() => {
      const loadOptions = async () => {
        setIsLoadingData(true);
        try {
          const [coursesRes, centersRes, yearsRes, teachersRes] = await Promise.all([
            getCoursesApi({ limit: 100 }),
            getCentersApi({ limit: 100 }),
            getAcademicYearsApi({ limit: 100 }),
            getTeachersApi({ limit: 100 }),
          ]);

          setCourses(coursesRes.data.data.courses || []);
          setCenters(centersRes.data.data.centers || []);
          setAcademicYears(yearsRes.data.data.academicYears || []);
          setTeachers(teachersRes.teachers || []);

          if (defaultValues) {
            reset({
              name: defaultValues.name ?? '',
              courseId: defaultValues.courseId ?? '',
              levelNumber: defaultValues.levelNumber ? String(defaultValues.levelNumber) : '',
              centerId: defaultValues.centerId ?? '',
              academicYearId: defaultValues.academicYearId ?? '',
              teacherId: defaultValues.teacherId ?? '',
              isActive: defaultValues.isActive ?? true,
            });
          }
        } catch {
          // Graceful fallback
        } finally {
          setIsLoadingData(false);
        }
      };

      loadOptions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (defaultValues) {
        reset({
          name: defaultValues.name ?? '',
          courseId: defaultValues.courseId ?? '',
          levelNumber: defaultValues.levelNumber ? String(defaultValues.levelNumber) : '',
          centerId: defaultValues.centerId ?? '',
          academicYearId: defaultValues.academicYearId ?? '',
          teacherId: defaultValues.teacherId ?? '',
          isActive: defaultValues.isActive ?? true,
        });
      }
    }, [defaultValues, reset]);

    const selectedCourse = courses.find((c) => c.id === watchedCourseId);
    const availableLevels = useMemo(() => selectedCourse?.levels || [], [selectedCourse?.levels]);

    useEffect(() => {
      if (watchedCourseId) {
        if (
          !availableLevels.some(
            (lvl) => String(lvl.levelNumber) === control._formValues.levelNumber
          )
        ) {
          setValue(
            'levelNumber',
            availableLevels[0] ? String(availableLevels[0].levelNumber) : ''
          );
        }
      }
    }, [watchedCourseId, availableLevels, setValue, control]);

    const handleFormSubmit = async (data: BatchFormValues) => {
      try {
        if (mode === 'edit') {
          const payload: UpdateBatchPayload = {
            name: data.name,
            courseId: data.courseId,
            levelNumber: Number(data.levelNumber),
            centerId: data.centerId,
            academicYearId: data.academicYearId,
            teacherId: data.teacherId || null,
            isActive: data.isActive,
          };
          await onSubmit(payload);
        } else {
          const payload: CreateBatchPayload = {
            name: data.name,
            courseId: data.courseId,
            levelNumber: Number(data.levelNumber),
            centerId: data.centerId,
            academicYearId: data.academicYearId,
            teacherId: data.teacherId || null,
          };
          await onSubmit(payload);
        }
      } catch (err: any) {
        const errorsList = err.response?.data?.errors;
        if (errorsList && Array.isArray(errorsList)) {
          errorsList.forEach((e: any) => {
            const fieldName = e.field.replace('body.', '');
            setError(fieldName as any, { type: 'manual', message: e.message });
          });
        }
        const errorMsg = err.response?.data?.message;
        if (errorMsg) {
          setError('name', { type: 'manual', message: errorMsg });
        }
        throw err;
      }
    };

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Batch Name */}
        <Input
          label="Batch Name / Division"
          placeholder="e.g. Division A, Morning Batch"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Academic Year */}
        <Select
          label="Academic Year"
          error={errors.academicYearId?.message}
          {...register('academicYearId')}
          options={[
            {
              value: '',
              label: isLoadingData ? 'Loading academic years…' : 'Select academic year',
            },
            ...academicYears.map((ay) => ({
              value: ay.id,
              label: `${ay.name} (${ay.code})`,
            })),
          ]}
        />

        {/* Center */}
        <Select
          label="Center / Branch"
          error={errors.centerId?.message}
          {...register('centerId')}
          options={[
            { value: '', label: isLoadingData ? 'Loading centers…' : 'Select center' },
            ...centers.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            })),
          ]}
        />

        {/* Course */}
        <Select
          label="Course"
          error={errors.courseId?.message}
          {...register('courseId')}
          options={[
            { value: '', label: isLoadingData ? 'Loading courses…' : 'Select course' },
            ...courses.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            })),
          ]}
        />

        {/* Level / Semester */}
        <Select
          label="Course Level / Semester"
          error={errors.levelNumber?.message}
          disabled={!watchedCourseId || availableLevels.length === 0}
          {...register('levelNumber')}
          options={
            !watchedCourseId
              ? [{ value: '', label: 'Select a course first' }]
              : [
                  { value: '', label: 'Select a level' },
                  ...availableLevels.map((lvl) => ({
                    value: String(lvl.levelNumber),
                    label: lvl.name,
                  })),
                ]
          }
        />

        {/* Teacher (Optional) */}
        <Select
          label="Teacher / Batch Incharge (Optional)"
          error={errors.teacherId?.message}
          {...register('teacherId')}
          options={[
            { value: '', label: 'None / Assign Later' },
            ...teachers.map((t) => ({
              value: t.id,
              label: `${t.firstName} ${t.lastName} (${t.employeeId})`,
            })),
          ]}
        />

        {/* Active Toggle (Edit mode) */}
        {mode === 'edit' && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
              Batch is Active
            </label>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Create Batch' : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }
);

BatchForm.displayName = 'BatchForm';
export default BatchForm;
