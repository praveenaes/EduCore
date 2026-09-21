import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import CourseForm from './CourseForm';
import { createCourseApi, updateCourseApi } from '../../../services/courseService';
import type { Course, CreateCoursePayload, UpdateCoursePayload } from '../../../types/course';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course?: Course | null;
}

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  course,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(course);

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

  const handleSubmit = async (data: CreateCoursePayload | UpdateCoursePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && course) {
        await updateCourseApi(course.id, data);
      } else {
        await createCourseApi(data as CreateCoursePayload);
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
      title={isEditMode ? 'Edit Course' : 'Add New Course'}
      icon={<Layers className="h-5 w-5" />}
      size="xl"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}
      <CourseForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={course ?? undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        onClearError={() => setError(null)}
      />
    </Modal>
  );
};

export default CourseModal;
