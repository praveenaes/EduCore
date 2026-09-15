import { CreateSubjectDTO, SubjectResponseDTO } from "@/application/dto/subjects/subjectDtos";

export interface ICreateSubject {
  execute(dto: CreateSubjectDTO): Promise<SubjectResponseDTO>;
}
