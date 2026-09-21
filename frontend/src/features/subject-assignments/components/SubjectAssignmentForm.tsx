import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import {
  subjectAssignmentSchema,
  type SubjectAssignmentFormValues,
} from '../../../validators/subjectAssignmentValidator';
import { getCoursesApi } from '../../../services/courseService';
import { getSubjectsApi } from '../../../services/subjectService';
import { getTeachersApi } from '../../../services/teacherService';
import type { Course } from '../../../types/course';
import type { Subject } from '../../../types/subject';
import type { Teacher } from '../../../types/teacher';
import type {
  SubjectAssignment,
  CreateSubjectAssignmentPayload,
  UpdateSubjectAssignmentPayload,
} from '../../../types/subjectAssignment';

interface SubjectAssignmentFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<SubjectAssignment>;
  isLoading?: boolean;
  onSubmit: (data: CreateSubjectAssignmentPayload | UpdateSubjectAssignmentPayload) => Promise<void>;
  onCancel: () => void;
}

const SubjectAssignmentForm = forwardRef<HTMLFormElement, SubjectAssignmentFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
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
    } = useForm<SubjectAssignmentFormValues>({
      resolver: zodResolver(subjectAssignmentSchema),
      defaultValues: {
        courseId: defaultValues?.courseId ?? '',
        levelNumber: defaultValues?.levelNumber ? String(defaultValues.levelNumber) : '',
        subjectId: defaultValues?.subjectId ?? '',
        teacherId: defaultValues?.teacherId ?? '',
      },
    });

    const watchedCourseId = useWatch({ control, name: 'courseId' });

    useEffect(() => {
      const loadOptions = async () => {
        setIsLoadingData(true);
        try {
          const [coursesRes, subjectsRes, teachersRes] = await Promise.all([
            getCoursesApi({ limit: 100 }),
            getSubjectsApi({ limit: 100 }),
            getTeachersApi({ limit: 100 }),
          ]);

          setCourses(coursesRes.data.data.courses || []);
          setSubjects(subjectsRes.data.data.subjects || []);
          setTeachers(teachersRes.teachers || []);
        } catch {
          // Graceful fallback on network error
        } finally {
          setIsLoadingData(false);
        }
      };

      loadOptions();
    }, []);

    useEffect(() => {
      if (defaultValues) {
        reset({
          courseId: defaultValues.courseId ?? '',
          levelNumber: defaultValues.levelNumber ? String(defaultValues.levelNumber) : '',
          subjectId: defaultValues.subjectId ?? '',
          teacherId: defaultValues.teacherId ?? '',
        });
      }
    }, [defaultValues, courses, reset]);

    // Derive the levels available for the selected course
    const selectedCourse = courses.find((c) => c.id === watchedCourseId);
    const availableLevels = useMemo(() => selectedCourse?.levels || [], [selectedCourse?.levels]);

    // Reset level selection if the chosen course changes and doesn't have that level
    useEffect(() => {
      if (watchedCourseId && availableLevels.length > 0) {
        const currentLevel = control._formValues.levelNumber;
        if (currentLevel && !availableLevels.some((lvl) => String(lvl.levelNumber) === currentLevel)) {
          setValue('levelNumber', availableLevels[0] ? String(availableLevels[0].levelNumber) : '');
        }
      }
    }, [watchedCourseId, availableLevels, setValue, control]);

    const handleFormSubmit = async (data: SubjectAssignmentFormValues) => {
      const payload: CreateSubjectAssignmentPayload = {
        courseId: data.courseId,
        levelNumber: Number(data.levelNumber),
        subjectId: data.subjectId,
        teacherId: data.teacherId || null,
      };

      try {
        await onSubmit(payload);
      } catch (err: any) {
        const errorsList = err.response?.data?.errors;
        if (errorsList && Array.isArray(errorsList)) {
          errorsList.forEach((e: any) => {
            const fieldName = e.field?.replace('body.', '');
            if (fieldName) {
              setError(fieldName as any, { type: 'manual', message: e.message });
            }
          });
        }
        throw err;
      }
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit(handleFormSubmit, (valErrors) => {
          console.error('SubjectAssignmentForm validation errors:', valErrors);
        })}
        className="space-y-5"
      >
        {/* Course Selection */}
        <div>
          <Select
            label="Course"
            error={errors.courseId?.message}
            {...register('courseId')}
            options={[
              { value: '', label: isLoadingData ? 'Loading courses…' : 'Select a course' },
              ...courses.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.code})`,
              })),
            ]}
          />
        </div>

        {/* Dynamic Course Level Selection */}
        <div>
          <Select
            label="Course Level (e.g. Semester / Year)"
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
          {watchedCourseId && availableLevels.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              This course does not have any configured levels.
            </p>
          )}
        </div>

        {/* Subject Selection */}
        <div>
          <Select
            label="Subject"
            error={errors.subjectId?.message}
            {...register('subjectId')}
            options={[
              { value: '', label: isLoadingData ? 'Loading subjects…' : 'Select a subject' },
              ...subjects.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.code})`,
              })),
            ]}
          />
        </div>

        {/* Teacher Selection (Optional) */}
        <div>
          <Select
            label="Assigned Faculty / Teacher (Optional)"
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
          <p className="text-xs text-neutral-400 mt-1">
            You can assign a teacher now or reassign anytime later.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Assign Subject' : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }
);

SubjectAssignmentForm.displayName = 'SubjectAssignmentForm';
export default SubjectAssignmentForm;
