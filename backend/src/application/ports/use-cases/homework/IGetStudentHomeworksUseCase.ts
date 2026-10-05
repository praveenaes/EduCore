import {
  GetStudentHomeworksDTO,
  StudentHomeworkListResponseDTO,
} from '@/application/dto/homework/homeworkDtos';

export interface IGetStudentHomeworksUseCase {
  execute(dto: GetStudentHomeworksDTO): Promise<StudentHomeworkListResponseDTO>;
}
