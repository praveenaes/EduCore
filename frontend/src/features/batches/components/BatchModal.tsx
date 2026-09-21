import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import BatchForm from './BatchForm';
import { createBatchApi, updateBatchApi } from '../../../services/batchService';
import type {
  Batch,
  CreateBatchPayload,
  UpdateBatchPayload,
} from '../../../types/batch';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batch?: Batch | null;
}

const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  batch,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setError(null);
    }
  }

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const isEditMode = Boolean(batch);

  const handleSubmit = async (
    data: CreateBatchPayload | UpdateBatchPayload
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && batch) {
        await updateBatchApi(batch.id, data as UpdateBatchPayload);
      } else {
        await createBatchApi(data as CreateBatchPayload);
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'An error occurred. Please try again.';
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
      onClose={handleClose}
      title={isEditMode ? 'Edit Batch' : 'Create New Batch'}
      icon={<Users className="h-5 w-5" />}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <BatchForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={batch ?? undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default BatchModal;
