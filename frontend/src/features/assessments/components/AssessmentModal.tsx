import React, { useState } from 'react';
import { Award, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import AssessmentForm from './AssessmentForm';
import {
  createAssessmentApi,
  updateAssessmentApi,
} from '../../../services/assessmentService';
import type {
  Assessment,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from '../../../types/assessment';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assessment?: Assessment | null;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assessment,
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

  const isEditMode = Boolean(assessment);

  const handleSubmit = async (
    data: CreateAssessmentPayload | UpdateAssessmentPayload
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && assessment) {
        await updateAssessmentApi(assessment.id, data as UpdateAssessmentPayload);
      } else {
        await createAssessmentApi(data as CreateAssessmentPayload);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Assessment Event' : 'Create New Assessment Event'}
      icon={<Award className="h-5 w-5 text-brand-600" />}
      size="md"
    >
      <div className="space-y-4 p-1">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AssessmentForm
          mode={isEditMode ? 'edit' : 'create'}
          defaultValues={assessment ?? undefined}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </div>
    </Modal>
  );
};

export default AssessmentModal;
