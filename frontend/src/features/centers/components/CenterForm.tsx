import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { Select } from '../../../components/Select';
import { centerSchema, type CenterFormData } from '../../../validators/centerValidator';
import type { Center, CreateCenterPayload, UpdateCenterPayload } from '../../../types/center';

interface CenterFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Center>;
  isLoading?: boolean;
  onSubmit: (data: CreateCenterPayload | UpdateCenterPayload) => Promise<void>;
  onCancel: () => void;
}

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const CenterForm = forwardRef<HTMLFormElement, CenterFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const {
      register,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<CenterFormData>({
      resolver: zodResolver(centerSchema),
      defaultValues: {
        name: defaultValues?.name ?? '',
        code: defaultValues?.code ?? '',
        phone: defaultValues?.phone ?? '',
        email: defaultValues?.email ?? '',
        timezone: defaultValues?.timezone ?? 'Asia/Kolkata',
        addressLine1: defaultValues?.address?.addressLine1 ?? '',
        city: defaultValues?.address?.city ?? '',
        state: defaultValues?.address?.state ?? '',
        postalCode: defaultValues?.address?.postalCode ?? '',
        country: defaultValues?.address?.country ?? '',
        status: defaultValues?.status ?? 'active',
      },
    });

    const handleFormSubmit = async (data: CenterFormData) => {
      try {
        const payload: CreateCenterPayload = {
          name: data.name,
          code: data.code,
          phone: data.phone,
          email: data.email,
          timezone: data.timezone,
          address: {
            addressLine1: data.addressLine1,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
          },
          status: data.status,
        };
        await onSubmit(payload);
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { errors?: Array<{ field: string; message: string }> } } };
        const errorsList = errorObj.response?.data?.errors;
        if (errorsList && Array.isArray(errorsList)) {
          errorsList.forEach((e) => {
            const fieldName = e.field.replace('body.', '');
            setError(fieldName as keyof CenterFormData, { type: 'manual', message: e.message });
          });
        }
        throw err;
      }
    };

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Center Details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Center Name"
              placeholder="e.g. Kochi Campus"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Center Code"
              placeholder="e.g. KC-01"
              error={errors.code?.message}
              {...register('code')}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('code').onChange(e);
              }}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Contact & Timezone
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Phone"
              placeholder="+91 9876543210"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="kochi@educore.edu"
              error={errors.email?.message}
              {...register('email')}
            />
            <Select
              label="Timezone"
              options={COMMON_TIMEZONES}
              error={errors.timezone?.message}
              {...register('timezone')}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Location & Address
          </h3>
          <div className="space-y-4">
            <Input
              label="Address Line 1"
              placeholder="e.g. Infopark Expressway, Kakkanad"
              error={errors.addressLine1?.message}
              {...register('addressLine1')}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Input
                label="City"
                placeholder="Kochi"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="State"
                placeholder="Kerala"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="Postal Code"
                placeholder="682030"
                error={errors.postalCode?.message}
                {...register('postalCode')}
              />
              <Input
                label="Country"
                placeholder="India"
                error={errors.country?.message}
                {...register('country')}
              />
            </div>
          </div>
        </section>

        <section>
          <div className="w-48">
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Add Center' : 'Save Changes'}
          </Button>
        </div>
      </form>
    );
  }
);

CenterForm.displayName = 'CenterForm';

export default CenterForm;
