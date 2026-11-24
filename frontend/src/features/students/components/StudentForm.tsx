import React, { forwardRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Camera } from 'lucide-react';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { SearchableSelect } from '../../../components/SearchableSelect';
import { GetCountries, GetState } from 'react-country-state-city';
import type { Student, CreateStudentPayload, UpdateStudentPayload } from '../../../types/student';
import { getPhotoUrl } from '../../../utils/photo';
import { ConfirmationModal } from '../../../components/ConfirmationModal';


const validatePastDate = (val: string) => {
  const date = new Date(val);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const baseSchema = {
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters')
    .regex(/^[A-Za-z]+$/, 'First name must contain letters only'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters')
    .regex(/^[A-Za-z]+$/, 'Last name must contain letters only'),
  admissionDate: z.string().trim().min(1, 'Admission date is required'),
  gender: z.enum(['Male', 'Female', 'Other'] as const, {
    error: 'Select a gender',
  }),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, 'Date of birth is required')
    .refine(validatePastDate, 'Date of birth must be a past date'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const, {
    error: 'Select a blood group',
  }),
  nationalId: z
    .string()
    .trim()
    .min(1, 'National ID is required')
    .max(30)
    .regex(/^NID\d{3}$/, 'National ID must be in the format NID001'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .regex(/^[1-9]\d{9}$/, 'Phone number must be exactly 10 digits and cannot start with 0'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
  house: z
    .string()
    .trim()
    .min(1, 'House / Street is required')
    .max(100)
    .regex(
      /^(?=.*[A-Za-z])[A-Za-z0-9\s]+$/,
      'House / Street must contain letters and cannot consist of numbers only or contain special characters',
    ),
  area: z
    .string()
    .trim()
    .min(1, 'Area is required')
    .max(100)
    .regex(
      /^(?=.*[A-Za-z])[A-Za-z0-9\s]+$/,
      'Area must contain letters and cannot consist of numbers only or contain special characters',
    ),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100)
    .regex(/^[A-Za-z\s]+$/, 'City must contain only letters and spaces'),
  state: z.string().trim().min(1, 'State is required').max(100),
  postalCode: z
    .string()
    .trim()
    .min(1, 'Postal code is required')
    .regex(/^\d{6}$/, 'Postal code must be exactly 6 digits')
    .refine((val) => val !== '000000', 'Invalid postal code'),
  country: z.string().trim().min(1, 'Country is required').max(100),
};

const createSchema = z.object({
  admissionNumber: z
    .string()
    .trim()
    .min(1, 'Admission number is required')
    .max(50)
    .regex(/^STU\d{3}$/, 'Admission Number must be in the format STU001'),
  ...baseSchema,
});

const updateSchema = z.object(baseSchema);

export type CreateStudentFormValues = z.infer<typeof createSchema>;
export type UpdateStudentFormValues = z.infer<typeof updateSchema>;

const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};


interface StudentFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Student>;
  isLoading?: boolean;
  onSubmit: (
    data: CreateStudentPayload | UpdateStudentPayload,
    photo: File | null,
  ) => Promise<void>;
  onCancel: () => void;
}

 //Helper: format date to yyyy-MM-dd for input[type=date] 
const toDateInputValue = (d?: string) => {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
};


const StudentForm = forwardRef<HTMLFormElement, StudentFormProps>(
  ({ mode, defaultValues, isLoading, onSubmit, onCancel }, ref) => {
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>(getPhotoUrl(defaultValues?.photo));
    const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [countries, setCountries] = useState<
      { value: string; label: string; emoji?: string; id: number }[]
    >([]);
    const [states, setStates] = useState<{ value: string; label: string; id: number }[]>([]);

    const schema = mode === 'create' ? createSchema : updateSchema;

    const {
      register,
      handleSubmit,
      control,
      setValue,
      setError,
      formState: { errors },
    } = useForm<CreateStudentFormValues | UpdateStudentFormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        ...(mode === 'create' ? { admissionNumber: '' } : {}),
        firstName: defaultValues?.firstName ?? '',
        lastName: defaultValues?.lastName ?? '',
        admissionDate: toDateInputValue(defaultValues?.admissionDate),
        gender: (defaultValues?.gender as 'Male' | 'Female' | 'Other') ?? 'Male',
        dateOfBirth: toDateInputValue(defaultValues?.dateOfBirth),
        bloodGroup: (defaultValues?.bloodGroup as CreateStudentFormValues['bloodGroup']) ?? 'O+',
        nationalId: defaultValues?.nationalId ?? '',
        phone: defaultValues?.phone ?? '',
        email: defaultValues?.email ?? '',
        house: defaultValues?.house ?? '',
        area: defaultValues?.area ?? '',
        city: defaultValues?.city ?? '',
        state: defaultValues?.state ?? '',
        postalCode: defaultValues?.postalCode ?? '',
        country: defaultValues?.country ?? '',
      },
    });

    useEffect(() => {
      GetCountries().then((data) => {
        const mapped = data.map((c: any) => ({
          value: c.name,
          label: c.name,
          emoji: c.emoji,
          id: c.id,
        }));
        setCountries(mapped);

        // If in edit mode, load states list for the default country name
        if (defaultValues?.country) {
          const match = mapped.find(
            (c) => c.value.toLowerCase() === defaultValues.country?.toLowerCase(),
          );
          if (match) {
            GetState(match.id).then((stateData) => {
              setStates(
                stateData.map((s: any) => ({
                  value: s.name,
                  label: s.name,
                  id: s.id,
                })),
              );
            });
          }
        }
      });
    }, [defaultValues]);

    const handleCountryChange = (selectedCountryName: string) => {
      setValue('country', selectedCountryName, { shouldValidate: true });
      setValue('state', '', { shouldValidate: true });
      setStates([]);

      const match = countries.find((c) => c.value === selectedCountryName);
      if (match) {
        GetState(match.id).then((stateData) => {
          setStates(
            stateData.map((s: any) => ({
              value: s.name,
              label: s.name,
              id: s.id,
            })),
          );
        });
      }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setPhoto(file);
      if (file) {
        setPhotoPreview(URL.createObjectURL(file));
        setShouldRemovePhoto(false);
      }
    };

    const handleRemovePhoto = () => {
      setPhoto(null);
      setPhotoPreview('');
      setShouldRemovePhoto(true);
    };

    const handleFormSubmit = async (data: CreateStudentFormValues | UpdateStudentFormValues) => {
      const payload = {
        ...data,
        ...(shouldRemovePhoto ? { removePhoto: 'true' } : {}),
      };
      try {
        await onSubmit(payload as CreateStudentPayload | UpdateStudentPayload, photo);
      } catch (err: any) {
        const errorsList = err.response?.data?.errors;
        if (errorsList && Array.isArray(errorsList)) {
          errorsList.forEach((e: any) => {
            const rawField = e.field || e.path || '';
            const fieldName = rawField.replace('body.', '');
            if (fieldName === 'username') {
              setError(mode === 'create' ? 'admissionNumber' : ('email' as any), {
                type: 'manual',
                message: e.message,
              });
            } else {
              setError(fieldName as any, { type: 'manual', message: e.message });
            }
          });
        }
        throw err;
      }
    };

    const err = errors as Record<string, { message?: string }>;

    return (
      <form ref={ref} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Photo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-neutral-300" />
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-neutral-400">JPG, PNG, or WebP · Max 2 MB</p>
            {photoPreview && (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First Name" error={err.firstName?.message} {...register('firstName')} />
            <Input label="Last Name" error={err.lastName?.message} {...register('lastName')} />
            {mode === 'create' && (
              <Input
                label="Admission Number"
                error={err.admissionNumber?.message}
                {...register('admissionNumber')}
                placeholder="e.g. STU001"
              />
            )}
            <Input
              label="Admission Date"
              type="date"
              error={err.admissionDate?.message}
              {...register('admissionDate')}
            />
            <Select
              label="Gender"
              error={err.gender?.message}
              {...register('gender')}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Input
              label="Date of Birth"
              type="date"
              max={getYesterdayDateString()}
              error={err.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
            <Select
              label="Blood Group"
              error={err.bloodGroup?.message}
              {...register('bloodGroup')}
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({
                value: g,
                label: g,
              }))}
            />
            <Input
              label="National ID"
              error={err.nationalId?.message}
              {...register('nationalId')}
              placeholder="e.g. NID001"
            />
          </div>
        </section>

        {/* Contact */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Contact
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              type="tel"
              error={err.phone?.message}
              placeholder="+1 555 000 0000"
              {...register('phone')}
            />
            <Input label="Email" type="email" error={err.email?.message} {...register('email')} />
          </div>
        </section>

        {/* Address */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Address
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="House / Street" error={err.house?.message} {...register('house')} />
            <Input label="Area" error={err.area?.message} {...register('area')} />
            <Input label="City" error={err.city?.message} {...register('city')} />
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="State"
                  placeholder="Select State"
                  value={field.value}
                  onChange={field.onChange}
                  options={states}
                  error={err.state?.message}
                />
              )}
            />
            <Input
              label="Postal Code"
              error={err.postalCode?.message}
              {...register('postalCode')}
            />
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Country"
                  placeholder="Select Country"
                  value={field.value}
                  onChange={handleCountryChange}
                  options={countries}
                  error={err.country?.message}
                />
              )}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? 'Add Student' : 'Save Changes'}
          </Button>
        </div>

        <ConfirmationModal
          isOpen={showConfirmModal}
          title="Remove Student Photo?"
          message="Are you sure you want to remove this student's photo?"
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={() => {
            handleRemovePhoto();
            setShowConfirmModal(false);
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      </form>
    );
  },
);

StudentForm.displayName = 'StudentForm';
export default StudentForm;
