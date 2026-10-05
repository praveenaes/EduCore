import { ReviewLeaveDTO, LeaveRequestDTO } from '@/application/dto/leave/leaveDtos';

export interface IReviewLeaveUseCase {
  execute(dto: ReviewLeaveDTO): Promise<LeaveRequestDTO>;
}
