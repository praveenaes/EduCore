import { RescheduleStudentLeaveDTO, LeaveRequestDTO } from '@/application/dto/leave/leaveDtos';

export interface IRescheduleStudentLeaveUseCase {
  execute(dto: RescheduleStudentLeaveDTO): Promise<LeaveRequestDTO>;
}
