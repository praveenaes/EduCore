import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { subjectSchema, type SubjectFormValues } from '../../../validators/subjectValidator';
import type { Subject, CreateSubjectPayload, UpdateSubjectPayload } from '../../../types/subject';

interface SubjectFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Subject>;
  isLoading?: boolean;
  onSubmit: (data: CreateSubjectPayload | UpdateSubjectPayload) => Promise<void>;
  onCancel: () => void;
}

const SubjectForm = forwardRef<HTMLFormElement, SubjectFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const {
      register,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<SubjectFormValues>({
      resolver: zodResolver(subjectSchema),
      defaultValues: {
        name: defaultValues?.name ?? '',
        code: defaultValues?.code ?? '',
        description: defaultValues?.description ?? '',
      },
    });

    const handleFormSubmit = async (data: SubjectFormValues) => {
      try {
        await onSubmit(data);
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { errors?: Array<{ field: string; message: string }> } } };
        const errorsList = errorObj.response?.data?.errors;
        if (errorsList && Array.isArray(errorsList)) {
          errorsList.forEach((e) => {
            const fieldName = e.field.replace('body.', '');
            setError(fieldName as keyof SubjectFormValues, { type: 'manual', message: e.message });
          });
        }
        throw err;
      }
    };

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Subject Details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Subject Name"
              placeholder="e.g. Data Structures & Algorithms"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Subject Code"
              placeholder="e.g. DSA-101"
              error={errors.code?.message}
              {...register('code')}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('code').onChange(e);
              }}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Brief description of this subject…"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
            />
            {errors.description?.message && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Add Subject' : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }
);

SubjectForm.displayName = 'SubjectForm';

export default SubjectForm;
