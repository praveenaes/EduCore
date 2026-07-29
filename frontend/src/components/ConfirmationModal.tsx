import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  confirmVariant?: 'danger' | 'primary';
}

/**
 * Reusable Confirmation Modal component.
 * Replaces browser's native window.confirm() dialogs.
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
  confirmVariant = 'danger',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-neutral-500 whitespace-pre-line">{message}</p>
    </Modal>
  );
};
