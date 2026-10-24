import { CancelStudentLeaveDTO } from '@/application/dto/leave/leaveDtos';

export interface ICancelStudentLeaveUseCase {
  execute(dto: CancelStudentLeaveDTO): Promise<void>;
}
