import { useEffect, useState, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import {
  getAssessmentSchema,
  type AssessmentFormValues,
} from '../../../validators/assessmentValidator';
import { getAcademicYearsApi } from '../../../services/academicYearService';
import type { AcademicYear } from '../../../types/academicYear';
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
    const [isLoadingYears, setIsLoadingYears] = useState(false);
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
      watch,
      formState: { errors },
    } = useForm<AssessmentFormValues>({
      resolver: zodResolver(getAssessmentSchema(mode)),
      defaultValues: {
        name: defaultValues?.name ?? '',
        academicYearId: defaultValues?.academicYearId ?? '',
        startDate: formatDateForInput(defaultValues?.startDate),
        endDate: formatDateForInput(defaultValues?.endDate),
        status: defaultValues?.status ?? 'DRAFT',
      },
    });

    const watchedStartDate = watch('startDate');

    const isStandardPreset = (val?: string) =>
      STANDARD_EXAM_PRESETS.includes(val as any);

    const [presetChoice, setPresetChoice] = useState<string>(() => {
      if (!defaultValues?.name) return '';
      return isStandardPreset(defaultValues.name) ? defaultValues.name : 'CUSTOM';
    });

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setPresetChoice(val);
      if (val === 'CUSTOM') {
        setValue(
          'name',
          defaultValues?.name && !isStandardPreset(defaultValues.name)
            ? defaultValues.name
            : '',
          { shouldValidate: true }
        );
      } else {
        setValue('name', val, { shouldValidate: true });
      }
    };

    useEffect(() => {
      const loadYears = async () => {
        setIsLoadingYears(true);
        setError(null);
        try {
          const res = await getAcademicYearsApi({ limit: 100 });
          setAcademicYears(res.data.data.academicYears || []);
        } catch (err: any) {
          setError(err?.response?.data?.message || 'Failed to load academic years.');
        } finally {
          setIsLoadingYears(false);
        }
      };
      loadYears();
    }, []);

    useEffect(() => {
      if (defaultValues) {
        const isStandard = isStandardPreset(defaultValues.name);
        setPresetChoice(
          isStandard
            ? defaultValues.name!
            : defaultValues.name
            ? 'CUSTOM'
            : ''
        );
        reset({
          name: defaultValues.name ?? '',
          academicYearId: defaultValues.academicYearId ?? '',
          startDate: formatDateForInput(defaultValues.startDate),
          endDate: formatDateForInput(defaultValues.endDate),
          status: defaultValues.status ?? 'DRAFT',
        });
      }
    }, [defaultValues, reset]);

    const handleFormSubmit = async (values: AssessmentFormValues) => {
      await onSubmit({
        name: values.name.trim(),
        academicYearId: values.academicYearId,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        ...(values.status ? { status: values.status as any } : {}),
      });
    };

    const academicYearOptions = [
      {
        value: '',
        label: isLoadingYears ? 'Loading academic years...' : 'Select Academic Year',
      },
      ...academicYears.map((ay) => ({
        value: ay.id,
        label: `${ay.name} (${ay.code})${ay.current ? ' - Current' : ''}`,
      })),
    ];

    const examPresetOptions = [
      { value: '', label: 'Select standard exam...' },
      ...STANDARD_EXAM_PRESETS.map((p) => ({ value: p, label: p })),
      { value: 'CUSTOM', label: 'Other / Custom Exam Name...' },
    ];

    const statusOptions = [
      { value: 'DRAFT', label: 'Draft (In preparation / hidden from students)' },
      { value: 'PUBLISHED', label: 'Published (Released to students)' },
      { value: 'COMPLETED', label: 'Completed (Term concluded & archived)' },
      { value: 'CANCELLED', label: 'Cancelled (Called off)' },
    ];

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        <Select
          label="Exam / Assessment Type"
          options={examPresetOptions}
          value={presetChoice}
          onChange={handlePresetChange}
          error={presetChoice !== 'CUSTOM' ? errors.name?.message : undefined}
        />

        {presetChoice === 'CUSTOM' && (
          <Input
            label="Custom Exam Title"
            placeholder="e.g. Practical Lab Assessment / Supplementary Exam"
            {...register('name')}
            error={errors.name?.message}
            autoFocus
          />
        )}

        {mode === 'edit' && (
          <Select
            label="Assessment Status"
            options={statusOptions}
            {...register('status')}
            error={errors.status?.message}
          />
        )}

        <Select
          label="Academic Year"
          options={academicYearOptions}
          {...register('academicYearId')}
          error={errors.academicYearId?.message || error || undefined}
          disabled={isLoadingYears}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            min={todayStr}
            {...register('startDate')}
            error={errors.startDate?.message}
          />

          <Input
            label="End Date"
            type="date"
            min={watchedStartDate || todayStr}
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
