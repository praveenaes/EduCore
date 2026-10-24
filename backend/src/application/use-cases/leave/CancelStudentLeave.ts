import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ILeaveRequestRepository } from '@/domain/repositories/ILeaveRequestRepository';
import { IAttendanceRepository } from '@/domain/repositories/IAttendanceRepository';
import { ICancelStudentLeaveUseCase } from '../../ports/use-cases/leave/ICancelStudentLeaveUseCase';
import { CancelStudentLeaveDTO } from '../../dto/leave/leaveDtos';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/shared/errors/AppError';

@injectable()
export class CancelStudentLeave implements ICancelStudentLeaveUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.LeaveRequestRepository) private _leaveRepo: ILeaveRequestRepository,
    @inject(TYPES.AttendanceRepository) private _attendanceRepo: IAttendanceRepository
  ) {}

  async execute(dto: CancelStudentLeaveDTO): Promise<void> {
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
      throw new ForbiddenError('You are not authorized to cancel this leave request.');
    }

    if (leave.status !== 'pending' && leave.status !== 'approved') {
      throw new BadRequestError('Only pending or approved leave requests can be cancelled.');
    }

    if (leave.status === 'approved') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const leaveStartDate = new Date(leave.startDate);
      leaveStartDate.setHours(0, 0, 0, 0);
      if (leaveStartDate < today) {
        throw new BadRequestError('Cannot cancel an approved leave whose date has already passed.');
      }

      await this._attendanceRepo.deleteByStudentAndDateRange(
        leave.studentId,
        leave.batchId,
        new Date(leave.startDate),
        new Date(leave.endDate)
      );
    }

    leave.cancel();
    const updated = await this._leaveRepo.update(leave.id!, leave);
    if (!updated) {
      throw new NotFoundError('Failed to cancel leave request.');
    }
  }
}
