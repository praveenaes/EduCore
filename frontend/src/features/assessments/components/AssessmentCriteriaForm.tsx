import { useEffect, useMemo, useState, forwardRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import {
  assessmentCriteriaSchema,
  type AssessmentCriteriaFormValues,
} from '../../../validators/assessmentCriteriaValidator';
import { getCoursesApi } from '../../../services/courseService';
import { getSubjectAssignmentsApi } from '../../../services/subjectAssignmentService';
import { getSubjectsApi } from '../../../services/subjectService';
import type { Course } from '../../../types/course';
import type {
  AssessmentCriteria,
  CreateAssessmentCriteriaPayload,
  UpdateAssessmentCriteriaPayload,
} from '../../../types/assessmentCriteria';
import { STANDARD_CRITERIA_PRESETS } from '../../../types/assessmentCriteria';

interface AssessmentCriteriaFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<AssessmentCriteria>;
  isLoading?: boolean;
  onSubmit: (data: CreateAssessmentCriteriaPayload | UpdateAssessmentCriteriaPayload) => Promise<void>;
  onCancel: () => void;
}

export const AssessmentCriteriaForm = forwardRef<HTMLFormElement, AssessmentCriteriaFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [subjects, setSubjects] = useState<Array<{ id: string; name: string; code?: string }>>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [coursesError, setCoursesError] = useState<string | null>(null);
    const [subjectsError, setSubjectsError] = useState<string | null>(null);

    const {
      register,
      handleSubmit,
      reset,
      control,
      setValue,
      formState: { errors },
    } = useForm<AssessmentCriteriaFormValues>({
      resolver: zodResolver(assessmentCriteriaSchema),
      defaultValues: {
        name: defaultValues?.name ?? '',
        courseId: defaultValues?.courseId ?? '',
        levelNumber: defaultValues?.levelNumber ? String(defaultValues.levelNumber) : '1',
        subjectId: defaultValues?.subjectId ?? '',
        assessmentType: defaultValues?.assessmentType ?? 'exam',
        maxMarks: defaultValues?.maxMarks !== undefined ? String(defaultValues.maxMarks) : '100',
        passMarks: defaultValues?.passMarks !== undefined ? String(defaultValues.passMarks) : '40',
        hasCe: defaultValues?.hasCe ?? false,
      },
    });

    useEffect(() => {
      register('name');
    }, [register]);

    const isStandardPreset = (val?: string) =>
      STANDARD_CRITERIA_PRESETS.some((p) => p.name.toLowerCase() === val?.toLowerCase());

    const getPresetObject = (val?: string) =>
      STANDARD_CRITERIA_PRESETS.find((p) => p.name.toLowerCase() === val?.toLowerCase());

    const [presetChoice, setPresetChoice] = useState<string>(() => {
      if (!defaultValues?.name) return '';
      const matched = getPresetObject(defaultValues.name);
      return matched ? matched.name : 'CUSTOM';
    });

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setPresetChoice(val);
      if (val === 'CUSTOM') {
        const customDefault =
          defaultValues?.name && !isStandardPreset(defaultValues.name)
            ? defaultValues.name
            : '';
        setValue('name', customDefault, { shouldValidate: true });
      } else if (val) {
        setValue('name', val, { shouldValidate: true });
        const preset = STANDARD_CRITERIA_PRESETS.find((p) => p.name === val);
        if (preset) {
          setValue('assessmentType', preset.defaultType, { shouldValidate: true });
        }
      } else {
        setValue('name', '', { shouldValidate: true });
      }
    };

    useEffect(() => {
      if (defaultValues) {
        const matched = getPresetObject(defaultValues.name);
        setPresetChoice(matched ? matched.name : defaultValues.name ? 'CUSTOM' : '');
        reset({
          name: defaultValues.name ?? '',
          courseId: defaultValues.courseId ?? '',
          levelNumber: defaultValues.levelNumber ? String(defaultValues.levelNumber) : '1',
          subjectId: defaultValues.subjectId ?? '',
          assessmentType: defaultValues.assessmentType ?? 'exam',
          maxMarks: defaultValues.maxMarks !== undefined ? String(defaultValues.maxMarks) : '100',
          passMarks: defaultValues.passMarks !== undefined ? String(defaultValues.passMarks) : '40',
          hasCe: defaultValues.hasCe ?? false,
        });
      }
    }, [defaultValues, reset]);

    const watchedCourseId = useWatch({ control, name: 'courseId' });
    const watchedLevelNumber = useWatch({ control, name: 'levelNumber' });

    // 1. Load Courses on mount
    useEffect(() => {
      const loadCourses = async () => {
        setIsLoadingCourses(true);
        setCoursesError(null);
        try {
          const res = await getCoursesApi({ limit: 100 });
          setCourses(res.data.data.courses || []);
        } catch (err: any) {
          setCoursesError(err?.response?.data?.message || 'Failed to load courses.');
        } finally {
          setIsLoadingCourses(false);
        }
      };
      loadCourses();
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

    // 3. Load Subjects assigned to the selected Course and Level
    useEffect(() => {
      if (!watchedCourseId || !watchedLevelNumber) {
        setSubjects([]);
        setSubjectsError(null);
        return;
      }

      const loadSubjects = async () => {
        setIsLoadingSubjects(true);
        setSubjectsError(null);
        try {
          const assignmentRes = await getSubjectAssignmentsApi({
            courseId: watchedCourseId,
            levelNumber: Number(watchedLevelNumber),
            limit: 100,
          });

          const assignments = assignmentRes.data.data?.assignments || [];
          if (assignments.length > 0) {
            setSubjects(
              assignments.map((a) => ({
                id: a.subjectId,
                name: a.subjectName || a.subjectCode || 'Subject',
                code: a.subjectCode,
              }))
            );
          } else {
            // Fallback to all subjects if no specific assignment exists yet
            const allSubRes = await getSubjectsApi({ limit: 100 });
            setSubjects(allSubRes.data.data?.subjects || []);
          }
        } catch (err: any) {
          setSubjects([]);
          setSubjectsError(err?.response?.data?.message || 'Failed to load subjects for this level.');
        } finally {
          setIsLoadingSubjects(false);
        }
      };

      loadSubjects();
    }, [watchedCourseId, watchedLevelNumber]);

    // 4. Populate edit mode values
    useEffect(() => {
      if (defaultValues) {
        reset({
          name: defaultValues.name ?? '',
          courseId: defaultValues.courseId ?? '',
          levelNumber: defaultValues.levelNumber ? String(defaultValues.levelNumber) : '1',
          subjectId: defaultValues.subjectId ?? '',
          assessmentType: defaultValues.assessmentType ?? 'exam',
          maxMarks: defaultValues.maxMarks !== undefined ? String(defaultValues.maxMarks) : '100',
          passMarks: defaultValues.passMarks !== undefined ? String(defaultValues.passMarks) : '40',
          hasCe: defaultValues.hasCe ?? false,
        });
      }
    }, [defaultValues, reset]);

    const handleFormSubmit = async (values: AssessmentCriteriaFormValues) => {
      await onSubmit({
        name: values.name.trim(),
        courseId: values.courseId,
        levelNumber: Number(values.levelNumber),
        subjectId: values.subjectId,
        assessmentType: values.assessmentType,
        maxMarks: Number(values.maxMarks),
        passMarks: Number(values.passMarks),
        hasCe: Boolean(values.hasCe),
      });
    };

    const courseOptions = [
      {
        value: '',
        label: isLoadingCourses ? 'Loading courses...' : 'Select Course',
      },
      ...courses.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
      })),
    ];

    const subjectOptions = [
      {
        value: '',
        label: isLoadingSubjects
          ? 'Loading subjects...'
          : subjects.length === 0
          ? 'No subjects available for this level'
          : 'Select Subject',
      },
      ...subjects.map((s) => ({
        value: s.id,
        label: s.code ? `${s.name} (${s.code})` : s.name,
      })),
    ];

    const assessmentTypeOptions = [
      { value: 'exam', label: 'Exam' },
      { value: 'viva', label: 'Viva' },
      { value: 'assignment', label: 'Assignment' },
      { value: 'project', label: 'Project' },
      { value: 'quiz', label: 'Quiz' },
      { value: 'other', label: 'Other' },
    ];

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        <Select
          label="Criteria Name"
          options={[
            { value: '', label: 'Select criteria name or custom...' },
            ...STANDARD_CRITERIA_PRESETS.map((p) => ({
              value: p.name,
              label: p.name,
            })),
            { value: 'CUSTOM', label: 'Other / Custom Criteria Name...' },
          ]}
          value={presetChoice}
          onChange={handlePresetChange}
          error={presetChoice !== 'CUSTOM' ? errors.name?.message : undefined}
        />

        {presetChoice === 'CUSTOM' && (
          <Input
            label="Custom Criteria Name"
            placeholder="e.g. Clinical Case Study or Practical Lab"
            {...register('name')}
            error={errors.name?.message}
            autoFocus
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Course"
            options={courseOptions}
            {...register('courseId', {
              onChange: () => {
                setValue('levelNumber', '1');
                setValue('subjectId', '');
              },
            })}
            error={errors.courseId?.message || coursesError || undefined}
            disabled={isLoadingCourses}
          />

          <Select
            label="Course Level"
            options={levelOptions}
            {...register('levelNumber', {
              onChange: () => setValue('subjectId', ''),
            })}
            error={errors.levelNumber?.message}
            disabled={!watchedCourseId}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Subject"
            options={subjectOptions}
            {...register('subjectId')}
            error={errors.subjectId?.message || subjectsError || undefined}
            disabled={!watchedCourseId || isLoadingSubjects}
          />

          <Select
            label="Assessment Type"
            options={assessmentTypeOptions}
            {...register('assessmentType')}
            error={errors.assessmentType?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Maximum Marks"
            type="number"
            placeholder="100"
            {...register('maxMarks')}
            error={errors.maxMarks?.message}
          />

          <Input
            label="Passing Marks"
            type="number"
            placeholder="40"
            {...register('passMarks')}
            error={errors.passMarks?.message}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="hasCe"
            {...register('hasCe')}
            className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
          <label htmlFor="hasCe" className="text-sm font-medium text-neutral-700 cursor-pointer">
            Has Continuous Evaluation (CE) Marks?
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {mode === 'edit' ? 'Update Criteria' : 'Create Criteria'}
          </Button>
        </div>
      </form>
    );
  }
);

AssessmentCriteriaForm.displayName = 'AssessmentCriteriaForm';
export default AssessmentCriteriaForm;
