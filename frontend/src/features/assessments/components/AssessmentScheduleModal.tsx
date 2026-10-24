import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import AssessmentScheduleForm from './AssessmentScheduleForm';
import {
  createAssessmentScheduleApi,
  updateAssessmentScheduleApi,
} from '../../../services/assessmentScheduleService';
import type {
  AssessmentSchedule,
  CreateAssessmentSchedulePayload,
  UpdateAssessmentSchedulePayload,
} from '../../../types/assessmentSchedule';

interface AssessmentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule?: AssessmentSchedule | null;
}

export const AssessmentScheduleModal: React.FC<AssessmentScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  schedule,
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

  const isEditMode = Boolean(schedule);

  const handleSubmit = async (
    data: CreateAssessmentSchedulePayload | UpdateAssessmentSchedulePayload
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && schedule) {
        await updateAssessmentScheduleApi(schedule.id, data as UpdateAssessmentSchedulePayload);
      } else {
        await createAssessmentScheduleApi(data as CreateAssessmentSchedulePayload);
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        'Failed to save assessment schedule. Please try again.';
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
      title={isEditMode ? 'Edit Assessment Schedule' : 'Schedule New Assessment'}
      size="lg"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-800">
              {isEditMode ? 'Update Timetable Details' : 'Configure Exam Timetable'}
            </h3>
            <p className="text-xs text-neutral-500">
              Set the examination date, timing, assigned batch, and examination center.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AssessmentScheduleForm
          mode={isEditMode ? 'edit' : 'create'}
          defaultValues={schedule || undefined}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </div>
    </Modal>
  );
};

export default AssessmentScheduleModal;
