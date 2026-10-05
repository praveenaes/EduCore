import { LeaveRequest } from '../entities/LeaveRequest';
import { IBaseRepository } from './IBaseRepository';

export interface ILeaveRequestRepository extends IBaseRepository<LeaveRequest> {
  findByStudentId(studentId: string): Promise<LeaveRequest[]>;
  findByBatchId(batchId: string, status?: string): Promise<LeaveRequest[]>;
}
