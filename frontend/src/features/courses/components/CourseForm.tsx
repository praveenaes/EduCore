import { forwardRef, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { courseSchema, type CourseFormValues } from '../../../validators/courseValidator';
import { getProgramsApi } from '../../../services/programService';
import type { Course, CreateCoursePayload, UpdateCoursePayload } from '../../../types/course';
import type { Program } from '../../../types/program';

interface CourseFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Course>;
  isLoading?: boolean;
  onSubmit: (data: CreateCoursePayload | UpdateCoursePayload) => Promise<void>;
  onCancel: () => void;
}

const CourseForm = forwardRef<HTMLFormElement, CourseFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  const LEVEL_PRESETS = [
    { value: 'Semester', label: 'Semester (e.g. 6–8 Semesters)', defaultCount: 8 },
    { value: 'Year', label: 'Year (e.g. 1–4 Years)', defaultCount: 4 },
    { value: 'Class', label: 'Class / Grade (e.g. Class 1–10)', defaultCount: 10 },
    { value: 'Term', label: 'Term (e.g. 1–3 Terms)', defaultCount: 3 },
    { value: 'Trimester', label: 'Trimester (3 Trimesters)', defaultCount: 3 },
    { value: 'Quarter', label: 'Quarter (4 Quarters)', defaultCount: 4 },
    { value: 'Module', label: 'Module (e.g. 1–4 Modules)', defaultCount: 4 },
    { value: 'Week', label: 'Week (e.g. 1–8 Weeks)', defaultCount: 8 },
    { value: 'Level', label: 'Level (Generic: Level 1–5)', defaultCount: 3 },
    { value: 'custom', label: 'Custom... (Type your own name)', defaultCount: 2 },
  ];

  const LEVEL_COUNT_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i + 1 === 1 ? 'Level' : 'Levels'}`,
  }));

  const initialLevelName = defaultValues?.levelName ?? 'Semester';
  const matchingPreset = LEVEL_PRESETS.find(
    (p) => p.value !== 'custom' && p.value.toLowerCase() === initialLevelName.toLowerCase()
  );
  const [selectedPreset, setSelectedPreset] = useState<string>(
    matchingPreset ? matchingPreset.value : (initialLevelName ? 'custom' : 'Semester')
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      programId: defaultValues?.programId ?? '',
      name: defaultValues?.name ?? '',
      code: defaultValues?.code ?? '',
      durationMonths: String(defaultValues?.durationMonths ?? 6),
      levelName: defaultValues?.levelName ?? 'Semester',
      levelCount: String(defaultValues?.levelCount ?? 8),
      description: defaultValues?.description ?? '',
    },
  });

  const watchedLevelName = useWatch({ control, name: 'levelName' });
  const watchedLevelCount = useWatch({ control, name: 'levelCount' });

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen = e.target.value;
    setSelectedPreset(chosen);

    const presetObj = LEVEL_PRESETS.find((p) => p.value === chosen);
    if (chosen !== 'custom' && presetObj) {
      setValue('levelName', presetObj.value, { shouldValidate: true });
      setValue('levelCount', String(presetObj.defaultCount), { shouldValidate: true });
    } else if (chosen === 'custom') {
      setValue('levelName', '', { shouldValidate: true });
    }
  };

  useEffect(() => {
    const fetchProgramsList = async () => {
      setIsLoadingPrograms(true);
      try {
        const res = await getProgramsApi({ limit: 100 });
        setPrograms(res.data.data.programs);
      } catch {
        // Graceful fallback
      } finally {
        setIsLoadingPrograms(false);
      }
    };
    fetchProgramsList();
  }, []);

  const handleFormSubmit = async (data: CourseFormValues) => {
    const payload = {
      ...data,
      durationMonths: Number(data.durationMonths),
      levelCount: Number(data.levelCount),
    };
    try {
      await onSubmit(payload);
    } catch (err: any) {
      const errorsList = err.response?.data?.errors;
      if (errorsList && Array.isArray(errorsList)) {
        errorsList.forEach((e: any) => {
          const fieldName = e.field.replace('body.', '');
          setError(fieldName as any, { type: 'manual', message: e.message });
        });
      }
      throw err;
    }
  };

  const levelCountNum = Number(watchedLevelCount) || 0;
  const levelNameClean = (watchedLevelName || 'Level').trim();
  const previewLevels = Array.from(
    { length: Math.min(Math.max(levelCountNum, 0), 10) },
    (_, i) => levelNameClean + ' ' + (i + 1)
  );

  return (
    <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Program Selection */}
      <div>
        <Select
          label="Academic Program"
          error={errors.programId?.message}
          {...register('programId')}
          options={[
            { value: '', label: isLoadingPrograms ? 'Loading programs…' : 'Select a program' },
            ...programs.map((p) => ({
              value: p.id,
              label: p.name + ' (' + p.code + ')',
            })),
          ]}
        />
      </div>

      {/* Basic Course Details */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Course Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Course Name"
            placeholder="e.g. Python Full Stack"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Course Code"
            placeholder="e.g. PFS-01"
            error={errors.code?.message}
            {...register('code')}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              register('code').onChange(e);
            }}
          />
          <Input
            label="Duration (Months)"
            type="number"
            min={1}
            max={60}
            placeholder="e.g. 6"
            error={errors.durationMonths?.message}
            {...register('durationMonths')}
          />
        </div>
      </section>

      {/* Level Generation Settings */}
      <section className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Levels Configuration
        </h3>
        <p className="text-xs text-neutral-400 mb-3">
          Select the level format and how many levels this course has. Levels will be auto-generated.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Level Preset Dropdown */}
          <Select
            label="Level Structure"
            value={selectedPreset}
            onChange={handlePresetChange}
            options={LEVEL_PRESETS.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
          />

          {/* Level Count Dropdown */}
          <Select
            label="Total Levels Count"
            error={errors.levelCount?.message}
            {...register('levelCount')}
            options={LEVEL_COUNT_OPTIONS}
          />

          {/* If Custom is selected, reveal custom input */}
          {selectedPreset === 'custom' && (
            <div className="sm:col-span-2">
              <Input
                label="Custom Level Name"
                placeholder="e.g. Stage, Phase, Sprint"
                error={errors.levelName?.message}
                {...register('levelName')}
              />
            </div>
          )}
        </div>

        {/* Live Preview of Generated Levels */}
        {previewLevels.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-200/50">
            <span className="text-xs font-medium text-neutral-500 block mb-1.5">
              Generated Levels Preview ({previewLevels.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {previewLevels.map((lvl, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

        {/* Compulsory Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Detailed description of the course curriculum and objectives…"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
          {errors.description?.message && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Add Course' : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }
);

CourseForm.displayName = 'CourseForm';
export default CourseForm;
