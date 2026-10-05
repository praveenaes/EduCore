export type AttendanceStatus = 'present' | 'absent';

export interface Attendance {
  studentId: string;
  admissionNumber: string;
  studentName: string;
  firstHalf: AttendanceStatus;
  secondHalf: AttendanceStatus;
  remarks?: string;
}

export interface BatchAttendanceResponse {
  success: boolean;
  data: {
    batchId: string;
    batchName: string;
    date: string; // YYYY-MM-DD
    records: Attendance[];
  };
}

export interface CreateAttendancePayload {
  batchId: string;
  date: string; // YYYY-MM-DD
  attendances: {
    studentId: string;
    firstHalf: AttendanceStatus;
    secondHalf: AttendanceStatus;
    remarks?: string;
  }[];
}

export type UpdateAttendancePayload = CreateAttendancePayload;

// ==============================
// Student Portal Attendance Types
// ==============================

export type DayAttendanceStatus = 'present' | 'absent' | 'partial' | 'none';

export interface StudentAttendanceRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  firstHalf: AttendanceStatus;
  secondHalf: AttendanceStatus;
  remarks?: string;
}

export interface StudentMonthlyAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  partialDays: number;
  percentage: number;
}

export interface StudentMonthlyAttendanceResponse {
  success: boolean;
  data: {
    month: number;
    year: number;
    records: StudentAttendanceRecord[];
    stats?: StudentMonthlyAttendanceStats;
  };
}
