// ==========================================
// Status & Type Enums
// ==========================================

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveType = 'medical' | 'casual' | 'family' | 'other';

export type HalfDaySession = 'firstHalf' | 'secondHalf';

// ==========================================
// Core Leave Request Interface
// ==========================================

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  batchId: string;
  batchName?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedAt: string; // ISO date string
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string; // ISO date string
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// Student Portal Types
// ==========================================

export interface ApplyLeavePayload {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: LeaveType;
  reason: string;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
}

export interface StudentLeaveListResponse {
  success: boolean;
  message?: string;
  data: {
    leaves: LeaveRequest[];
    total: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

// ==========================================
// Teacher Portal Types
// ==========================================

export interface ReviewLeavePayload {
  status: 'approved' | 'rejected';
  remarks?: string;
}

export interface BatchLeaveListResponse {
  success: boolean;
  message?: string;
  data: {
    leaves: LeaveRequest[];
    total: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}
