import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import SubjectForm from './SubjectForm';
import { createSubjectApi, updateSubjectApi } from '../../../services/subjectService';
import type { Subject, CreateSubjectPayload, UpdateSubjectPayload } from '../../../types/subject';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subject?: Subject | null;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subject,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(subject);

  const handleSubmit = async (data: CreateSubjectPayload | UpdateSubjectPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && subject) {
        await updateSubjectApi(subject.id, data);
      } else {
        await createSubjectApi(data as CreateSubjectPayload);
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
      title={isEditMode ? 'Edit Subject' : 'Add New Subject'}
      icon={<BookOpen className="h-5 w-5" />}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <SubjectForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={subject ?? undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default SubjectModal;
