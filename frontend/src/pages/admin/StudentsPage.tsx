import React, { useCallback, useEffect, useState } from 'react';
import { Download, UserPlus } from 'lucide-react';
import { Button } from '../../components/Button';
import { SearchBox } from '../../components/SearchBox';
import { Table, type TableColumn } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import {
  getStudentsApi,
  exportStudentsCsvApi,
  toggleStudentStatusApi,
} from '../../services/studentService';
import type { Student } from '../../types/student';
import AddStudentModal from '../../features/students/components/AddStudentModal';
import StudentDetailsModal from '../../features/students/components/StudentDetailsModal';
import { getPhotoUrl } from '../../utils/photo';

const LIMIT = 4;

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState<{
    show: boolean;
    student: Student | null;
  }>({ show: false, student: null });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getStudentsApi({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
      });
      setStudents(res.data.data.students);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load students.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  //runs when page loads
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleToggleStatus = async (student: Student) => {
    setTogglingId(student.id);
    try {
      await toggleStudentStatusApi(student.id, !student.isActive);
      setToast({
        message: student.isActive
          ? `${student.firstName} ${student.lastName} deactivated.`
          : `${student.firstName} ${student.lastName} activated.`,
        type: 'success',
      });
      await fetchStudents();
    } catch {
      setToast({ message: 'Failed to update student status.', type: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await exportStudentsCsvApi(debouncedSearch || undefined);
      const blob = new Blob([res.data as BlobPart], { type: 'text/csv' });//downloadable file
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
      anchor.click();//downloads
      URL.revokeObjectURL(url);//releases memory
    } catch {
      setToast({ message: 'Failed to export CSV.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  //creates array of 5 column objects and passes to table component
  const columns: TableColumn<Student>[] = [
    {
      header: 'Student',
      accessor: (s) => (
        <button
          onClick={() => setSelectedStudent(s)}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            {s.photo ? (
              <img
                src={getPhotoUrl(s.photo)}
                alt={s.firstName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-neutral-400 uppercase">
                {s.firstName?.[0]}
                {s.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-neutral-800 hover:text-brand-600 transition-colors">
              {s.firstName} {s.lastName}
            </p>
            <p className="text-xs text-neutral-400">{s.email}</p>
          </div>
        </button>
      ),
    },
    {
      header: 'Admission No.',
      accessor: (s) => (
        <span className="font-mono text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
          {s.admissionNumber}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: (s) => <span className="text-neutral-600">{s.phone}</span>,
    },
    {
      header: 'Status',
      accessor: (s) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {s.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (s) => (
        <button
          onClick={() => setShowStatusConfirm({ show: true, student: s })}
          disabled={togglingId === s.id}
          className={`text-xs font-semibold hover:underline ${
            togglingId === s.id ? 'text-neutral-400' : s.isActive ? 'text-red-600' : 'text-emerald-600'
          }`}
        >
          {togglingId === s.id ? '…' : s.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Students</h1>
            <p className="mt-0.5 text-sm text-neutral-400">
              {total > 0 ? `${total} students registered` : 'Manage all student records'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExportCsv}
              isLoading={isExporting}
              disabled={isExporting || students.length === 0}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Student
            </Button>
          </div>
        </div>

        <SearchBox
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search by name, admission number, or email…"
        />

        {error ? (
          <ErrorState message={error} onRetry={fetchStudents} />
        ) : students.length === 0 && !isLoading ? (
          <EmptyState
            title="No Students Registered Yet"
            description={
              debouncedSearch
                ? `No results found matching "${debouncedSearch}". Try a different search term.`
                : 'Start by adding your first student to manage their details, track attendance, and record grades.'
            }
            action={
              !debouncedSearch && (
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  Register Your First Student
                </Button>
              )
            }
          />
        ) : (
          <Table
            columns={columns}
            data={students}
            isLoading={isLoading}
            keyExtractor={(s) => s.id}
          />
        )}
      </div>

      {students.length > 0 && !isLoading && totalPages > 1 && (
        <div className="mt-auto pt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            fetchStudents();
            setShowAddModal(false);
          }}
        />
      )}

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdated={() => {
            fetchStudents();
            setSelectedStudent(null);
          }}
          onDeleted={() => {
            fetchStudents();
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Status Toggle Confirmation Modal */}
      {showStatusConfirm.show && showStatusConfirm.student && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-neutral-100">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-800">
                Confirm {showStatusConfirm.student.isActive ? 'Deactivation' : 'Activation'}
              </h3>
              <button
                onClick={() => setShowStatusConfirm({ show: false, student: null })}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to {showStatusConfirm.student.isActive ? 'deactivate' : 'activate'}{' '}
              <span className="font-semibold text-neutral-800">
                {showStatusConfirm.student.firstName} {showStatusConfirm.student.lastName}
              </span>
              ? {showStatusConfirm.student.isActive
                  ? 'This will prevent them from logging into the student portal.'
                  : 'This will restore their access to the student portal.'}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusConfirm({ show: false, student: null })}
              >
                Cancel
              </Button>
              <Button
                variant={showStatusConfirm.student.isActive ? 'danger' : 'primary'}
                size="sm"
                onClick={() => {
                  const s = showStatusConfirm.student;
                  setShowStatusConfirm({ show: false, student: null });
                  if (s) handleToggleStatus(s);
                }}
              >
                {showStatusConfirm.student.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
