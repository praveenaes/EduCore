import { SubjectResponseDTO, UpdateSubjectDTO } from "@/application/dto/subjects/subjectDtos";

export interface IUpdateSubject {
  execute(id: string, dto: UpdateSubjectDTO): Promise<SubjectResponseDTO>;
}
