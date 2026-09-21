import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { MultiSelect } from '../../../components/MultiSelect';
import type { MultiSelectOption } from '../../../components/MultiSelect';
import { academicYearSchema, type AcademicYearFormData } from '../../../validators/academicYearValidator';
import { getCentersApi } from '../../../services/centerService';
import type { AcademicYear, CreateAcademicYearPayload, UpdateAcademicYearPayload } from '../../../types/academicYear';

interface AcademicYearFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<AcademicYear>;
  isLoading?: boolean;
  onSubmit: (data: CreateAcademicYearPayload | UpdateAcademicYearPayload) => Promise<void>;
  onCancel: () => void;
}

export const AcademicYearForm: React.FC<AcademicYearFormProps> = ({
  mode,
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const [centerOptions, setCenterOptions] = useState<MultiSelectOption[]>([]);

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const computeDefaultEndDate = (startStr?: string): string => {
    if (!startStr) return '';
    const parts = startStr.split('-');
    if (parts.length !== 3) return '';

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

    const d = new Date(year + 1, month, day);
    d.setDate(d.getDate() - 1);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialCenters: string[] = (defaultValues?.centers || []).map((c) =>
    typeof c === 'string' ? c : c.id
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      code: defaultValues?.code ?? '',
      startDate: formatDateForInput(defaultValues?.startDate),
      endDate: formatDateForInput(defaultValues?.endDate),
      current: defaultValues?.current ?? false,
      centers: initialCenters,
    },
  });

  useEffect(() => {
    getCentersApi({ limit: 100, status: 'active' })
      .then((res) => {
        const centers = res.data.data.centers || [];
        setCenterOptions(
          centers.map((c) => ({
            value: c.id,
            label: `${c.name} (${c.code})`,
          }))
        );
      })
      .catch((err) => console.error('Failed to load centers:', err));
  }, []);

  const handleFormSubmit = async (data: AcademicYearFormData) => {
    await onSubmit({
      name: data.name,
      code: data.code.toUpperCase(),
      startDate: data.startDate,
      endDate: data.endDate,
      current: data.current,
      centers: data.centers,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name')}
            placeholder="e.g. 2025-2026 Academic Year"
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('code')}
            placeholder="e.g. AY-2025-26"
            error={errors.code?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            {...register('startDate', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                const defaultEnd = computeDefaultEndDate(val);
                if (defaultEnd) {
                  setValue('endDate', defaultEnd, { shouldValidate: true });
                }
              },
            })}
            error={errors.startDate?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>
      </div>

      <div>
        <Controller
          name="centers"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Assigned Centers / Campuses"
              options={centerOptions}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select centers running this academic year..."
              error={errors.centers?.message}
            />
          )}
        />
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('current')}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Set as Current / Active Academic Year
          </span>
        </label>
        <p className="text-xs text-gray-500 ml-6 mt-0.5">
          Marking this as current will make it the active default academic year across the system.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : mode === 'edit'
            ? 'Update Academic Year'
            : 'Create Academic Year'}
        </Button>
      </div>
    </form>
  );
};

export default AcademicYearForm;
