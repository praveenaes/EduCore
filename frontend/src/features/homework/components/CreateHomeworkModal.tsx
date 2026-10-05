import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { BookOpen, Upload, Trash2, FileText, AlertCircle } from 'lucide-react';
import { createHomeworkApi, updateHomeworkApi } from '../../../services/homeworkService';
import { getTeacherBatchesApi, getTeacherSubjectsApi } from '../../../services/teacherService';
import { createHomeworkFormSchema, updateHomeworkFormSchema } from '../../../validators/homeworkValidator';
import type { TeacherInChargeBatch, TeacherAssignedSubject } from '../../../types/teacher';
import type { Homework, HomeworkAttachment } from '../../../types/homework';

interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  homework?: Homework | null;
}

export const CreateHomeworkModal: React.FC<CreateHomeworkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  homework,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [batchId, setBatchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<HomeworkAttachment[]>([]);
  const [batches, setBatches] = useState<TeacherInChargeBatch[]>([]);
  const [subjects, setSubjects] = useState<TeacherAssignedSubject[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    batchId?: string;
    subjectId?: string;
    dueDate?: string;
  }>({});

  // Minimum due date & time is tomorrow start of day (local time)
  const getTomorrowStartDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T00:00`;
  };

  const minDueDateTime = getTomorrowStartDateTime();

  // Initialize or pre-fill form data
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
      if (homework) {
        setTitle(homework.title);
        setDescription(homework.description || '');
        setBatchId(homework.batchId);
        setSubjectId(homework.subjectId);
        const d = new Date(homework.dueDate);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setDueDate(d.toISOString().slice(0, 16));
        setAttachments(homework.attachments || []);
      } else {
        setTitle('');
        setDescription('');
        setBatchId('');
        setSubjectId('');
        setDueDate('');
        setAttachments([]);
      }
    }
  }, [isOpen, homework]);

  // Fetch teacher's batches and subjects on modal open
  useEffect(() => {
    if (isOpen) {
      setIsLoadingBatches(true);
      setIsLoadingSubjects(true);
      setError(null);

      getTeacherBatchesApi({ limit: 100 })
        .then((res) => {
          setBatches(res.data.data.batches || []);
        })
        .catch(() => {
          setError('Failed to load your assigned batches.');
        })
        .finally(() => {
          setIsLoadingBatches(false);
        });

      getTeacherSubjectsApi({ limit: 100 })
        .then((res) => {
          setSubjects(res.data.data.subjects || []);
        })
        .catch(() => {})
        .finally(() => {
          setIsLoadingSubjects(false);
        });
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            fileUrl: base64Data,
            fileType: file.type || file.name.split('.').pop(),
            fileSize: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const schema = homework ? updateHomeworkFormSchema : createHomeworkFormSchema;
    const parsed = schema.safeParse({
      title,
      description,
      batchId,
      subjectId,
      dueDate,
    });

    if (!parsed.success) {
      const newFieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !newFieldErrors[field]) {
          newFieldErrors[field] = issue.message;
        }
      });
      setFieldErrors(newFieldErrors);
      setError(parsed.error.issues[0]?.message || 'Please check the form inputs.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (homework) {
        await updateHomeworkApi(homework.id, {
          title: title.trim(),
          description: description.trim(),
          dueDate: new Date(dueDate).toISOString(),
          attachments,
        });
      } else {
        await createHomeworkApi({
          title: title.trim(),
          description: description.trim(),
          batchId,
          subjectId,
          dueDate: new Date(dueDate).toISOString(),
          attachments,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || (homework ? 'Failed to update homework assignment.' : 'Failed to create homework assignment.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={homework ? 'Edit Homework Assignment' : 'Create Homework Assignment'}
      icon={<BookOpen className="h-5 w-5" />}
      size="lg"
      footer={<></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Chapter 4 Practice Problems"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFieldErrors((prev) => ({ ...prev, title: undefined }));
            }}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none transition ${
              fieldErrors.title
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                : 'border-neutral-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
              Batch <span className="text-red-500">*</span>
            </label>
            <select
              value={batchId}
              onChange={(e) => {
                setBatchId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, batchId: undefined }));
              }}
              disabled={isLoadingBatches}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition bg-white ${
                fieldErrors.batchId
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : 'border-neutral-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
              }`}
            >
              <option value="">Select a batch...</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.courseName || 'Batch'})
                </option>
              ))}
            </select>
            {fieldErrors.batchId && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.batchId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, subjectId: undefined }));
              }}
              disabled={isLoadingSubjects}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition bg-white ${
                fieldErrors.subjectId
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : 'border-neutral-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
              }`}
            >
              <option value="">Select a subject...</option>
              {subjects.map((s) => (
                <option key={s.id || s.subjectId} value={s.subjectId}>
                  {s.subjectName} ({s.courseName || s.subjectCode})
                </option>
              ))}
            </select>
            {fieldErrors.subjectId && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.subjectId}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Due Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            min={minDueDateTime}
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              setFieldErrors((prev) => ({ ...prev, dueDate: undefined }));
            }}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition ${
              fieldErrors.dueDate
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                : 'border-neutral-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            }`}
          />
          {fieldErrors.dueDate && (
            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.dueDate}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Instructions / Description
          </label>
          <textarea
            rows={4}
            placeholder="Provide homework instructions, problem numbers, or special notes for students..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Attachments (Optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-neutral-300 hover:border-brand-500 px-4 py-3 text-sm text-neutral-600 hover:text-brand-600 transition bg-neutral-50 hover:bg-brand-50/30">
              <Upload className="h-4 w-4" />
              <span>Attach files (PDF, images, docs)</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <span className="text-xs text-neutral-400">
              {attachments.length} file(s) attached
            </span>
          </div>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-neutral-100/80 px-3 py-1.5 text-xs text-neutral-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                    <span className="truncate">{file.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="text-neutral-400 hover:text-red-500 transition p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {homework ? 'Save Changes' : 'Assign Homework'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateHomeworkModal;
