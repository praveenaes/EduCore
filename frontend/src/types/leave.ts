// ==========================================
// Status & Type Enums
// ==========================================

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveType = 'medical' | 'casual' | 'family' | 'other';

export type HalfDaySession = 'firstHalf' | 'secondHalf';

// ==========================================
// Reschedule Request Interface
// ==========================================

export interface LeaveRescheduleRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string; // ISO date string
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string; // ISO date string
  remarks?: string;
}

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
  rescheduleRequest?: LeaveRescheduleRequest;
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

export interface UpdateLeavePayload {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  type?: LeaveType;
  reason?: string;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
}

export interface RescheduleLeavePayload {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason: string;
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
