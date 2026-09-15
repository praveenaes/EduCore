import { SubjectListResultDTO } from "@/application/dto/subjects/subjectDtos";
import { SubjectFilters, SubjectPagination } from "@/domain/repositories/ISubjectRepository";

export interface IGetSubjects {
  execute(filters: SubjectFilters, pagination: SubjectPagination): Promise<SubjectListResultDTO>;
}
