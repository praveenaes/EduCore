import React, { useState } from 'react';
import { User, Pencil, Trash2, X } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import TeacherForm from './TeacherForm';
import { updateTeacherApi, deleteTeacherApi } from '../../../services/teacherService';
import type { Teacher, CreateTeacherPayload } from '../../../types/teacher';
import { getPhotoUrl } from '../../../utils/photo';

interface TeacherDetailsModalProps {
  teacher: Teacher;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

type Tab = 'view' | 'edit';

const DetailRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
      {label}
    </span>
    <span className="text-sm text-neutral-700">{value || '—'}</span>
  </div>
);

const TeacherDetailsModal: React.FC<TeacherDetailsModalProps> = ({
  teacher,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('view');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoUrl = getPhotoUrl(teacher.photo);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (n?: number) => {
    if (n === undefined || n === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const handleUpdate = async (
    data: CreateTeacherPayload | Partial<CreateTeacherPayload> | any,
    photo: File | null
  ) => {
    setIsUpdating(true);
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
      await updateTeacherApi(teacher.id, formData);
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Failed to update teacher.');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTeacherApi(teacher.id);
      onDeleted();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Failed to delete teacher.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={teacher.firstName + ' ' + teacher.lastName} size="xl">
      {/* Tabs */}
      <div className="mb-5 flex gap-2 border-b border-neutral-100 pb-0">
        {(['view', 'edit'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setError(null);
            }}
            className={`px-4 pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === tab
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {tab === 'view' ? 'View' : 'Edit'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-650 border border-red-200">
          {error}
        </div>
      )}

      {/* View Tab */}
      {activeTab === 'view' && (
        <div className="space-y-5">
          {/* Photo + Header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200 flex-shrink-0 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={teacher.firstName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-7 w-7 text-neutral-300" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-800">
                {teacher.firstName} {teacher.lastName}
              </p>
              <p className="text-sm text-neutral-450">{teacher.employeeId}</p>
            </div>
          </div>

          {/* Personal */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Personal
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <DetailRow label="Gender" value={teacher.gender} />
              <DetailRow label="Date of Birth" value={formatDate(teacher.dateOfBirth)} />
              <DetailRow label="Blood Group" value={teacher.bloodGroup} />
              <DetailRow label="National ID" value={teacher.nationalId} />
            </div>
          </section>

          {/* Job Information */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Job Information
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <DetailRow label="Joining Date" value={formatDate(teacher.joiningDate)} />
              <DetailRow label="Qualifications" value={teacher.qualifications} />
              <DetailRow label="Specializations" value={teacher.specializations} />
              <DetailRow label="Experience" value={`${teacher.experience} years`} />
              <DetailRow label="Salary" value={formatCurrency(teacher.salary)} />
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Contact
            </h3>
            <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <DetailRow label="Email" value={teacher.email} />
              <DetailRow label="Phone" value={teacher.phone} />
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Address
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <DetailRow label="House" value={teacher.house} />
              <DetailRow label="Area" value={teacher.area} />
              <DetailRow label="City" value={teacher.city} />
              <DetailRow label="State" value={teacher.state} />
              <DetailRow label="Postal Code" value={teacher.postalCode} />
              <DetailRow label="Country" value={teacher.country} />
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-neutral-100">
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Teacher
            </Button>
            <Button
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setActiveTab('edit')}
            >
              Edit Teacher
            </Button>
          </div>
        </div>
      )}

      {/* Edit Tab */}
      {activeTab === 'edit' && (
        <TeacherForm
          mode="edit"
          defaultValues={teacher}
          isLoading={isUpdating}
          onSubmit={handleUpdate}
          onCancel={onClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-800">Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-neutral-800">
                {teacher.firstName} {teacher.lastName}
              </span>
              ? This will disable their login access. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TeacherDetailsModal;
export { TeacherDetailsModal };
