import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { LeaveRequest } from '@/domain/entities/LeaveRequest';
import { IApplyLeaveUseCase } from '../../ports/use-cases/leave/IApplyLeaveUseCase';
import { ApplyLeaveDTO, LeaveRequestDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class ApplyLeave implements IApplyLeaveUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository
  ) {}

  async execute(dto: ApplyLeaveDTO): Promise<LeaveRequestDTO> {
    if (!dto.userId) throw new BadRequestError('User ID is required.');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const student = await this._studentRepo.findByUserId(dto.userId);
    if (!student) {
      throw new NotFoundError('Student profile not found.');
    }
    if (!student.batchId) {
      throw new BadRequestError('Student is not assigned to any batch.');
    }

    const entity = LeaveRequest.createNew({
      studentId: student.id!,
      batchId: student.batchId,
      startDate: start,
      endDate: end,
      type: dto.type,
      reason: dto.reason,
    });

    const saved = await this._leaveRepo.create(entity);

    return {
      id: saved.id!,
      studentId: saved.studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      admissionNumber: student.admissionNumber,
      batchId: saved.batchId,
      startDate: saved.startDate.toISOString().slice(0, 10),
      endDate: saved.endDate.toISOString().slice(0, 10),
      type: saved.type,
      reason: saved.reason,
      status: saved.status,
      appliedAt: saved.appliedAt.toISOString(),
      remarks: saved.remarks,
    };
  }
}
