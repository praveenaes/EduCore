import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { IAttendanceRepository } from '@/domain/repositories/IAttendanceRepository';
import { Attendance } from '@/domain/entities/Attendance';
import { IReviewLeaveUseCase } from '../../ports/use-cases/leave/IReviewLeaveUseCase';
import { ReviewLeaveDTO, LeaveRequestDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class ReviewLeave implements IReviewLeaveUseCase {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository,
    @inject(TYPES.AttendanceRepository) private _attendanceRepo: IAttendanceRepository
  ) {}

  async execute(dto: ReviewLeaveDTO): Promise<LeaveRequestDTO> {
    if (!dto.userId) throw new BadRequestError('User ID is required.');
    if (!dto.leaveId) throw new BadRequestError('Leave ID is required.');
    if (!dto.status || !['approved', 'rejected'].includes(dto.status)) {
      throw new BadRequestError('A valid status of "approved" or "rejected" is required.');
    }

    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) throw new NotFoundError('Teacher profile not found.');

    const leave = await this._leaveRepo.findById(dto.leaveId);
    if (!leave || leave.isDeleted) {
      throw new NotFoundError('Leave request not found.');
    }

    const batch = await this._batchRepo.findById(leave.batchId);
    if (!batch || batch.isDeleted) throw new NotFoundError('Batch not found.');

    if (batch.teacherId && batch.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to review leave requests for this batch.');
    }

    if (leave.rescheduleRequest && leave.rescheduleRequest.status === 'pending') {
      leave.reviewReschedule(dto.status, dto.remarks, teacher.id);
    } else if (leave.status === 'pending') {
      leave.review(dto.status, dto.remarks, teacher.id);
    } else {
      throw new BadRequestError('Only pending leave requests or reschedule requests can be reviewed.');
    }

    const updated = await this._leaveRepo.update(leave.id!, leave);
    if (!updated) {
      throw new NotFoundError('Failed to update leave request.');
    }

    // Automatically sync attendance based on approval status
    if (dto.status === 'approved') {
      const dates: Date[] = [];
      const current = new Date(updated.startDate);
      const end = new Date(updated.endDate);
      current.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(0, 0, 0, 0);

      while (current <= end) {
        dates.push(new Date(current));
        current.setUTCDate(current.getUTCDate() + 1);
      }

      const attendanceRecords = dates.map((d) =>
        Attendance.createNew({
          studentId: updated.studentId,
          batchId: updated.batchId,
          date: d,
          firstHalf: updated.isHalfDay && updated.halfDaySession === 'secondHalf' ? 'present' : 'absent',
          secondHalf: updated.isHalfDay && updated.halfDaySession === 'firstHalf' ? 'present' : 'absent',
          remarks: `On Leave: ${updated.reason}`,
          markedBy: teacher.id!,
        })
      );

      await this._attendanceRepo.upsertMany(attendanceRecords);
    } else if (dto.status === 'rejected') {
      await this._attendanceRepo.deleteByStudentAndDateRange(
        updated.studentId,
        updated.batchId,
        new Date(updated.startDate),
        new Date(updated.endDate)
      );
    }

    return {
      id: updated.id!,
      studentId: updated.studentId,
      studentName: updated.studentName,
      admissionNumber: updated.admissionNumber,
      batchId: updated.batchId,
      startDate: updated.startDate instanceof Date ? updated.startDate.toISOString().slice(0, 10) : String(updated.startDate).slice(0, 10),
      endDate: updated.endDate instanceof Date ? updated.endDate.toISOString().slice(0, 10) : String(updated.endDate).slice(0, 10),
      type: updated.type,
      reason: updated.reason,
      status: updated.status,
      appliedAt: updated.appliedAt instanceof Date ? updated.appliedAt.toISOString() : String(updated.appliedAt),
      isHalfDay: updated.isHalfDay,
      halfDaySession: updated.halfDaySession,
      reviewedBy: updated.reviewedBy,
      reviewerName: updated.reviewerName || `${teacher.firstName} ${teacher.lastName}`.trim(),
      reviewedAt: updated.reviewedAt ? new Date(updated.reviewedAt).toISOString() : undefined,
      remarks: updated.remarks,
      rescheduleRequest: updated.rescheduleRequest ? {
        startDate: updated.rescheduleRequest.startDate instanceof Date ? updated.rescheduleRequest.startDate.toISOString().slice(0, 10) : String(updated.rescheduleRequest.startDate).slice(0, 10),
        endDate: updated.rescheduleRequest.endDate instanceof Date ? updated.rescheduleRequest.endDate.toISOString().slice(0, 10) : String(updated.rescheduleRequest.endDate).slice(0, 10),
        isHalfDay: updated.rescheduleRequest.isHalfDay,
        halfDaySession: updated.rescheduleRequest.halfDaySession,
        reason: updated.rescheduleRequest.reason,
        status: updated.rescheduleRequest.status,
        requestedAt: updated.rescheduleRequest.requestedAt instanceof Date ? updated.rescheduleRequest.requestedAt.toISOString() : String(updated.rescheduleRequest.requestedAt),
        reviewedBy: updated.rescheduleRequest.reviewedBy,
        reviewerName: updated.rescheduleRequest.reviewerName,
        reviewedAt: updated.rescheduleRequest.reviewedAt ? new Date(updated.rescheduleRequest.reviewedAt).toISOString() : undefined,
        remarks: updated.rescheduleRequest.remarks,
      } : undefined,
    };
  }
}
