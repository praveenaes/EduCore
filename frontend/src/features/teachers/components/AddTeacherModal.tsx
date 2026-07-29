import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import TeacherForm from './TeacherForm';
import { createTeacherApi } from '../../../services/teacherService';
import type { CreateTeacherPayload } from '../../../types/teacher';

interface AddTeacherModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ onClose, onCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (
    data: CreateTeacherPayload | Partial<CreateTeacherPayload> | any,
    photo: File | null
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, String(val));
        }
      });
      if (photo) {
        formData.append('photo', photo);
      }
      await createTeacherApi(formData);
      onCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Failed to add teacher. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add New Teacher"
      icon={<UserPlus className="h-5 w-5" />}
      size="xl"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-650 border border-red-200">
          {error}
        </div>
      )}
      <TeacherForm mode="create" isLoading={isLoading} onSubmit={handleCreate} onCancel={onClose} />
    </Modal>
  );
};

export default AddTeacherModal;
