import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import {
  ISubjectRepository,
  SubjectFilters,
  SubjectPagination,
} from "../../../domain/repositories/ISubjectRepository";
import { IGetSubjects } from "../../ports/use-cases/subjects/IGetSubjectsUseCase";
import { SubjectListResultDTO } from "../../dto/subjects/subjectDtos";

@injectable()
export class GetSubjects implements IGetSubjects {
  constructor(
    @inject(TYPES.SubjectRepository) private _subjectRepo: ISubjectRepository
  ) {}

  async execute(
    filters: SubjectFilters,
    pagination: SubjectPagination
  ): Promise<SubjectListResultDTO> {
    const result = await this._subjectRepo.findAll(filters, pagination);

    return {
      subjects: result.subjects.map((subject) => ({
        id: subject.id!,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        isDeleted: subject.isDeleted,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      })),
      total: result.total,
    };
  }
}
