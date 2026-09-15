import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import ProgramForm from './ProgramForm';
import { createProgramApi, updateProgramApi } from '../../../services/programService';
import type { Program, CreateProgramPayload, UpdateProgramPayload } from '../../../types/program';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  program?: Program | null; // If passed, it opens in edit mode
}

const ProgramModal: React.FC<ProgramModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  program,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(program);

  const handleSubmit = async (data: CreateProgramPayload | UpdateProgramPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && program) {
        await updateProgramApi(program.id, data);
      } else {
        await createProgramApi(data as CreateProgramPayload);
      }
      onSuccess();
      onClose();
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
      onClose={onClose}
      title={isEditMode ? 'Edit Program' : 'Add New Program'}
      icon={<BookOpen className="h-5 w-5" />}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}
      <ProgramForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={program ?? undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default ProgramModal;