import { AttendanceStatus } from '../../../domain/entities/Attendance';

export interface AttendanceRecordDTO {
  id?: string;
  studentId: string;
  admissionNumber: string;
  studentName: string;
  firstHalf: AttendanceStatus;
  secondHalf: AttendanceStatus;
  remarks?: string;
}

export interface BatchAttendanceResponseDTO {
  batchId: string;
  batchName: string;
  date: string; // YYYY-MM-DD
  records: AttendanceRecordDTO[];
}

export interface GetBatchAttendanceDTO {
  batchId: string;
  date: string; // YYYY-MM-DD
  userId: string;
}

export interface StudentAttendanceItemDTO {
  studentId: string;
  firstHalf: AttendanceStatus;
  secondHalf: AttendanceStatus;
  remarks?: string;
}

export interface CreateBatchAttendanceDTO {
  batchId: string;
  date: string; // YYYY-MM-DD
  attendances: StudentAttendanceItemDTO[];
  userId: string;
}

export interface UpdateBatchAttendanceDTO {
  batchId: string;
  date: string; // YYYY-MM-DD
  attendances: StudentAttendanceItemDTO[];
  userId: string;
}

// ==============================
// Student Attendance DTOs
// ==============================

export interface GetStudentAttendanceDTO {
  userId: string;
  month: number; 
  year: number;
}

export interface StudentDayAttendanceDTO {
  id?: string;
  date: string; 
  firstHalf: AttendanceStatus;
  secondHalf: AttendanceStatus;
  remarks?: string;
}

export interface StudentMonthlyAttendanceStatsDTO {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  partialDays: number;
  percentage: number;
}

export interface StudentMonthlyAttendanceResponseDTO {
  month: number;
  year: number;
  records: StudentDayAttendanceDTO[];
  stats: StudentMonthlyAttendanceStatsDTO;
}
