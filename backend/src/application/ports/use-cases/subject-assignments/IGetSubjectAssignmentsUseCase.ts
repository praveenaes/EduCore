import {
  SubjectAssignmentQueryDTO,
  SubjectAssignmentListResultDTO,
  SubjectAssignmentResponseDTO,
} from '../../../dto/subject-assignments/subjectAssignmentDtos';

export interface IGetSubjectAssignmentsUseCase {
  execute(query: SubjectAssignmentQueryDTO): Promise<SubjectAssignmentListResultDTO>;
  getById(id: string): Promise<SubjectAssignmentResponseDTO>;
}
