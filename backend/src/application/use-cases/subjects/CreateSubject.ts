import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ISubjectRepository } from "../../../domain/repositories/ISubjectRepository";
import { Subject } from "../../../domain/entities/Subject";
import { ValidationError } from "@/shared/errors/AppError";
import { ICreateSubject } from "../../ports/use-cases/subjects/ICreateSubjectUseCase";
import { CreateSubjectDTO, SubjectResponseDTO } from "../../dto/subjects/subjectDtos";

@injectable()
export class CreateSubject implements ICreateSubject {
  constructor(
    @inject(TYPES.SubjectRepository) private _subjectRepo: ISubjectRepository
  ) {}

  async execute(dto: CreateSubjectDTO): Promise<SubjectResponseDTO> {
    const existingByCode = await this._subjectRepo.findByCode(dto.code);
    if (existingByCode) {
      throw new ValidationError("Subject with this code already exists.");
    }

    const existingByName = await this._subjectRepo.findByName(dto.name);
    if (existingByName) {
      throw new ValidationError("Subject with this name already exists.");
    }

    const subject = Subject.createNew({
      name: dto.name,
      code: dto.code,
      description: dto.description,
    });

    const saved = await this._subjectRepo.create(subject);

    return {
      id: saved.id!,
      name: saved.name,
      code: saved.code,
      description: saved.description,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
