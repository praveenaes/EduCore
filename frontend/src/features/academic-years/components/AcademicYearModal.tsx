import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import AcademicYearForm from './AcademicYearForm';
import { createAcademicYearApi, updateAcademicYearApi } from '../../../services/academicYearService';
import type { AcademicYear, CreateAcademicYearPayload, UpdateAcademicYearPayload } from '../../../types/academicYear';

interface AcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  academicYear?: AcademicYear | null;
}

export const AcademicYearModal: React.FC<AcademicYearModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  academicYear,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(academicYear);

  const handleSubmit = async (data: CreateAcademicYearPayload | UpdateAcademicYearPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && academicYear) {
        await updateAcademicYearApi(academicYear.id, data);
      } else {
        await createAcademicYearApi(data as CreateAcademicYearPayload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message ?? 'An error occurred. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Academic Year' : 'Add New Academic Year'}
      icon={<Calendar className="h-5 w-5 text-brand-600" />}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <AcademicYearForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={academicYear ?? undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default AcademicYearModal;
