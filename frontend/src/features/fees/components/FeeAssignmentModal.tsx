import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import FeeAssignmentForm from './FeeAssignmentForm';
import { createFeeAssignmentsApi } from '../../../services/feeService';
import type { CreateFeeAssignmentPayload } from '../../../types/fee';

interface FeeAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FeeAssignmentModal: React.FC<FeeAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateFeeAssignmentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await createFeeAssignmentsApi(data);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to assign fees. Please try again.';
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
      title="Assign Fees to Students"
      icon={<CreditCard className="h-5 w-5" />}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}
      <FeeAssignmentForm
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default FeeAssignmentModal;
