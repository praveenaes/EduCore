import { forwardRef, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { feeAssignmentSchema, type FeeAssignmentFormValues } from '../../../validators/feeValidator';
import { getBatchesApi } from '../../../services/batchService';
import { getCentersApi } from '../../../services/centerService';
import { getCoursesApi } from '../../../services/courseService';
import { getStudentsApi } from '../../../services/studentService';
import type { CreateFeeAssignmentPayload } from '../../../types/fee';

interface OptionItem {
  id: string;
  label: string;
}

interface FeeAssignmentFormProps {
  isLoading?: boolean;
  onSubmit: (data: CreateFeeAssignmentPayload) => Promise<void>;
  onCancel: () => void;
}

const FeeAssignmentForm = forwardRef<HTMLFormElement, FeeAssignmentFormProps>(
  ({ isLoading, onSubmit, onCancel }, ref) => {
    const [batches, setBatches] = useState<OptionItem[]>([]);
    const [centers, setCenters] = useState<OptionItem[]>([]);
    const [courses, setCourses] = useState<OptionItem[]>([]);
    const [students, setStudents] = useState<OptionItem[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const {
      register,
      handleSubmit,
      control,
      setValue,
      setError,
      formState: { errors },
    } = useForm<FeeAssignmentFormValues>({
      resolver: zodResolver(feeAssignmentSchema),
      defaultValues: {
        title: '',
        amount: '' as any,
        dueDate: '',
        remarks: '',
        audience: 'batch',
        batchIds: [],
        centerIds: [],
        courseIds: [],
        studentIds: [],
      },
    });

    const watchedAudience = useWatch({ control, name: 'audience' });
    const watchedBatchIds = useWatch({ control, name: 'batchIds' }) || [];
    const watchedCenterIds = useWatch({ control, name: 'centerIds' }) || [];
    const watchedCourseIds = useWatch({ control, name: 'courseIds' }) || [];
    const watchedStudentIds = useWatch({ control, name: 'studentIds' }) || [];

    useEffect(() => {
      const fetchAudienceData = async () => {
        setLoadingOptions(true);
        try {
          if (watchedAudience === 'batch' && batches.length === 0) {
            const res = await getBatchesApi({ page: 1, limit: 1000 });
            setBatches(res.data.data.batches.map((b) => ({ id: b.id, label: b.name })));
          } else if (watchedAudience === 'center' && centers.length === 0) {
            const res = await getCentersApi({ page: 1, limit: 1000 });
            setCenters(res.data.data.centers.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` })));
          } else if (watchedAudience === 'course' && courses.length === 0) {
            const res = await getCoursesApi({ page: 1, limit: 1000 });
            setCourses(res.data.data.courses.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` })));
          } else if (watchedAudience === 'student' && students.length === 0) {
            const res = await getStudentsApi({ page: 1, limit: 1000 });
            setStudents(
              res.data.data.students.map((s) => ({
                id: s.id,
                label: `${s.firstName} ${s.lastName} (${s.admissionNumber})`,
              }))
            );
          }
        } catch (error) {
          console.error('Failed to load audience options', error);
        } finally {
          setLoadingOptions(false);
        }
      };

      fetchAudienceData();
    }, [watchedAudience, batches.length, centers.length, courses.length, students.length]);

    const handleCheckboxToggle = (
      fieldName: 'batchIds' | 'centerIds' | 'courseIds' | 'studentIds',
      currentList: string[],
      id: string
    ) => {
      const exists = currentList.includes(id);
      const updated = exists ? currentList.filter((item) => item !== id) : [...currentList, id];
      setValue(fieldName, updated, { shouldValidate: true });
    };

    const handleSelectAll = (
      fieldName: 'batchIds' | 'centerIds' | 'courseIds' | 'studentIds',
      allIds: string[]
    ) => {
      setValue(fieldName, allIds, { shouldValidate: true });
    };

    const handleClearAll = (fieldName: 'batchIds' | 'centerIds' | 'courseIds' | 'studentIds') => {
      setValue(fieldName, [], { shouldValidate: true });
    };

    const handleFormSubmit = async (data: FeeAssignmentFormValues) => {
      try {
        await onSubmit({
          ...data,
          amount: Number(data.amount),
        });
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

    const getCurrentOptions = () => {
      if (watchedAudience === 'batch') return { items: batches, selected: watchedBatchIds, field: 'batchIds' as const };
      if (watchedAudience === 'center') return { items: centers, selected: watchedCenterIds, field: 'centerIds' as const };
      if (watchedAudience === 'course') return { items: courses, selected: watchedCourseIds, field: 'courseIds' as const };
      return { items: students, selected: watchedStudentIds, field: 'studentIds' as const };
    };

    const currentAudienceConfig = getCurrentOptions();
    const filteredOptions = currentAudienceConfig.items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Fee Title"
            placeholder="e.g. Term 1 Tuition Fee"
            error={errors.title?.message}
            {...register('title')}
          />
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="e.g. 15000"
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
          <Select
            label="Audience Type"
            options={[
              { value: 'batch', label: 'By Batch' },
              { value: 'center', label: 'By Center' },
              { value: 'course', label: 'By Course' },
              { value: 'student', label: 'Individual Students' },
            ]}
            error={errors.audience?.message}
            {...register('audience')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500/20"
            placeholder="Add any notes or payment terms..."
            {...register('remarks')}
          />
          {errors.remarks && <p className="text-xs text-red-600 mt-1">{errors.remarks.message}</p>}
        </div>

        {/* Dynamic Audience Multi-selector Checklist */}
        <div className="space-y-2 border border-neutral-200 rounded-lg p-3 bg-neutral-50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Select {watchedAudience.charAt(0).toUpperCase() + watchedAudience.slice(1)}s ({currentAudienceConfig.selected.length} selected)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(currentAudienceConfig.field, currentAudienceConfig.items.map((i) => i.id))}
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                Select All
              </button>
              <span className="text-xs text-neutral-300">|</span>
              <button
                type="button"
                onClick={() => handleClearAll(currentAudienceConfig.field)}
                className="text-xs text-neutral-500 hover:underline font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder={`Search ${watchedAudience}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {loadingOptions ? (
            <p className="text-xs text-neutral-400 py-3 text-center">Loading options...</p>
          ) : (
            <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2 border border-neutral-200 rounded">
              {filteredOptions.length === 0 ? (
                <p className="text-xs text-neutral-400 py-2 text-center">No options found</p>
              ) : (
                filteredOptions.map((item) => {
                  const checked = currentAudienceConfig.selected.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 text-xs text-neutral-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleCheckboxToggle(
                            currentAudienceConfig.field,
                            currentAudienceConfig.selected,
                            item.id
                          )
                        }
                        className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}

          {errors[currentAudienceConfig.field] && (
            <p className="text-xs text-red-600">
              {(errors[currentAudienceConfig.field] as any)?.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Assign Fees
          </Button>
        </div>
      </form>
    );
  }
);

FeeAssignmentForm.displayName = 'FeeAssignmentForm';

export default FeeAssignmentForm;
