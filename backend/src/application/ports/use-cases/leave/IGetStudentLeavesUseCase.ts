import { StudentLeavesResponseDTO } from '@/application/dto/leave/leaveDtos';

export interface IGetStudentLeavesUseCase {
  execute(userId: string): Promise<StudentLeavesResponseDTO>;
}
