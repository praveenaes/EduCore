import { CreateSubjectAssignmentDTO, SubjectAssignmentResponseDTO } from '../../../dto/subject-assignments/subjectAssignmentDtos';

export interface ICreateSubjectAssignmentUseCase {
  execute(dto: CreateSubjectAssignmentDTO): Promise<SubjectAssignmentResponseDTO>;
}
