import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { IReviewLeaveUseCase } from '../../ports/use-cases/leave/IReviewLeaveUseCase';
import { ReviewLeaveDTO, LeaveRequestDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class ReviewLeave implements IReviewLeaveUseCase {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository
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

    leave.review(dto.status, dto.remarks, dto.userId);
    const updated = await this._leaveRepo.update(leave.id!, leave);
    if (!updated) {
      throw new NotFoundError('Failed to update leave request.');
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
    };
  }
}
