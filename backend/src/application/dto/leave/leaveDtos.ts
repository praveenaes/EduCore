import { LeaveStatus, LeaveType, HalfDaySession } from '@/domain/entities/LeaveRequest';

export interface LeaveRescheduleRequestDTO {
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

export interface LeaveRequestDTO {
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
  reviewedAt?: string;
  remarks?: string;
  rescheduleRequest?: LeaveRescheduleRequestDTO;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplyLeaveDTO {
  userId: string;    
  startDate: string; 
  endDate: string;   
  type: LeaveType;
  reason: string;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
}

export interface StudentLeavesResponseDTO {
  leaves: LeaveRequestDTO[];
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface GetBatchLeavesDTO {
  userId: string;    
  batchId: string;
  status?: string;
}

export interface BatchLeavesResponseDTO {
  leaves: LeaveRequestDTO[];
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface ReviewLeaveDTO {
  userId: string;    // Logged-in teacher's user ID
  leaveId: string;
  status: 'approved' | 'rejected';
  remarks?: string;
}

export interface UpdateStudentLeaveDTO {
  userId: string;
  leaveId: string;
  startDate?: string;
  endDate?: string;
  type?: LeaveType;
  reason?: string;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
}

export interface RescheduleStudentLeaveDTO {
  userId: string;
  leaveId: string;
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDaySession?: HalfDaySession;
  reason: string;
}

export interface CancelStudentLeaveDTO {
  userId: string;
  leaveId: string;
}
