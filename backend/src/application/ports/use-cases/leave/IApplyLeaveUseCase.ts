import { ApplyLeaveDTO, LeaveRequestDTO } from '@/application/dto/leave/leaveDtos';

export interface IApplyLeaveUseCase {
  execute(dto: ApplyLeaveDTO): Promise<LeaveRequestDTO>;
}
