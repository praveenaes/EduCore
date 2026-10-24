import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { IAttendanceRepository } from '@/domain/repositories/IAttendanceRepository';
import { IRescheduleStudentLeaveUseCase } from '../../ports/use-cases/leave/IRescheduleStudentLeaveUseCase';
import { RescheduleStudentLeaveDTO, LeaveRequestDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/shared/errors/AppError';

@injectable()
export class RescheduleStudentLeave implements IRescheduleStudentLeaveUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository,
    @inject(TYPES.AttendanceRepository) private _attendanceRepo: IAttendanceRepository
  ) {}

  async execute(dto: RescheduleStudentLeaveDTO): Promise<LeaveRequestDTO> {
    if (!dto.userId) throw new BadRequestError('User ID is required.');
    if (!dto.leaveId) throw new BadRequestError('Leave ID is required.');
    if (!dto.startDate || !dto.endDate) throw new BadRequestError('Start date and end date are required.');
    if (!dto.reason?.trim()) throw new BadRequestError('Reason for rescheduling is required.');

    const student = await this._studentRepo.findByUserId(dto.userId);
    if (!student) {
      throw new NotFoundError('Student profile not found.');
    }

    const leave = await this._leaveRepo.findById(dto.leaveId);
    if (!leave || leave.isDeleted) {
      throw new NotFoundError('Leave request not found.');
    }

    if (leave.studentId !== student.id) {
      throw new ForbiddenError('You are not authorized to reschedule this leave request.');
    }

    if (leave.status !== 'approved') {
      throw new BadRequestError('Only approved leave requests can be rescheduled.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leaveStartDate = new Date(leave.startDate);
    leaveStartDate.setHours(0, 0, 0, 0);
    if (leaveStartDate < today) {
      throw new BadRequestError('Cannot reschedule a leave whose date has already passed.');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    await this._attendanceRepo.deleteByStudentAndDateRange(
      leave.studentId,
      leave.batchId,
      new Date(leave.startDate),
      new Date(leave.endDate)
    );

    leave.reschedule({
      startDate: start,
      endDate: end,
      isHalfDay: dto.isHalfDay,
      halfDaySession: dto.halfDaySession,
      reason: dto.reason,
    });

    const updated = await this._leaveRepo.update(leave.id!, leave);
    if (!updated) {
      throw new NotFoundError('Failed to update leave request.');
    }

    return {
      id: updated.id!,
      studentId: updated.studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      admissionNumber: student.admissionNumber,
      batchId: updated.batchId,
      startDate: updated.startDate instanceof Date ? updated.startDate.toISOString().slice(0, 10) : String(updated.startDate).slice(0, 10),
      endDate: updated.endDate instanceof Date ? updated.endDate.toISOString().slice(0, 10) : String(updated.endDate).slice(0, 10),
      type: updated.type,
      reason: updated.reason,
      status: updated.status,
      appliedAt: updated.appliedAt instanceof Date ? updated.appliedAt.toISOString() : String(updated.appliedAt),
      isHalfDay: updated.isHalfDay,
      halfDaySession: updated.halfDaySession,
      remarks: updated.remarks,
      rescheduleRequest: updated.rescheduleRequest ? {
        startDate: updated.rescheduleRequest.startDate instanceof Date ? updated.rescheduleRequest.startDate.toISOString().slice(0, 10) : String(updated.rescheduleRequest.startDate).slice(0, 10),
        endDate: updated.rescheduleRequest.endDate instanceof Date ? updated.rescheduleRequest.endDate.toISOString().slice(0, 10) : String(updated.rescheduleRequest.endDate).slice(0, 10),
        isHalfDay: updated.rescheduleRequest.isHalfDay,
        halfDaySession: updated.rescheduleRequest.halfDaySession,
        reason: updated.rescheduleRequest.reason,
        status: updated.rescheduleRequest.status,
        requestedAt: updated.rescheduleRequest.requestedAt instanceof Date ? updated.rescheduleRequest.requestedAt.toISOString() : String(updated.rescheduleRequest.requestedAt),
        remarks: updated.rescheduleRequest.remarks,
      } : undefined,
    };
  }
}
