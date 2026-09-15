import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import CenterForm from './CenterForm';
import { createCenterApi, updateCenterApi } from '../../../services/centerService';
import type { Center, CreateCenterPayload, UpdateCenterPayload } from '../../../types/center';

interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  center?: Center | null;
}

export const CenterModal: React.FC<CenterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  center,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(center);

  const handleSubmit = async (data: CreateCenterPayload | UpdateCenterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && center) {
        await updateCenterApi(center.id, data);
      } else {
        await createCenterApi(data as CreateCenterPayload);
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
      title={isEditMode ? 'Edit Center / Campus' : 'Add New Center / Campus'}
      icon={<Building2 className="h-5 w-5 text-brand-600" />}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <CenterForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={center ?? undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default CenterModal;
