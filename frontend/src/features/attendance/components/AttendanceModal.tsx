import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { AttendanceForm } from './AttendanceForm';
import type { TeacherInChargeBatch } from '../../../types/teacher';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batch: TeacherInChargeBatch | null;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  batch,
}) => {
  if (!isOpen || !batch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Attendance — ${batch.name}`}
      icon={<ClipboardCheck className="h-5 w-5" />}
      size="xl"
    >
      <div className="mb-2 text-xs text-neutral-400 font-medium">
        Course: <span className="text-neutral-700 font-semibold">{batch.courseName}</span> • Center: <span className="text-neutral-700 font-semibold">{batch.centerName}</span>
      </div>

      <AttendanceForm
        batchId={batch.id}
        batchName={batch.name}
        onCancel={onClose}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
};

export default AttendanceModal;
