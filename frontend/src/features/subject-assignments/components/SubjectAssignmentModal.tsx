import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import SubjectAssignmentForm from './SubjectAssignmentForm';
import {
  createSubjectAssignmentApi,
  updateSubjectAssignmentApi,
} from '../../../services/subjectAssignmentService';
import type {
  SubjectAssignment,
  CreateSubjectAssignmentPayload,
  UpdateSubjectAssignmentPayload,
} from '../../../types/subjectAssignment';

interface SubjectAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment?: SubjectAssignment | null;
}

const SubjectAssignmentModal: React.FC<SubjectAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assignment,
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

  const isEditMode = Boolean(assignment);

  const handleSubmit = async (
    data: CreateSubjectAssignmentPayload | UpdateSubjectAssignmentPayload
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && assignment) {
        await updateSubjectAssignmentApi(assignment.id, data);
      } else {
        await createSubjectAssignmentApi(data as CreateSubjectAssignmentPayload);
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
      title={isEditMode ? 'Edit Subject Assignment' : 'Assign Subject to Course Level'}
      icon={<BookOpen className="h-5 w-5" />}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <SubjectAssignmentForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={assignment ?? undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default SubjectAssignmentModal;
