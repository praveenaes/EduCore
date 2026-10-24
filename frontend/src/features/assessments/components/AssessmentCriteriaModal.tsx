import React, { useState } from 'react';
import { Sliders, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import AssessmentCriteriaForm from './AssessmentCriteriaForm';
import {
  createAssessmentCriteriaApi,
  updateAssessmentCriteriaApi,
} from '../../../services/assessmentCriteriaService';
import type {
  AssessmentCriteria,
  CreateAssessmentCriteriaPayload,
  UpdateAssessmentCriteriaPayload,
} from '../../../types/assessmentCriteria';

interface AssessmentCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  criteria?: AssessmentCriteria | null;
}

export const AssessmentCriteriaModal: React.FC<AssessmentCriteriaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  criteria,
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

  const isEditMode = Boolean(criteria);

  const handleSubmit = async (
    data: CreateAssessmentCriteriaPayload | UpdateAssessmentCriteriaPayload
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && criteria) {
        await updateAssessmentCriteriaApi(criteria.id, data as UpdateAssessmentCriteriaPayload);
      } else {
        await createAssessmentCriteriaApi(data as CreateAssessmentCriteriaPayload);
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        'An error occurred. Please try again.';
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
      title={isEditMode ? 'Edit Assessment Criteria' : 'Add New Criteria'}
      size="lg"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-800">
              {isEditMode ? 'Update Criteria Details' : 'Configure Grading Criteria'}
            </h3>
            <p className="text-xs text-neutral-500">
              Define subject, evaluation type, maximum marks, and pass marks rules.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AssessmentCriteriaForm
          mode={isEditMode ? 'edit' : 'create'}
          defaultValues={criteria || undefined}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </div>
    </Modal>
  );
};

export default AssessmentCriteriaModal;
