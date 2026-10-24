import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { IUpdateStudentLeaveUseCase } from '../../ports/use-cases/leave/IUpdateStudentLeaveUseCase';
import { UpdateStudentLeaveDTO, LeaveRequestDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/shared/errors/AppError';

@injectable()
export class UpdateStudentLeave implements IUpdateStudentLeaveUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository
  ) {}

  async execute(dto: UpdateStudentLeaveDTO): Promise<LeaveRequestDTO> {
    if (!dto.userId) throw new BadRequestError('User ID is required.');
    if (!dto.leaveId) throw new BadRequestError('Leave ID is required.');

    const student = await this._studentRepo.findByUserId(dto.userId);
    if (!student) {
      throw new NotFoundError('Student profile not found.');
    }

    const leave = await this._leaveRepo.findById(dto.leaveId);
    if (!leave || leave.isDeleted) {
      throw new NotFoundError('Leave request not found.');
    }

    if (leave.studentId !== student.id) {
      throw new ForbiddenError('You are not authorized to update this leave request.');
    }

    if (leave.status !== 'pending') {
      throw new BadRequestError('Only pending leave requests can be updated.');
    }

    const start = dto.startDate ? new Date(dto.startDate) : undefined;
    const end = dto.endDate ? new Date(dto.endDate) : undefined;

    leave.updateDetails({
      startDate: start,
      endDate: end,
      type: dto.type,
      reason: dto.reason,
      isHalfDay: dto.isHalfDay,
      halfDaySession: dto.halfDaySession,
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
    };
  }
}
