import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { IGetBatchLeavesUseCase } from '../../ports/use-cases/leave/IGetBatchLeavesUseCase';
import { GetBatchLeavesDTO, BatchLeavesResponseDTO, LeaveRequestDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class GetBatchLeaves implements IGetBatchLeavesUseCase {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository
  ) {}

  async execute(dto: GetBatchLeavesDTO): Promise<BatchLeavesResponseDTO> {
    if (!dto.userId) throw new BadRequestError('User ID is required.');
    if (!dto.batchId) throw new BadRequestError('Batch ID is required.');

    const teacher = await this._teacherRepo.findByUserId(dto.userId);
    if (!teacher) throw new NotFoundError('Teacher profile not found.');

    const batch = await this._batchRepo.findById(dto.batchId);
    if (!batch || batch.isDeleted) throw new NotFoundError('Batch not found.');

    if (batch.teacherId && batch.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to view leave requests for this batch.');
    }

    const leaves = await this._leaveRepo.findByBatchId(dto.batchId, dto.status);

    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    const leaveDTOs: LeaveRequestDTO[] = leaves.map((l) => {
      if (l.status === 'pending') pendingCount++;
      else if (l.status === 'approved') approvedCount++;
      else if (l.status === 'rejected') rejectedCount++;

      return {
        id: l.id!,
        studentId: l.studentId,
        studentName: l.studentName,
        admissionNumber: l.admissionNumber,
        batchId: l.batchId,
        batchName: l.batchName,
        startDate: l.startDate instanceof Date ? l.startDate.toISOString().slice(0, 10) : String(l.startDate).slice(0, 10),
        endDate: l.endDate instanceof Date ? l.endDate.toISOString().slice(0, 10) : String(l.endDate).slice(0, 10),
        type: l.type,
        reason: l.reason,
        status: l.status,
        appliedAt: l.appliedAt instanceof Date ? l.appliedAt.toISOString() : String(l.appliedAt),
        isHalfDay: l.isHalfDay,
        halfDaySession: l.halfDaySession,
        reviewedBy: l.reviewedBy,
        reviewerName: l.reviewerName,
        reviewedAt: l.reviewedAt instanceof Date ? l.reviewedAt.toISOString() : l.reviewedAt ? String(l.reviewedAt) : undefined,
        remarks: l.remarks,
      };
    });

    return {
      leaves: leaveDTOs,
      total: leaves.length,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }
}
