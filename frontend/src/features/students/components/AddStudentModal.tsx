import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import StudentForm from './StudentForm';
import { createStudentApi } from '../../../services/studentService';
import type { CreateStudentPayload } from '../../../types/student';

interface AddStudentModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (
    data: CreateStudentPayload | Partial<CreateStudentPayload>,
    photo: File | null,
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
      await createStudentApi(formData);
      onCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Failed to add student. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add New Student"
      icon={<UserPlus className="h-5 w-5" />}
      size="xl"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-650 border border-red-200">
          {error}
        </div>
      )}
      <StudentForm mode="create" isLoading={isLoading} onSubmit={handleCreate} onCancel={onClose} />
    </Modal>
  );
};

export default AddStudentModal;
