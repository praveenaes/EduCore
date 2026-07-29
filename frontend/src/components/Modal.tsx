import React, { useEffect } from 'react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  icon,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-300" onClick={onClose} />
      <div className={`relative z-10 w-full transform rounded-2xl bg-white shadow-xl border border-neutral-200/50 transition-all duration-300 flex flex-col max-h-[90vh] ${
        size === 'xl' ? 'max-w-3xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-200/60 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-800">
            {icon && <span className="text-brand-600">{icon}</span>}
            {title}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors duration-200">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 text-sm text-neutral-600 leading-relaxed">
          {children}
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral-200/60 px-6 py-4 bg-neutral-50/50 rounded-b-2xl">
          {footer ?? (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
