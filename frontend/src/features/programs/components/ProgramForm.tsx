import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { programSchema, type ProgramFormValues } from '../../../validators/programValidator';
import type { Program, CreateProgramPayload, UpdateProgramPayload } from '../../../types/program';

// ── Props ─────────────────────────────────────────────────────────────────────
interface ProgramFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Program>;
  isLoading?: boolean;
  onSubmit: (data: CreateProgramPayload | UpdateProgramPayload) => Promise<void>;
  onCancel: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
const ProgramForm = forwardRef<HTMLFormElement, ProgramFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const {
      register,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<ProgramFormValues>({
      resolver: zodResolver(programSchema),
      defaultValues: {
        name: defaultValues?.name ?? '',
        code: defaultValues?.code ?? '',
        description: defaultValues?.description ?? '',
      },
    });

    const handleFormSubmit = async (data: ProgramFormValues) => {
      try {
        await onSubmit(data);
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

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Program Details */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Program Details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Program Name"
              placeholder="e.g. Full Stack Development"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Program Code"
              placeholder="e.g. FSD-2026"
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
              Description{' '}
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Brief description of this program…"
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
            {mode === 'create' ? 'Add Program' : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }
);

ProgramForm.displayName = 'ProgramForm';
export default ProgramForm;