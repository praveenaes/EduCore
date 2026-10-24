import { UpdateStudentLeaveDTO, LeaveRequestDTO } from '@/application/dto/leave/leaveDtos';

export interface IUpdateStudentLeaveUseCase {
  execute(dto: UpdateStudentLeaveDTO): Promise<LeaveRequestDTO>;
}
