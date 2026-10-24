import React, { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Clock, AlertCircle, Upload, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { requestHomeworkExtensionApi } from '../../../services/homeworkService';
import type { StudentHomeworkItem, HomeworkAttachment } from '../../../types/homework';

interface RequestExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  homework: StudentHomeworkItem | null;
}

const REASON_CATEGORIES = [
  'Medical / Illness',
  'Family Emergency',
  'Technical / Connectivity Issue',
  'Personal Emergency',
  'Other',
];

export const RequestExtensionModal: React.FC<RequestExtensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  homework,
}) => {
  const [reasonCategory, setReasonCategory] = useState(REASON_CATEGORIES[0]);
  const [explanation, setExplanation] = useState('');
  const [attachment, setAttachment] = useState<HomeworkAttachment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !homework) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      setAttachment({
        fileName: file.name,
        fileUrl: base64Data,
        fileType: file.type || file.name.split('.').pop(),
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      setError('Please provide a brief explanation for your extension request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await requestHomeworkExtensionApi(homework.homeworkId, {
        reason: reasonCategory,
        explanation: explanation.trim(),
        attachment: attachment || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit extension request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Extension — ${homework.title}`}
      icon={<Clock className="h-5 w-5 text-amber-600" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/80 text-xs text-amber-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5 text-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Deadline Passed Notice
          </p>
          <p className="text-neutral-700">
            The deadline for this assignment was{' '}
            <strong>
              {new Date(homework.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
            . If you were sick or had an emergency, please describe it below. Your teacher will review your request.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Reason Category <span className="text-red-500">*</span>
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
          >
            {REASON_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Explanation / Note <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g. I was diagnosed with viral fever and advised bed rest. Kindly grant me an extension to submit."
            value={explanation}
            onChange={(e) => {
              setExplanation(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Supporting Document (Optional)
          </label>
          <p className="text-[11px] text-neutral-400 mb-2">
            Upload medical certificate, prescription, or relevant documentation.
          </p>

          {attachment ? (
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="truncate font-medium text-neutral-800">{attachment.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-neutral-400 hover:text-red-600 transition cursor-pointer p-1"
                title="Remove attachment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 p-4 text-center cursor-pointer hover:border-brand-400 hover:bg-neutral-50/50 transition">
              <Upload className="h-5 w-5 text-neutral-400 mb-1" />
              <span className="text-xs font-semibold text-brand-600">Click to upload document</span>
              <span className="text-[10px] text-neutral-400">PDF, JPG, PNG up to 10MB</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
