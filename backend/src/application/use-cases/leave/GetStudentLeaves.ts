import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { IGetStudentLeavesUseCase } from '../../ports/use-cases/leave/IGetStudentLeavesUseCase';
import { StudentLeavesResponseDTO, LeaveRequestDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, BadRequestError } from '@/shared/errors/AppError';

@injectable()
export class GetStudentLeaves implements IGetStudentLeavesUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository
  ) {}

  async execute(userId: string): Promise<StudentLeavesResponseDTO> {
    if (!userId) throw new BadRequestError('User ID is required.');

    const student = await this._studentRepo.findByUserId(userId);
    if (!student) throw new NotFoundError('Student profile not found.');

    const leaves = await this._leaveRepo.findByStudentId(student.id!);

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
        studentName: l.studentName || `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: l.admissionNumber || student.admissionNumber,
        batchId: l.batchId,
        batchName: l.batchName,
        startDate: l.startDate instanceof Date ? l.startDate.toISOString().slice(0, 10) : String(l.startDate).slice(0, 10),
        endDate: l.endDate instanceof Date ? l.endDate.toISOString().slice(0, 10) : String(l.endDate).slice(0, 10),
        type: l.type,
        reason: l.reason,
        status: l.status,
        appliedAt: l.appliedAt instanceof Date ? l.appliedAt.toISOString() : String(l.appliedAt),
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
